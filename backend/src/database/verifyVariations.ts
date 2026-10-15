import { getPool, closePool } from './pool.js';
import {
  isValidFoodCondition,
  validateFoodCondition,
  InvalidFoodConditionError
} from '../modules/pathways/validation/condition.validation.js';

async function verifyVariations(): Promise<boolean> {
  const pool = getPool();
  const client = await pool.connect();

  console.log('===================================================');
  console.log(' Task 14: Food Condition & Variations Verification');
  console.log('===================================================');

  let allPassed = true;
  await client.query('BEGIN');

  try {
    // -----------------------------------------------------------------
    // Section A: Application-Level Validation Unit Checks
    // -----------------------------------------------------------------
    console.log('▶ [A] Testing application-level FoodCondition validation...');

    if (isValidFoodCondition('BEFORE_FOOD') && isValidFoodCondition('AFTER_FOOD')) {
      console.log('✔ [A.1] isValidFoodCondition correctly identifies valid conditions');
    } else {
      console.error('❌ Failed: isValidFoodCondition failed on valid inputs');
      allPassed = false;
    }

    if (!isValidFoodCondition('WITH_MILK') && !isValidFoodCondition(null) && !isValidFoodCondition(123)) {
      console.log('✔ [A.2] isValidFoodCondition strictly rejects invalid/arbitrary inputs');
    } else {
      console.error('❌ Failed: isValidFoodCondition accepted invalid input');
      allPassed = false;
    }

    try {
      const normalized = validateFoodCondition('  after_food  ');
      if (normalized === 'AFTER_FOOD') {
        console.log('✔ [A.3] validateFoodCondition normalizes whitespace and casing');
      }
    } catch {
      console.error('❌ Failed: validateFoodCondition failed on trimmed input');
      allPassed = false;
    }

    try {
      validateFoodCondition('WITH_ALCOHOL');
      console.error('❌ Failed: validateFoodCondition did not throw on invalid value');
      allPassed = false;
    } catch (e: unknown) {
      if (e instanceof InvalidFoodConditionError) {
        console.log('✔ [A.4] validateFoodCondition throws typed InvalidFoodConditionError');
      } else {
        throw e;
      }
    }

    // -----------------------------------------------------------------
    // Section B: Database Fixtures & Schema Setup
    // -----------------------------------------------------------------
    console.log('\n▶ [B] Setting up test base pathway and node...');
    await client.query(`
      INSERT INTO drugs (id, name, category, description)
      VALUES ('drug-test-14', 'Ibuprofen Test', 'NSAID', 'Baseline anti-inflammatory');
    `);

    await client.query(`
      INSERT INTO pathways (id, drug_id, name, description)
      VALUES ('pathway-test-14', 'drug-test-14', 'Oral Base Pathway', 'Canonical single pathway structure');
    `);

    await client.query(`
      INSERT INTO pathway_nodes (id, pathway_id, node_order, name, anatomical_location, organ_system, estimated_time_minutes)
      VALUES
        ('node-test-stomach', 'pathway-test-14', 1, 'Stomach', 'Gastric Cavity', 'Digestive', 15.0),
        ('node-test-intestine', 'pathway-test-14', 2, 'Small Intestine', 'Duodenum', 'Digestive', 30.0);
    `);
    console.log('✔ [B.1] Base drug, single pathway, and 2 base nodes created successfully');

    // -----------------------------------------------------------------
    // Section C: Valid Condition Variations Insertion
    // -----------------------------------------------------------------
    console.log('\n▶ [C] Inserting valid condition variations...');
    // Pathway variations (Before Food and After Food on the same pathway)
    await client.query(`
      INSERT INTO pathway_variations (id, pathway_id, condition, name, description)
      VALUES
        ('pvar-before', 'pathway-test-14', 'BEFORE_FOOD', 'Fasting State', 'Rapid absorption profile'),
        ('pvar-after', 'pathway-test-14', 'AFTER_FOOD', 'Fed State', 'Delayed gastric emptying profile');
    `);
    console.log('✔ [C.1] pathway_variations: BEFORE_FOOD and AFTER_FOOD inserted for same pathway');

    // Node variations (Before Food and After Food on the same node)
    await client.query(`
      INSERT INTO node_variations (id, node_id, condition, transit_time_modifier_pct, absorption_modifier_pct, clinical_observation)
      VALUES
        ('nvar-stomach-before', 'node-test-stomach', 'BEFORE_FOOD', 0, 0, 'Baseline fasting gastric transit'),
        ('nvar-stomach-after', 'node-test-stomach', 'AFTER_FOOD', 300, 0, 'Gastric motility delays tablet release in fed state');
    `);
    console.log('✔ [C.2] node_variations: BEFORE_FOOD and AFTER_FOOD inserted for single base node');

    // -----------------------------------------------------------------
    // Section D: Non-Duplication Verification
    // -----------------------------------------------------------------
    console.log('\n▶ [D] Verifying non-duplication of graph structure...');
    const nodeCountRes = await client.query<{ count: string }>(
      'SELECT COUNT(*) FROM pathway_nodes WHERE pathway_id = $1;',
      ['pathway-test-14']
    );
    const variationCountRes = await client.query<{ count: string }>(
      'SELECT COUNT(*) FROM node_variations WHERE node_id = $1;',
      ['node-test-stomach']
    );

    if (parseInt(nodeCountRes.rows[0].count, 10) === 2 && parseInt(variationCountRes.rows[0].count, 10) === 2) {
      console.log('✔ [D.1] Reusable topology confirmed: exactly 1 base stomach node serves 2 condition variations');
    } else {
      console.error('❌ Failed: Graph topology duplicated');
      allPassed = false;
    }

    // -----------------------------------------------------------------
    // Section E: Database CHECK Constraint (Rejection of Invalid Conditions)
    // -----------------------------------------------------------------
    console.log('\n▶ [E] Testing database CHECK constraint against invalid conditions...');
    await client.query('SAVEPOINT sp_invalid_pathway_cond');
    try {
      await client.query(`
        INSERT INTO pathway_variations (id, pathway_id, condition, name)
        VALUES ('pvar-invalid', 'pathway-test-14', 'WITH_ALCOHOL', 'Invalid Condition');
      `);
      console.error('❌ Failed: Invalid condition accepted into pathway_variations');
      allPassed = false;
    } catch (e: unknown) {
      await client.query('ROLLBACK TO SAVEPOINT sp_invalid_pathway_cond');
      const err = e as Error;
      if (err.message.includes('chk_pathway_variations_condition')) {
        console.log('✔ [E.1] Database CHECK constraint rejected invalid condition in pathway_variations');
      } else {
        throw err;
      }
    }

    await client.query('SAVEPOINT sp_invalid_node_cond');
    try {
      await client.query(`
        INSERT INTO node_variations (id, node_id, condition, clinical_observation)
        VALUES ('nvar-invalid', 'node-test-stomach', 'WITH_MILK', 'Invalid Condition');
      `);
      console.error('❌ Failed: Invalid condition accepted into node_variations');
      allPassed = false;
    } catch (e: unknown) {
      await client.query('ROLLBACK TO SAVEPOINT sp_invalid_node_cond');
      const err = e as Error;
      if (err.message.includes('chk_node_variations_condition')) {
        console.log('✔ [E.2] Database CHECK constraint rejected invalid condition in node_variations');
      } else {
        throw err;
      }
    }

    // -----------------------------------------------------------------
    // Section F: Uniqueness Constraints Verification
    // -----------------------------------------------------------------
    console.log('\n▶ [F] Testing uniqueness constraints (1 variation per condition per node)...');
    await client.query('SAVEPOINT sp_dup_node_var');
    try {
      await client.query(`
        INSERT INTO node_variations (id, node_id, condition, clinical_observation)
        VALUES ('nvar-stomach-dup', 'node-test-stomach', 'BEFORE_FOOD', 'Duplicate variation');
      `);
      console.error('❌ Failed: Duplicate (node_id, condition) was accepted');
      allPassed = false;
    } catch (e: unknown) {
      await client.query('ROLLBACK TO SAVEPOINT sp_dup_node_var');
      const err = e as Error;
      if (err.message.includes('uq_node_variations_node_condition')) {
        console.log('✔ [F.1] Unique (node_id, condition) constraint enforced');
      } else {
        throw err;
      }
    }

    // -----------------------------------------------------------------
    // Section G: Range Constraints Verification
    // -----------------------------------------------------------------
    console.log('\n▶ [G] Testing modifier range constraints...');
    await client.query('SAVEPOINT sp_modifier_range');
    try {
      await client.query(`
        INSERT INTO node_variations (id, node_id, condition, transit_time_modifier_pct, clinical_observation)
        VALUES ('nvar-stomach-bad-pct', 'node-test-intestine', 'BEFORE_FOOD', -150.0, 'Negative reduction beyond 100%');
      `);
      console.error('❌ Failed: transit modifier < -100% was accepted');
      allPassed = false;
    } catch (e: unknown) {
      await client.query('ROLLBACK TO SAVEPOINT sp_modifier_range');
      const err = e as Error;
      if (err.message.includes('chk_transit_modifier_range')) {
        console.log('✔ [G.1] Transit modifier constraint (>= -100%) enforced');
      } else {
        throw err;
      }
    }

    // -----------------------------------------------------------------
    // Section H: Timestamp Trigger Verification
    // -----------------------------------------------------------------
    console.log('\n▶ [H] Testing automatic updated_at timestamp trigger...');
    const beforeRes = await client.query<{ updated_at: Date }>(
      'SELECT updated_at FROM node_variations WHERE id = $1;',
      ['nvar-stomach-before']
    );
    const beforeTime = new Date(beforeRes.rows[0].updated_at).getTime();

    await new Promise((r) => setTimeout(r, 60));
    await client.query(
      "UPDATE node_variations SET clinical_observation = 'Updated clinical detail' WHERE id = $1;",
      ['nvar-stomach-before']
    );

    const afterRes = await client.query<{ updated_at: Date }>(
      'SELECT updated_at FROM node_variations WHERE id = $1;',
      ['nvar-stomach-before']
    );
    const afterTime = new Date(afterRes.rows[0].updated_at).getTime();

    if (afterTime > beforeTime) {
      console.log('✔ [H.1] set_updated_at_timestamp trigger automatically advances updated_at on variation update');
    } else {
      console.error('❌ Failed: updated_at did not advance');
      allPassed = false;
    }

    console.log('\n===================================================');
    console.log(allPassed ? '✅ All Task 14 verification checks passed!' : '❌ Some checks failed.');
    console.log('===================================================\n');
  } finally {
    // Rollback test transaction cleanly
    await client.query('ROLLBACK');
    console.log('ℹ️  Transaction rolled back cleanly. No test data remains in the database.\n');
    client.release();
    await closePool();
  }

  return allPassed;
}

verifyVariations()
  .then((passed) => process.exit(passed ? 0 : 1))
  .catch((err) => {
    console.error('Fatal test error:', err);
    process.exit(1);
  });
