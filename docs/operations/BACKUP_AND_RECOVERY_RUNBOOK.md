# PostgreSQL Backup and Recovery Runbook — Drug Path Visualiser (BioLumen)

**Document:** `docs/operations/BACKUP_AND_RECOVERY_RUNBOOK.md`  
**Version:** 1.0.0 (MVP Release v0.1.0-mvp)  
**Status:** Tested & Operational  
**Audience:** Database Administrators, DevOps Engineers, Disaster Recovery Leads  

---

## 1. Overview & Recovery Objectives

This runbook defines the procedures for logical backup, disaster restoration, and recovery verification of the BioLumen PostgreSQL database (`drug_visualizer_prod`).

### Service Level Objectives
- **Recovery Point Objective (RPO):** $< 24\text{ hours}$ for daily logical backups; $< 5\text{ minutes}$ when WAL archiving / PITR is enabled.
- **Recovery Time Objective (RTO):** $< 30\text{ minutes}$ for complete database restoration.

---

## 2. Logical Backup Procedures

### 2.1 Full Database Logical Backup (`pg_dump`)
Execute daily or prior to any major deployment/migration:
```bash
# Set secure environment variables (or use ~/.pgpass)
export PGPASSWORD="<your-database-password>"

# Generate compressed custom-format archive with timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/biolumen"
mkdir -p "$BACKUP_DIR"

pg_dump \
  --host=localhost \
  --port=5432 \
  --username=biolumen_app \
  --format=custom \
  --compress=9 \
  --no-owner \
  --no-privileges \
  --file="${BACKUP_DIR}/biolumen_backup_${TIMESTAMP}.dump" \
  drug_visualizer_prod
```

### 2.2 Automated Daily Backup (Cron Example)
Add to system crontab (`crontab -e`):
```cron
# Execute daily full backup at 02:00 UTC and retain 30 days
0 2 * * * /usr/local/bin/backup_biolumen.sh >> /var/log/biolumen_backup.log 2>&1
```

### 2.3 Off-Site Snapshot Replication
Backups must be encrypted and replicated to off-site cloud storage (e.g. AWS S3 Glacier, GCP Cloud Storage Nearline) with object immutability enabled:
```bash
aws s3 cp "${BACKUP_DIR}/biolumen_backup_${TIMESTAMP}.dump" s3://biolumen-db-backups-prod/ --sse aws:kms
```

---

## 3. Restoration & Disaster Recovery Procedures

> **CRITICAL SAFETY DIRECTIVE:**  
> Verify target database identity before initiating any restore. Never restore over active production without incident commander authorization.

### 3.1 Scenario A: Disaster Recovery to Clean Database
In the event of database corruption or hardware failure:
1. **Provision clean database:**
   ```sql
   CREATE DATABASE drug_visualizer_prod WITH OWNER biolumen_app ENCODING 'UTF8';
   ```
2. **Execute restoration:**
   ```bash
   pg_restore \
     --host=localhost \
     --port=5432 \
     --username=biolumen_app \
     --dbname=drug_visualizer_prod \
     --clean \
     --if-exists \
     --no-owner \
     --no-privileges \
     "${BACKUP_DIR}/biolumen_backup_latest.dump"
   ```
3. **Reconcile row counts across core tables:**
   ```sql
   SELECT 'drugs' AS table_name, count(*) FROM drugs
   UNION ALL
   SELECT 'pathway_nodes', count(*) FROM pathway_nodes
   UNION ALL
   SELECT 'node_content', count(*) FROM node_content
   UNION ALL
   SELECT 'quizzes', count(*) FROM quizzes
   UNION ALL
   SELECT 'users', count(*) FROM users;
   ```

### 3.2 Scenario B: Point-in-Time Recovery (PITR)
- **Infrastructure Requirement:** Requires PostgreSQL WAL archiving (`wal_level = replica`, `archive_mode = on`, and `archive_command = 'test ! -f /wal_archive/%f && cp %p /wal_archive/%f'`).
- **Procedure:**
  1. Restore baseline basebackup.
  2. Create `recovery.signal` in PostgreSQL data directory.
  3. Specify target recovery time in `postgresql.conf`:
     ```ini
     recovery_target_time = '2026-10-22 14:30:00 UTC'
     recovery_target_action = 'promote'
     ```
  4. Start PostgreSQL to replay WAL logs up to the recovery timestamp.

---

## 4. Automated Recovery Verification Evidence

The recovery process is verified via the automated test suite:
```bash
npm run test:recovery (in backend)
```
- **Target Database:** Strictly `drug_visualizer_test` (Zero impact on development or production).
- **Checks Verified:**
  - Database identity invariant verification (`current_database() === 'drug_visualizer_test'`).
  - Catalog schema extraction across all 15 public tables.
  - Ephemeral sandbox table creation, snapshot extraction, disaster loss simulation (truncation), and 100% byte-fidelity restoration.
