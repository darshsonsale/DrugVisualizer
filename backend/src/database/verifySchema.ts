import { getPool, closePool } from './pool.js';

async function verifySchema(): Promise<boolean> {
  const pool = getPool();
  const client = await pool.connect();

  console.log('===================================================');
  console.log(' Task 13: Relational Constraints & Schema Verification');
  console.log('===================================================');

  let allPassed = true;
  await client.query('BEGIN');

  try {
    // 1. Insert valid drug
    await client.query(`
      INSERT INTO drugs (id, name, category, description, bioavailability_pct, half_life_hours)
      VALUES ('test-drug-1', 'Test Drug Alpha', 'Analgesic', 'Test description', 85.5, 2.0);
    `);
    console.log('✔ [1] Valid drug record created');

    // 2. Test Bioavailability constraint (> 100 should fail)
    await client.query('SAVEPOINT sp1');
    try {
      await client.query(`
        INSERT INTO drugs (id, name, category, description, bioavailability_pct)
        VALUES ('test-drug-invalid', 'Test Drug Invalid', 'Analgesic', 'Test', 150.0);
      `);
      console.error('❌ Failed: Bioavailability > 100 did not reject');
      allPassed = false;
    } catch (e: unknown) {
      await client.query('ROLLBACK TO SAVEPOINT sp1');
      const err = e as Error;
      if (err.message.includes('bioavailability_pct')) {
        console.log('✔ [2] Bioavailability range constraint (0-100%) enforced');
      } else {
        throw err;
      }
    }

    // 3. Insert valid pathways
    await client.query(`
      INSERT INTO pathways (id, drug_id, name, description)
      VALUES 
        ('path-1', 'test-drug-1', 'Oral Absorption', 'Pathway 1'),
        ('path-2', 'test-drug-1', 'IV Route', 'Pathway 2');
    `);
    console.log('✔ [3] Valid pathways created with FK to drug');

    // 4. Test unique (drug_id, name) constraint
    await client.query('SAVEPOINT sp2');
    try {
      await client.query(`
        INSERT INTO pathways (id, drug_id, name)
        VALUES ('path-dup', 'test-drug-1', 'Oral Absorption');
      `);
      console.error('❌ Failed: Duplicate (drug_id, name) did not reject');
      allPassed = false;
    } catch (e: unknown) {
      await client.query('ROLLBACK TO SAVEPOINT sp2');
      const err = e as Error;
      if (err.message.includes('uq_pathways_drug_name')) {
        console.log('✔ [4] Unique (drug_id, name) constraint enforced');
      } else {
        throw err;
      }
    }

    // 5. Insert valid pathway nodes for path-1 and path-2
    await client.query(`
      INSERT INTO pathway_nodes (id, pathway_id, node_order, name, anatomical_location, organ_system, estimated_time_minutes)
      VALUES 
        ('node-1', 'path-1', 1, 'Mouth', 'Oral Cavity', 'Digestive', 1.0),
        ('node-2', 'path-1', 2, 'Stomach', 'Gastric Cavity', 'Digestive', 30.0),
        ('node-other-path', 'path-2', 1, 'Vein', 'Venous Site', 'Circulatory', 0.5);
    `);
    console.log('✔ [5] Valid pathway nodes created with FK to pathway');

    // 6. Test node order constraint (order > 0)
    await client.query('SAVEPOINT sp3');
    try {
      await client.query(`
        INSERT INTO pathway_nodes (id, pathway_id, node_order, name, anatomical_location, organ_system)
        VALUES ('node-invalid-order', 'path-1', 0, 'Invalid', 'Loc', 'Sys');
      `);
      console.error('❌ Failed: node_order <= 0 did not reject');
      allPassed = false;
    } catch (e: unknown) {
      await client.query('ROLLBACK TO SAVEPOINT sp3');
      const err = e as Error;
      if (err.message.includes('node_order')) {
        console.log('✔ [6] Node order positive constraint (node_order > 0) enforced');
      } else {
        throw err;
      }
    }

    // 7. Insert valid node content (1:1 with pathway_node)
    await client.query(`
      INSERT INTO node_content (id, node_id, general_description, physiological_role, key_cellular_mechanisms, micro_environment_ph)
      VALUES ('content-1', 'node-1', 'Oral entry description', 'Gateway', ARRAY['Amylase breakdown'], 6.8);
    `);
    console.log('✔ [7] Node content stored separately from graph topology (1:1 FK to node)');

    // 8. Test micro_environment_ph range (0 to 14)
    await client.query('SAVEPOINT sp4');
    try {
      await client.query(`
        INSERT INTO node_content (id, node_id, general_description, physiological_role, micro_environment_ph)
        VALUES ('content-invalid-ph', 'node-2', 'Stomach description', 'Breakdown', 16.5);
      `);
      console.error('❌ Failed: pH > 14 did not reject');
      allPassed = false;
    } catch (e: unknown) {
      await client.query('ROLLBACK TO SAVEPOINT sp4');
      const err = e as Error;
      if (err.message.includes('micro_environment_ph')) {
        console.log('✔ [8] Micro-environment pH range constraint (0-14) enforced');
      } else {
        throw err;
      }
    }

    // 9. Insert valid within-pathway edge (node-1 -> node-2 in path-1)
    await client.query(`
      INSERT INTO pathway_edges (id, pathway_id, from_node_id, to_node_id, transition_description, transition_duration_minutes)
      VALUES ('edge-1', 'path-1', 'node-1', 'node-2', 'Esophageal transit', 0.5);
    `);
    console.log('✔ [9] Valid within-pathway edge created');

    // 10. Cross-pathway edge rejection: attempt to connect node-1 (path-1) with node-other-path (path-2) in path-1
    await client.query('SAVEPOINT sp5');
    try {
      await client.query(`
        INSERT INTO pathway_edges (id, pathway_id, from_node_id, to_node_id)
        VALUES ('edge-cross-path', 'path-1', 'node-1', 'node-other-path');
      `);
      console.error('❌ Failed: Cross-pathway edge was not rejected!');
      allPassed = false;
    } catch (e: unknown) {
      await client.query('ROLLBACK TO SAVEPOINT sp5');
      const err = e as Error & { code?: string };
      if (err.code === '23503' || err.message.includes('fk_pathway_edges_to_node')) {
        console.log('✔ [10] Cross-pathway edge strictly rejected by composite foreign key (pathway_id, to_node_id)');
      } else {
        throw err;
      }
    }

    // 11. Self-loop edge rejection: attempt to connect node-1 to node-1
    await client.query('SAVEPOINT sp6');
    try {
      await client.query(`
        INSERT INTO pathway_edges (id, pathway_id, from_node_id, to_node_id)
        VALUES ('edge-self-loop', 'path-1', 'node-1', 'node-1');
      `);
      console.error('❌ Failed: Self-loop was not rejected!');
      allPassed = false;
    } catch (e: unknown) {
      await client.query('ROLLBACK TO SAVEPOINT sp6');
      const err = e as Error;
      if (err.message.includes('chk_pathway_edges_no_self_loops')) {
        console.log('✔ [11] Self-loop edge strictly rejected by CHECK constraint (from_node_id <> to_node_id)');
      } else {
        throw err;
      }
    }

    // 12. Trigger test: verify updated_at timestamp advances automatically upon UPDATE
    const beforeRes = await client.query<{ updated_at: Date }>('SELECT updated_at FROM drugs WHERE id = $1;', ['test-drug-1']);
    const beforeTime = new Date(beforeRes.rows[0].updated_at).getTime();

    await new Promise((r) => setTimeout(r, 60));
    await client.query("UPDATE drugs SET brand_name = 'Updated Brand Name' WHERE id = $1;", ['test-drug-1']);

    const afterRes = await client.query<{ updated_at: Date }>('SELECT updated_at FROM drugs WHERE id = $1;', ['test-drug-1']);
    const afterTime = new Date(afterRes.rows[0].updated_at).getTime();

    if (afterTime > beforeTime) {
      console.log('✔ [12] Trigger set_updated_at_timestamp automatically updates updated_at on UPDATE');
    } else {
      console.error('❌ Failed: updated_at was not updated by trigger');
      allPassed = false;
    }

    console.log('\n===================================================');
    console.log(allPassed ? '✅ All 12 schema checks passed successfully!' : '❌ Some checks failed.');
    console.log('===================================================\n');
  } finally {
    // Always rollback so no test data remains
    await client.query('ROLLBACK');
    console.log('ℹ️  Transaction rolled back cleanly. No test data remains in the database.\n');
    client.release();
    await closePool();
  }

  return allPassed;
}

verifySchema()
  .then((passed) => process.exit(passed ? 0 : 1))
  .catch((err) => {
    console.error('Fatal test error:', err);
    process.exit(1);
  });
