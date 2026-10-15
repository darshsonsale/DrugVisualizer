# Condition-Specific Educational Content & Multi-Drug Dynamics (Task 22)

## 1. Overview
In the Drug Path Visualiser MVP, educational pathways illustrate drug transit through human physiological organ systems under two distinct gastrointestinal regimens:
- `BEFORE_FOOD`: Fasted state administration (empty stomach baseline).
- `AFTER_FOOD`: Fed state administration (co-ingestion or postprandial administration with meals).

All condition-specific content, transit modifiers, and observations are dynamically retrieved from the PostgreSQL database (`pathway_variations` and `node_variations` tables) rather than hardcoded in application logic.

---

## 2. Scientific Traceability & Pharmacokinetic Basis

Every numerical modifier and clinical observation is grounded in cited pharmacology literature and explicitly tagged with `review_status = 'FLAGGED_FOR_SCIENTIFIC_REVIEW'`.

### 2.1. Ibuprofen (Oral Tablet)
- **Primary References**:
  - Davies NM. Clinical Pharmacokinetics of Ibuprofen: The First 30 Years. *Clin Pharmacokinet*. 1998;34(2):101-154. [PMID: 9553549](https://pubmed.ncbi.nlm.nih.gov/9553549/)
  - Dewland PM, Reader S, Berry P. Bioavailability of oral ibuprofen: fasted vs fed states. *BMC Clin Pharmacol*. 2009;9:19.
  - FDA NDA 017463 (Motrin / Ibuprofen Oral Tablets).
- **Gastric Phase Dynamics**:
  - *Fasted*: Baseline gastric residence time is ~15 minutes.
  - *Fed*: Solid food stimulates neurohumoral pyloric closure and gastric trituration, delaying emptying. Model transit modifier: `+300%` (15 min $\to$ 60 min).
  - *Clinical Note*: Food delays the time to peak plasma concentration ($T_{\max}$ shifts from ~0.75–1.5 h to ~2.0–3.0 h) without significantly reducing total area under the curve (AUC / total bioavailability ~88%). Administering with food buffers direct gastric mucosal cyclooxygenase-1 (COX-1) inhibition and contact irritation.
- **Intestinal Uptake**:
  - Model transit modifier: `+25%`; absorption modifier: `-5%` (educational modeling approximation illustrating slight blunting of peak absorption rate, not malabsorption).

### 2.2. Amoxicillin (Oral Capsule)
- **Primary References**:
  - Westphal JF, Deslandes A, Brogard JM. Influence of food on the bioavailability of amoxicillin and clavulanic acid. *J Antimicrob Chemother*. 1994;34(2):227-238. [PMID: 7984282](https://pubmed.ncbi.nlm.nih.gov/7984282/)
  - Gordon RC, Regamey C, Kirby WM. Serum levels of amoxicillin and ampicillin after oral administration in man. *Antimicrob Agents Chemother*. 1972;1(6):504-507. [PMID: 4628862](https://pubmed.ncbi.nlm.nih.gov/4628862/)
  - FDA NDA 050542 (Amoxicillin Capsules).
- **Gastric Phase Dynamics**:
  - *Fasted*: Baseline transit time is ~20 minutes.
  - *Fed*: Food slows stomach emptying; model transit modifier: `+150%` (20 min $\to$ 50 min).
- **Intestinal Phase Dynamics**:
  - Uptake via the proton-coupled oligopeptide transporter PEPT1 (SLC15A1). Total oral bioavailability remains high (~75–80%) regardless of meal intake. Taking with or after meals mitigates antibiotic-associated nausea without compromising bactericidal therapeutic levels. Absorption modifier is `0%`.

### 2.3. Ambroxol Syrup (Oral Solution)
- **Primary References**:
  - Vergin H, Bishop-Freudling GB. Investigation of the pharmacokinetics and bioavailability of ambroxol in humans. *Arzneimittelforschung*. 1985;35(10):1586-1591.
  - European Medicines Agency (EMA). Ambroxol and Bromhexine Containing Medicines Assessment Report. EMA/CHMP/631317/2014.
- **Gastric Phase Dynamics**:
  - *Fasted*: Oral liquid transit through the stomach is rapid (~10 minutes).
  - *Fed*: Solid meal retention slows the liquid phase gastric emptying; model modifier: `+100%` (10 min $\to$ 20 min). Total systemic bioavailability is ~70–80%, unaffected by food. Absorption modifier is `0%`.

### 2.4. Regular Human Insulin (Subcutaneous Injection)
- **Primary References**:
  - FDA NDA 018780 (Humulin R - Human Insulin [rDNA origin] Injection).
  - Heinemann L. Variability of Insulin Absorption and Action. *J Diabetes Sci Technol*. 2008;2(6):1068-1075.
  - Kang S, Owens DR, Vora JP, Brange J. Comparison of subcutaneous soluble human insulin and insulin lispro. *Diabetes Care*. 1991;14(7):571-577. [PMID: 1797491](https://pubmed.ncbi.nlm.nih.gov/1797491/)
- **Parenteral Limitation & Food Independence**:
  - Subcutaneous injection deposits insulin hexamers directly into the subcutaneous interstitial space. Its absorption depends strictly on local vascular perfusion, temperature, exercise, and hexamer-to-monomer dissociation kinetics.
  - **GI tract contents have ZERO physiological effect on subcutaneous depot absorption.**
  - All 5 nodes have `transit_time_modifier_pct = 0%` and `absorption_modifier_pct = 0%` across both `BEFORE_FOOD` and `AFTER_FOOD`.
- **Clarification of Stored Catalog Data Semantics**:
  - The database column `drugs.tmax_hours = 0.5` represents the **clinical action onset** (the 30-minute preprandial window during which injected regular insulin begins exerting its hypoglycemic effect).
  - True maximal circulating concentration ($T_{\max}$) occurs at **1.5–3.5 hours**.
  - Total effective glucose-lowering duration is **6–8 hours**.
  - The stored database column remains unchanged to preserve API contract stability, while educational interfaces clearly present this distinction.

---

## 3. Dynamic Calculation Formula

For each pathway node $i$ joined with its corresponding `node_variations` row under condition $C$:

$$\text{effectiveEstimatedTime}_i = \begin{cases} 
\text{round}\left(\text{baseEstimatedTime}_i \times \left(1 + \frac{\text{transit\_modifier\_pct}}{100}\right)\right), & \text{if } \text{transit\_modifier\_pct} \neq 0 \\
\text{baseEstimatedTime}_i, & \text{if } \text{transit\_modifier\_pct} = 0 
\end{cases}$$

This formula executes dynamically in `PathwaysService` and `ContentService`, eliminating any hardcoded node ID checks.

---

## 4. Graph Topology Invariance

For every medicine, the node set $\{N\}$ and directed edge set $\{E\}$ are invariant under condition changes:
- **Ibuprofen**: 7 nodes, 6 edges in both `BEFORE_FOOD` and `AFTER_FOOD`.
- **Amoxicillin**: 7 nodes, 6 edges in both `BEFORE_FOOD` and `AFTER_FOOD`.
- **Ambroxol Syrup**: 8 nodes, 7 edges in both `BEFORE_FOOD` and `AFTER_FOOD`.
- **Insulin**: 5 nodes, 4 edges in both `BEFORE_FOOD` and `AFTER_FOOD`.

---

## 5. API Reference

### 5.1. `GET /api/v1/content/drugs/:drugId?condition=AFTER_FOOD`
Retrieves comprehensive educational content with condition variations joined from PostgreSQL.

- **Query Parameters**:
  - `condition` *(optional)*: `BEFORE_FOOD` (default) | `AFTER_FOOD`.
- **Error Codes**:
  - `400 INVALID_FOOD_CONDITION`: Provided when `condition` is not in allowed enum.
  - `404 NOT_FOUND`: Provided when drug identifier is unmapped.
