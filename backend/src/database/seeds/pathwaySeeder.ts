import type pg from 'pg';
import {
  SEED_PATHWAYS,
  SEED_PATHWAY_VARIATIONS,
  SEED_NODES,
  SEED_CONTENTS,
  SEED_NODE_VARIATIONS,
  SEED_EDGES
} from '../data/medicationPathways.js';

export interface PathwaySeedResult {
  pathwaysCount: number;
  variationsCount: number;
  nodesCount: number;
  contentsCount: number;
  nodeVariationsCount: number;
  edgesCount: number;
}

export async function seedPathwaysAndContent(client: pg.PoolClient): Promise<PathwaySeedResult> {
  // 1. SEED PATHWAYS (All 4 core medications)
  for (const p of SEED_PATHWAYS) {
    await client.query(
      `INSERT INTO pathways (id, drug_id, name, description)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (id) DO UPDATE SET
         drug_id = EXCLUDED.drug_id,
         name = EXCLUDED.name,
         description = EXCLUDED.description;`,
      [p.id, p.drug_id, p.name, p.description]
    );
  }

  // 2. SEED PATHWAY VARIATIONS (All 4 core medications - BEFORE_FOOD & AFTER_FOOD)
  for (const pv of SEED_PATHWAY_VARIATIONS) {
    await client.query(
      `INSERT INTO pathway_variations (id, pathway_id, condition, name, description)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO UPDATE SET
         pathway_id = EXCLUDED.pathway_id,
         condition = EXCLUDED.condition,
         name = EXCLUDED.name,
         description = EXCLUDED.description;`,
      [pv.id, pv.pathway_id, pv.condition, pv.name, pv.description]
    );
  }

  // 3. SEED PATHWAY NODES (All 4 core medications)
  for (const n of SEED_NODES) {
    await client.query(
      `INSERT INTO pathway_nodes (
        id, pathway_id, node_order, name, anatomical_location,
        organ_system, estimated_time_minutes, camera_focus_x, camera_focus_y, camera_focus_z
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (id) DO UPDATE SET
        pathway_id = EXCLUDED.pathway_id,
        node_order = EXCLUDED.node_order,
        name = EXCLUDED.name,
        anatomical_location = EXCLUDED.anatomical_location,
        organ_system = EXCLUDED.organ_system,
        estimated_time_minutes = EXCLUDED.estimated_time_minutes,
        camera_focus_x = EXCLUDED.camera_focus_x,
        camera_focus_y = EXCLUDED.camera_focus_y,
        camera_focus_z = EXCLUDED.camera_focus_z;`,
      [
        n.id,
        n.pathway_id,
        n.node_order,
        n.name,
        n.anatomical_location,
        n.organ_system,
        n.estimated_time_minutes,
        n.camera_focus_x,
        n.camera_focus_y,
        n.camera_focus_z
      ]
    );
  }

  // 4. SEED NODE CONTENT (With verified scientific rationales, student key takeaways, and review flags)
  for (const c of SEED_CONTENTS) {
    await client.query(
      `INSERT INTO node_content (
        id, node_id, general_description, physiological_role,
        key_cellular_mechanisms, micro_environment_ph,
        key_takeaway, defined_terms, references_list, review_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (node_id) DO UPDATE SET
        id = EXCLUDED.id,
        general_description = EXCLUDED.general_description,
        physiological_role = EXCLUDED.physiological_role,
        key_cellular_mechanisms = EXCLUDED.key_cellular_mechanisms,
        micro_environment_ph = EXCLUDED.micro_environment_ph,
        key_takeaway = EXCLUDED.key_takeaway,
        defined_terms = EXCLUDED.defined_terms,
        references_list = EXCLUDED.references_list,
        review_status = EXCLUDED.review_status;`,
      [
        c.id,
        c.node_id,
        c.general_description,
        c.physiological_role,
        c.key_cellular_mechanisms,
        c.micro_environment_ph ?? null,
        c.key_takeaway || null,
        JSON.stringify(c.defined_terms || []),
        c.references_list || [],
        c.review_status || 'FLAGGED_FOR_SCIENTIFIC_REVIEW'
      ]
    );
  }

  // 5. SEED NODE VARIATIONS (Condition variations across all nodes)
  for (const v of SEED_NODE_VARIATIONS) {
    await client.query(
      `INSERT INTO node_variations (
        id, node_id, condition, transit_time_modifier_pct,
        absorption_modifier_pct, clinical_observation, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (id) DO UPDATE SET
        node_id = EXCLUDED.node_id,
        condition = EXCLUDED.condition,
        transit_time_modifier_pct = EXCLUDED.transit_time_modifier_pct,
        absorption_modifier_pct = EXCLUDED.absorption_modifier_pct,
        clinical_observation = EXCLUDED.clinical_observation,
        notes = EXCLUDED.notes;`,
      [
        v.id,
        v.node_id,
        v.condition,
        v.transit_time_modifier_pct,
        v.absorption_modifier_pct,
        v.clinical_observation,
        v.notes ?? null
      ]
    );
  }

  // 6. SEED PATHWAY EDGES (Directed transitions across all 4 pathways)
  for (const e of SEED_EDGES) {
    await client.query(
      `INSERT INTO pathway_edges (
        id, pathway_id, from_node_id, to_node_id,
        transition_description, transition_duration_minutes
      ) VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (id) DO UPDATE SET
        pathway_id = EXCLUDED.pathway_id,
        from_node_id = EXCLUDED.from_node_id,
        to_node_id = EXCLUDED.to_node_id,
        transition_description = EXCLUDED.transition_description,
        transition_duration_minutes = EXCLUDED.transition_duration_minutes;`,
      [
        e.id,
        e.pathway_id,
        e.from_node_id,
        e.to_node_id,
        e.transition_description,
        e.transition_duration_minutes
      ]
    );
  }

  return {
    pathwaysCount: SEED_PATHWAYS.length,
    variationsCount: SEED_PATHWAY_VARIATIONS.length,
    nodesCount: SEED_NODES.length,
    contentsCount: SEED_CONTENTS.length,
    nodeVariationsCount: SEED_NODE_VARIATIONS.length,
    edgesCount: SEED_EDGES.length
  };
}
