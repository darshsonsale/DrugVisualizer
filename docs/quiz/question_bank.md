# BioLumen Clinical Question Bank Documentation & Scientific Provenance

This document specifies the scientific and pedagogical rationale for the 20 assessment questions across all four core medicines in the **Drug Path Visualiser (BioLumen)** application.

## Governance & Confidentiality Rules
1. **Server-Side Exclusivity**: Correct answers (`is_correct: true`) and pedagogical rationales (`explanation`) are maintained strictly in the backend repository and PostgreSQL database. They must never be bundled into client builds or returned in pre-submission API responses.
2. **Review Flags**: In accordance with project instructions, all options are initialized with `needs_scientific_review = true`.
3. **Simulation vs. Clinical Reality**: Where operational simulation markers are employed in the visualizer (e.g., `tmax_hours = 0.5` onset marker for Insulin, or ~15-minute liquid gastric transit approximation for Ambroxol), questions explicitly test the student's clinical literacy in distinguishing model parameters from established pharmacokinetics.

---

## 1. Ibuprofen Assessment (`quiz-ibuprofen-001`)
*Drug ID: `drug-ibuprofen-001` | Pass Threshold: 70.0%*

### Question 1 (`q1`) — Chiral Inversion & First-Pass Metabolism
- **Text**: Which organ is primarily responsible for the first-pass metabolism and chiral inversion of orally administered Ibuprofen?
- **Correct Option**: `opt1-b` ("Liver (hepatic epimerase & CYP2C9)")
- **Scientific Rationale**: Ibuprofen is administered as a racemic 50:50 mixture. In the liver, the stereospecific enzyme 2-arylpropionyl-CoA epimerase converts approximately 60% of the inactive (R)-enantiomer into the anti-inflammatory active (S)-enantiomer via a CoA-thioester intermediate. CYP2C9 further oxidizes the molecule into 2-hydroxy and 2-carboxy metabolites.
- **Primary Source**: Hao et al., *Chiral inversion of 2-arylpropionic acid NSAIDs*, PMID: [15743977](https://pubmed.ncbi.nlm.nih.gov/15743977/); Davies, *Clinical Pharmacokinetics of Ibuprofen*, PMID: [9553754](https://pubmed.ncbi.nlm.nih.gov/9553754/).

### Question 2 (`q2`) — Food Intake & Gastric Emptying
- **Text**: How does taking Ibuprofen after a meal influence its pharmacokinetics?
- **Correct Option**: `opt2-b` ("It delays gastric emptying, prolonging Tmax without significantly altering total AUC")
- **Scientific Rationale**: Food content delays gastric emptying, slowing the rate of transit into the small intestine where absorption occurs. This prolongs peak plasma concentration ($T_{\max}$) from ~1–1.5 hours to ~2.5–3.0 hours while maintaining total systemic bioavailability (AUC ~85–90%).
- **Primary Source**: Koenigbauer et al., *Food effect on ibuprofen absorption*, PMID: [18193098](https://pubmed.ncbi.nlm.nih.gov/18193098/); FDA NDA 018989 Label.

### Question 3 (`q3`) — Anti-Inflammatory Molecular Mechanism
- **Text**: What is the primary molecular mechanism responsible for the analgesic and anti-inflammatory activity of (S)-ibuprofen?
- **Correct Option**: `opt3-a` ("Reversible competitive inhibition of cyclooxygenase enzymes (COX-1 and COX-2)")
- **Scientific Rationale**: (S)-Ibuprofen reversibly blocks the arachidonic acid substrate-binding channel of both cyclooxygenase-1 (COX-1) and cyclooxygenase-2 (COX-2), terminating the enzymatic synthesis of pro-inflammatory prostaglandins (PGE2, PGF2α) and thromboxanes.
- **Primary Source**: Vane & Botting, *Mechanism of action of anti-inflammatory drugs*, PMID: [10749874](https://pubmed.ncbi.nlm.nih.gov/10749874/).

### Question 4 (`q4`) — Plasma Albumin Binding
- **Text**: In systemic circulation, how is Ibuprofen predominantly transported within human blood plasma?
- **Correct Option**: `opt4-a` ("Extensively bound to serum albumin (>99% protein binding)")
- **Scientific Rationale**: Ibuprofen is >99% bound to serum albumin at therapeutic concentrations. Due to high binding affinity, its volume of distribution is restricted to ~0.12–0.15 L/kg.
- **Primary Source**: Davies, *Clinical Pharmacokinetics of Ibuprofen*, PMID: [9553754](https://pubmed.ncbi.nlm.nih.gov/9553754/).

### Question 5 (`q5`) — Renal Excretion Profile
- **Text**: What is the principal elimination pathway for Ibuprofen in healthy human physiology?
- **Correct Option**: `opt5-b` ("Glomerular filtration of oxidative (carboxy/hydroxy) and glucuronide metabolites into urine")
- **Scientific Rationale**: Over 90% of an administered dose of ibuprofen is cleared by the kidneys as inactive glucuronide conjugates and CYP2C9 oxidative metabolites (2-hydroxy-ibuprofen, 2-carboxy-ibuprofen). Less than 1% is excreted unchanged.
- **Primary Source**: Davies, PMID: [9553754](https://pubmed.ncbi.nlm.nih.gov/9553754/); FDA NDA 018989.

---

## 2. Amoxicillin Assessment (`quiz-amoxicillin-002`)
*Drug ID: `drug-amoxicillin-002` | Pass Threshold: 70.0%*

### Question 1 (`amox-q1`) — Beta-Lactam Bactericidal Action
- **Text**: What is the primary bactericidal mechanism of action of Amoxicillin?
- **Correct Option**: `amox-opt1-a` ("Inhibition of bacterial cell wall peptidoglycan synthesis via penicillin-binding protein (PBP) binding")
- **Scientific Rationale**: Amoxicillin acylates transpeptidase domains of penicillin-binding proteins (PBP-1A, 1B, 2), halting peptidoglycan cross-linking and activating autolytic enzymes that lyse growing bacteria.
- **Primary Source**: FDA NDA 050542 Prescribing Information; Waxman & Strominger, PMID: [6343399](https://pubmed.ncbi.nlm.nih.gov/6343399/).

### Question 2 (`amox-q2`) — Active Intestinal Transport (PEPT1)
- **Text**: How is Amoxicillin primarily absorbed from the lumen of the proximal small intestine into enterocytes?
- **Correct Option**: `amox-opt2-a` ("Saturable, carrier-mediated active uptake via the peptide transporter PEPT1 (SLC15A1)")
- **Scientific Rationale**: Amoxicillin is a zwitterionic beta-lactam mimicking dipeptides. It is actively transported across apical enterocyte membranes in the duodenum and jejunum by the proton-coupled oligopeptide transporter 1 (PEPT1 / SLC15A1), yielding high absolute oral bioavailability (~75–90%).
- **Primary Source**: Bretschneider et al., *PEPT1-mediated transport of beta-lactams*, PMID: [10777536](https://pubmed.ncbi.nlm.nih.gov/10777536/); DOI: [10.1016/S0169-409X(00)00067-2](https://doi.org/10.1016/S0169-409X(00)00067-2).

### Question 3 (`amox-q3`) — Bioavailability & Food Independence
- **Text**: What is the established clinical effect of food intake on the oral bioavailability of Amoxicillin?
- **Correct Option**: `amox-opt3-b` ("Food does not significantly alter total systemic absorption (AUC), allowing administration with or without meals")
- **Scientific Rationale**: Total systemic exposure ($AUC$) of amoxicillin is not significantly altered by concurrent food ingestion. It may be administered without regard to meals, and co-administration with food is commonly recommended to decrease gastrointestinal irritation.
- **Primary Source**: Welling et al., PMID: [2908858](https://pubmed.ncbi.nlm.nih.gov/2908858/); FDA NDA 050542.

### Question 4 (`amox-q4`) — Tubular Secretion & Clearance
- **Text**: Through which physiological mechanism is the majority of active Amoxicillin eliminated from systemic circulation?
- **Correct Option**: `amox-opt4-a` ("Renal elimination of unchanged drug (60–80%) via glomerular filtration and organic anion tubular secretion")
- **Scientific Rationale**: Approximately 60–80% of an oral dose of amoxicillin is excreted unchanged in the urine within 6 to 8 hours by combined glomerular filtration and active tubular secretion via organic anion transporters (OAT), which is competitively inhibited by probenecid.
- **Primary Source**: Spyker et al., PMID: [5063071](https://pubmed.ncbi.nlm.nih.gov/5063071/); FDA NDA 050542.

### Question 5 (`amox-q5`) — Beta-Lactamase Resistance
- **Text**: What is the primary mechanism of bacterial resistance that inactivates Amoxicillin monotherapy?
- **Correct Option**: `amox-opt5-a` ("Production of beta-lactamase enzymes that hydrolyze the beta-lactam ring")
- **Scientific Rationale**: Bacterial beta-lactamases hydrolyze the four-membered beta-lactam ring of amoxicillin, producing inactive penicilloic acid. Co-formulation with clavulanic acid inhibits these enzymes, restoring efficacy against resistant strains.
- **Primary Source**: Drawz & Bonomo, PMID: [20179178](https://pubmed.ncbi.nlm.nih.gov/20179178/).

---

## 3. Ambroxol Syrup Assessment (`quiz-ambroxol-003`)
*Drug ID: `drug-ambroxol-003` | Pass Threshold: 70.0%*

### Question 1 (`amb-q1`) — Pulmonary Surfactant Stimulation
- **Text**: What is the primary pharmacodynamic secretolytic mechanism of Ambroxol in the respiratory tract?
- **Correct Option**: `amb-opt1-a` ("Stimulation of pulmonary surfactant production by alveolar type II pneumocytes and serous bronchial gland secretion")
- **Scientific Rationale**: Ambroxol stimulates type II alveolar pneumocytes to produce and excrete pulmonary surfactant, decreasing mucus viscosity, reducing surface tension, and increasing ciliary beat frequency.
- **Primary Source**: Malerba & Ragnoli, PMID: [18567543](https://pubmed.ncbi.nlm.nih.gov/18567543/); DOI: [10.1517/14656566.9.8.1341](https://doi.org/10.1517/14656566.9.8.1341).

### Question 2 (`amb-q2`) — Lysosomotropic Tissue Tropism
- **Text**: Following oral administration of Ambroxol syrup, how does its tissue distribution profile characterize its respiratory efficacy?
- **Correct Option**: `amb-opt2-a` ("High volume of distribution with significant tissue accumulation in lung parenchyma (lung-to-plasma ratio > 2.5)")
- **Scientific Rationale**: Because of basic amine lysosomal trapping (lysosomotropism), ambroxol exhibits a high volume of distribution (~550 L) and concentrates selectively in lung tissue, where concentrations exceed plasma by 2.5 to 5-fold.
- **Primary Source**: Stenzhorn et al., PMID: [10741639](https://pubmed.ncbi.nlm.nih.gov/10741639/); Cazan et al., PMID: [29277717](https://pubmed.ncbi.nlm.nih.gov/29277717/).

### Question 3 (`amb-q3`) — Systemic Absorption & Model Clarification
- **Text**: What are the verified clinical pharmacokinetic absorption parameters for oral Ambroxol syrup in fasting adults?
- **Correct Option**: `amb-opt3-a` ("Rapid systemic absorption with peak plasma concentration (Tmax) achieved at 1.0 to 2.5 hours and absolute bioavailability of ~70–80%")
- **Scientific Rationale**: Clinical trials confirm rapid oral absorption with peak plasma levels attained between 1.0 and 2.5 hours post-dose, with ~70–80% absolute bioavailability. *(Note: Liquid gastric transit of ~15 min in the visualizer is an educational simulation approximation).*
- **Primary Source**: EMA Assessment Report (EMA/229049/2015); Couet et al., PMID: [2664988](https://pubmed.ncbi.nlm.nih.gov/2664988/).

### Question 4 (`amb-q4`) — CYP3A4 Biotransformation
- **Text**: Which enzymatic pathway accounts for the major hepatic first-pass metabolism of Ambroxol?
- **Correct Option**: `amb-opt4-a` ("CYP3A4-mediated oxidation and glucuronidation into dibromoanthranilic acid and polar conjugates")
- **Scientific Rationale**: Hepatic metabolism proceeds primarily through CYP3A4-dependent oxidative cleavage into dibromoanthranilic acid and glucuronidation.
- **Primary Source**: Ishiguro et al., PMID: [11092113](https://pubmed.ncbi.nlm.nih.gov/11092113/).

### Question 5 (`amb-q5`) — Renal Excretion of Metabolites
- **Text**: How are Ambroxol and its biotransformation products cleared from the human body?
- **Correct Option**: `amb-opt5-a` ("Renal excretion of polar water-soluble metabolites (~85–90%), with less than 10% cleared as unchanged parent drug")
- **Scientific Rationale**: Over 85% of ambroxol is cleared through the kidneys as polar water-soluble metabolites; unchanged parent drug constitutes less than 10% of urinary excretion.
- **Primary Source**: EMA/229049/2015; Malerba & Ragnoli, PMID: [18567543](https://pubmed.ncbi.nlm.nih.gov/18567543/).

---

## 4. Regular Human Insulin Assessment (`quiz-insulin-004`)
*Drug ID: `drug-insulin-004` | Pass Threshold: 70.0%*

### Question 1 (`ins-q1`) — Insulin Receptor Tyrosine Kinase Activation
- **Text**: What is the initial molecular event triggered by Regular Human Insulin binding to target cells?
- **Correct Option**: `ins-opt1-a` ("Binding to extracellular alpha-subunits activating beta-subunit tyrosine kinase auto-phosphorylation and IRS recruitment")
- **Scientific Rationale**: Insulin binds to the alpha-subunits of the tetrameric insulin receptor, relieving inhibition on intracellular beta-subunits. The beta-subunits transphosphorylate each other, activating intrinsic tyrosine kinase activity and recruiting IRS-1/2 to stimulate PI3K-Akt signaling and GLUT4 translocation.
- **Primary Source**: Saltiel & Kahn, PMID: [11586364](https://pubmed.ncbi.nlm.nih.gov/11586364/); DOI: [10.1038/35093538](https://doi.org/10.1038/35093538).

### Question 2 (`ins-q2`) — Hexamer Dissociation & Delayed Onset
- **Text**: Why does subcutaneously administered Regular Human Insulin exhibit an onset of 30–60 minutes rather than immediate action?
- **Correct Option**: `ins-opt2-a` ("Zinc-stabilized hexamers in the formulation must dissociate into dimers and monomers before entering capillary fenestrations")
- **Scientific Rationale**: Regular insulin is formulated as zinc-stabilized hexamers (~36 kDa), which are too large to rapidly cross endothelial capillary fenestrations. Absorption is rate-limited by self-dissociation into dimeric and monomeric forms (~5.8 kDa), resulting in an onset delay of 30–60 minutes.
- **Primary Source**: Heinemann, PMID: [11985338](https://pubmed.ncbi.nlm.nih.gov/11985338/); FDA NDA 018780 (Humulin R Label).

### Question 3 (`ins-q3`) — Hepatic and Renal Clearance
- **Text**: Which two primary organs account for the physiological clearance and degradation of circulating Insulin?
- **Correct Option**: `ins-opt3-a` ("Liver (receptor-mediated endocytosis and IDE) and Kidneys (glomerular filtration and proximal tubular degradation)")
- **Scientific Rationale**: For subcutaneous insulin administration, the liver clears ~40–50% and the kidneys clear ~30–40% via insulin-degrading enzyme (IDE) and receptor-mediated endocytosis followed by proximal tubular reabsorption.
- **Primary Source**: Duckworth et al., PMID: [9839446](https://pubmed.ncbi.nlm.nih.gov/9839446/); Rabkin et al., PMID: [17478553](https://pubmed.ncbi.nlm.nih.gov/17478553/).

### Question 4 (`ins-q4`) — Oral Inactivation & Route Limitation
- **Text**: Why is Regular Human Insulin ineffective when administered via the oral gastrointestinal route?
- **Correct Option**: `ins-opt4-a` ("Rapid enzymatic proteolysis by gastric pepsin and pancreatic serine proteases (trypsin, chymotrypsin) combined with low mucosal permeability")
- **Scientific Rationale**: Insulin is rapidly broken down by gastric pepsin and pancreatic serine proteases (trypsin, chymotrypsin) into inactive peptide fragments. Intact insulin also exhibits virtually zero passive paracellular permeability across the intestinal epithelium (<0.1%).
- **Primary Source**: Carino & Mathiowitz, PMID: [10099587](https://pubmed.ncbi.nlm.nih.gov/10099587/); FDA NDA 018780.

### Question 5 (`ins-q5`) — Educational Tmax Parameter vs. Clinical Peak
- **Text**: In the visualizer catalog, tmax_hours for Regular Insulin is recorded as 0.5 hours. How does this model parameter relate to clinical pharmacodynamics?
- **Correct Option**: `ins-opt5-a` ("The 0.5-hour value represents the clinical absorption onset marker in the simulation, whereas peak clinical metabolic effect occurs at 1.5 to 3.5 hours")
- **Scientific Rationale**: The BioLumen database stores `tmax_hours = 0.5` as an operational onset simulation parameter. In human clinical pharmacodynamics, peak hypoglycemic activity occurs 1.5 to 3.5 hours post-subcutaneous injection.
- **Primary Source**: FDA NDA 018780 Label; Heinemann, PMID: [11985338](https://pubmed.ncbi.nlm.nih.gov/11985338/); BioLumen Architecture Specification.
