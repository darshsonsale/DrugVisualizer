/**
 * Drug Path Visualiser (BioLumen) - Task 27 Integration Test Fixtures
 *
 * Provides deterministic datasets, expected values, and test payloads
 * for all 4 supported medicines, food conditions, quiz grading, and progress persistence.
 */

export interface TestDrugFixture {
  id: string;
  slug: string;
  name: string;
  form: string;
  route: string;
  nodeCount: number;
  expectedTmaxBeforeFood: number;
  expectedTmaxAfterFood: number;
  isFoodIndependent: boolean;
  quizId: string;
  pathwayId: string;
}

export const SUPPORTED_DRUGS: Record<string, TestDrugFixture> = {
  ibuprofen: {
    id: 'drug-ibuprofen-001',
    slug: 'ibuprofen',
    name: 'Ibuprofen',
    form: 'Tablets',
    route: 'Oral Route',
    nodeCount: 7,
    expectedTmaxBeforeFood: 0.75,
    expectedTmaxAfterFood: 2.5,
    isFoodIndependent: false,
    quizId: 'quiz-ibuprofen-001',
    pathwayId: 'pathway-ibuprofen-fasting'
  },
  amoxicillin: {
    id: 'drug-amoxicillin-002',
    slug: 'amoxicillin',
    name: 'Amoxicillin',
    form: 'Capsules',
    route: 'Oral Route',
    nodeCount: 7,
    expectedTmaxBeforeFood: 1.25,
    expectedTmaxAfterFood: 1.8,
    isFoodIndependent: false,
    quizId: 'quiz-amoxicillin-002',
    pathwayId: 'pathway-amox-fasting'
  },
  ambroxol: {
    id: 'drug-ambroxol-003',
    slug: 'ambroxol',
    name: 'Ambroxol Hydrochloride',
    form: 'Oral Liquid (Syrup)',
    route: 'Oral Route',
    nodeCount: 8,
    expectedTmaxBeforeFood: 2.0,
    expectedTmaxAfterFood: 2.5,
    isFoodIndependent: false,
    quizId: 'quiz-ambroxol-003',
    pathwayId: 'pathway-ambroxol-fasting'
  },
  insulin: {
    id: 'drug-insulin-004',
    slug: 'insulin',
    name: 'Regular Human Insulin',
    form: 'Solution for Injection',
    route: 'Subcutaneous Injection',
    nodeCount: 5,
    expectedTmaxBeforeFood: 0.5,
    expectedTmaxAfterFood: 0.5, // Food independent
    isFoodIndependent: true,
    quizId: 'quiz-insulin-004',
    pathwayId: 'pathway-insulin-fasting'
  }
};

export const INTEGRATION_TEST_USERS = {
  learnerAlice: {
    id: 'test-int-learner-alice',
    email: 'int_alice@test.local',
    name: 'Integration Learner Alice',
    password: 'AliceStrongPassword123!',
    role: 'learner' as const
  },
  learnerBob: {
    id: 'test-int-learner-bob',
    email: 'int_bob@test.local',
    name: 'Integration Learner Bob',
    password: 'BobStrongPassword123!',
    role: 'learner' as const
  },
  adminCarol: {
    id: 'test-int-admin-carol',
    email: 'int_carol@test.local',
    name: 'Integration Admin Carol',
    password: 'CarolStrongAdminPassword123!',
    role: 'admin' as const
  }
};

export const INVALID_FOOD_CONDITIONS = [
  'WITH_ALCOHOL',
  'DURING_SNACK',
  'FASTING_24H',
  'RANDOM_STRING',
  '123'
] as const;

export const TEST_NODE_UPDATE_PAYLOAD = {
  general_description: 'Integration test updated general description for medical review testing.',
  physiological_role: 'Integration test physiological role highlighting epithelial crossing mechanisms.',
  key_takeaway: 'Integration test takeaway: rapid absorption requires optimal hydration.',
  key_cellular_mechanisms: ['Passive diffusion', 'Carrier-mediated transcellular transport'],
  micro_environment_ph: 6.8,
  defined_terms: [
    { term: 'Bioavailability', definition: 'The fraction of administered drug reaching systemic circulation.' }
  ],
  references_list: ['Goodman & Gilman 14th Ed, Chapter 2']
};
