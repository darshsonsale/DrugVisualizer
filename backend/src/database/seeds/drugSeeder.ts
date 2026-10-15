import type pg from 'pg';

export interface SeedDrug {
  id: string;
  name: string;
  brand_name: string;
  category: string;
  description: string;
  molecular_formula: string;
  half_life_hours: number;
  bioavailability_pct: number;
  cmax_ug_ml: number;
  tmax_hours: number;
  form: string;
  dosage: string;
  indication: string;
  route: string;
  image_url: string;
}

export const SEED_DRUGS: SeedDrug[] = [
  {
    id: 'drug-ibuprofen-001',
    name: 'Ibuprofen',
    brand_name: 'Advil / Motrin (400 mg tablet)',
    category: 'NSAID (Non-Steroidal Anti-Inflammatory Drug)',
    description:
      'Reversible competitive inhibitor of cyclooxygenase enzymes (COX-1 and COX-2), reducing prostaglandin synthesis to deliver targeted relief from pain, inflammation, and fever.',
    molecular_formula: 'C13H18O2',
    half_life_hours: 2.0,
    bioavailability_pct: 88,
    cmax_ug_ml: 25.0,
    tmax_hours: 0.75,
    form: 'Tablets',
    dosage: '400 mg Tablet',
    indication: 'Used for pain, inflammation and fever relief.',
    route: 'Oral Route',
    image_url: '/assets/drugs/ibuprofen.jpg'
  },
  {
    id: 'drug-amoxicillin-002',
    name: 'Amoxicillin',
    brand_name: 'Amoxil (500 mg capsule)',
    category: 'Beta-Lactam Antibiotic (Penicillin Derivative)',
    description:
      'Inhibits bacterial cell wall synthesis by binding to penicillin-binding proteins (PBPs), leading to autolysis and destruction of susceptible Gram-positive and Gram-negative pathogens.',
    molecular_formula: 'C16H19N3O5S',
    half_life_hours: 1.0,
    bioavailability_pct: 75,
    cmax_ug_ml: 8.5,
    tmax_hours: 1.25,
    form: 'Capsules',
    dosage: '500 mg Capsule',
    indication: 'Used to treat bacterial infections.',
    route: 'Oral Route',
    image_url: '/assets/drugs/amoxicillin.jpg'
  },
  {
    id: 'drug-ambroxol-003',
    name: 'Ambroxol Syrup',
    brand_name: 'Mucosolvan (15 mg / 5 ml)',
    category: 'Mucolytic Secretolytic Agent',
    description:
      'Decreases mucus viscosity, stimulates surfactant synthesis by alveolar type II pneumocytes, and enhances ciliary clearance in acute and chronic bronchopulmonary conditions.',
    molecular_formula: 'C13H18Br2N2O',
    half_life_hours: 10.0,
    bioavailability_pct: 79,
    cmax_ug_ml: 12.0,
    tmax_hours: 2.0,
    form: 'Syrups',
    dosage: '15 mg / 5 ml',
    indication: 'Used to relieve cough with mucus by loosening phlegm.',
    route: 'Oral Route',
    image_url: '/assets/drugs/ambroxol.jpg'
  },
  {
    id: 'drug-insulin-004',
    name: 'Insulin',
    brand_name: 'Humalog / Novolog (Regular Human Insulin)',
    category: 'Peptide Hormone (Antidiabetic Agent)',
    description:
      'Binds to insulin tyrosine kinase receptors, triggering GLUT-4 translocation to promote cellular glucose uptake into skeletal muscle and adipose tissue while suppressing hepatic glucose production.',
    molecular_formula: 'C257H383N65O77S6',
    half_life_hours: 0.1,
    bioavailability_pct: 100,
    cmax_ug_ml: 4.5,
    tmax_hours: 0.5,
    form: 'Injections',
    dosage: 'Injection',
    indication: 'Used to manage blood sugar levels in diabetes.',
    route: 'Injection Route',
    image_url: '/assets/drugs/insulin.jpg'
  }
];

export async function seedDrugs(client: pg.PoolClient): Promise<number> {
  for (const d of SEED_DRUGS) {
    await client.query(
      `INSERT INTO drugs (
        id, name, brand_name, category, description, molecular_formula,
        half_life_hours, bioavailability_pct, cmax_ug_ml, tmax_hours,
        form, dosage, indication, route, image_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        brand_name = EXCLUDED.brand_name,
        category = EXCLUDED.category,
        description = EXCLUDED.description,
        molecular_formula = EXCLUDED.molecular_formula,
        half_life_hours = EXCLUDED.half_life_hours,
        bioavailability_pct = EXCLUDED.bioavailability_pct,
        cmax_ug_ml = EXCLUDED.cmax_ug_ml,
        tmax_hours = EXCLUDED.tmax_hours,
        form = EXCLUDED.form,
        dosage = EXCLUDED.dosage,
        indication = EXCLUDED.indication,
        route = EXCLUDED.route,
        image_url = EXCLUDED.image_url;`,
      [
        d.id,
        d.name,
        d.brand_name,
        d.category,
        d.description,
        d.molecular_formula,
        d.half_life_hours,
        d.bioavailability_pct,
        d.cmax_ug_ml,
        d.tmax_hours,
        d.form,
        d.dosage,
        d.indication,
        d.route,
        d.image_url
      ]
    );
  }
  return SEED_DRUGS.length;
}
