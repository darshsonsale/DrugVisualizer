import { getPool } from '../../../database/pool.js';
import { NotFoundError } from '../../../common/errors/AppError.js';
import { validateFoodCondition } from '../validation/condition.validation.js';
import { drugsService } from '../../drugs/services/drugs.service.js';
import type { FoodCondition } from '../models/variation.model.js';
import type {
  PathwayGraphResponseDto,
  PathwayGraphDto,
  PathwayNodeWithDetailsDto,
  PathwayEdgeDto,
  NodeContentDto,
  NodeVariationDto,
  DefinedTermDto
} from '../dto/pathway.dto.js';

interface RawPathwayRow {
  id: string;
  drug_id: string;
  name: string;
  description: string | null;
}

interface RawPathwayVariationRow {
  id: string;
  pathway_id: string;
  condition: FoodCondition;
  name: string;
  description: string | null;
}

interface RawNodeJoinedRow {
  id: string;
  pathway_id: string;
  node_order: number;
  name: string;
  anatomical_location: string;
  organ_system: string;
  estimated_time_minutes: string | number;
  camera_focus_x: string | number | null;
  camera_focus_y: string | number | null;
  camera_focus_z: string | number | null;
  content_id: string | null;
  general_description: string | null;
  physiological_role: string | null;
  key_cellular_mechanisms: string[] | null;
  micro_environment_ph: string | number | null;
  key_takeaway: string | null;
  defined_terms: Array<{ term: string; definition: string }> | string | null;
  references_list: string[] | null;
  review_status: string | null;
  variation_id: string | null;
  condition: FoodCondition | null;
  transit_time_modifier_pct: string | number | null;
  absorption_modifier_pct: string | number | null;
  clinical_observation: string | null;
  variation_notes: string | null;
}

interface RawEdgeRow {
  id: string;
  pathway_id: string;
  from_node_id: string;
  to_node_id: string;
  transition_description: string | null;
  transition_duration_minutes: string | number | null;
}

export class PathwaysService {
  /**
   * Helper to assemble a complete PathwayGraphResponseDto from a pathway row and condition.
   */
  private async assemblePathwayGraph(
    rawPathway: RawPathwayRow,
    conditionInput?: unknown
  ): Promise<PathwayGraphResponseDto> {
    const condition = validateFoodCondition(conditionInput || 'BEFORE_FOOD');

    // 1. Fetch drug summary
    const drug = await drugsService.getDrugById(rawPathway.drug_id);

    // 2. Fetch condition-specific pathway variation if present
    const pathwayVariationQuery = `
      SELECT id, pathway_id, condition, name, description
      FROM pathway_variations
      WHERE pathway_id = $1 AND condition = $2;
    `;
    const variationResult = await getPool().query<RawPathwayVariationRow>(pathwayVariationQuery, [
      rawPathway.id,
      condition
    ]);
    const pathwayVariation = variationResult.rows[0] || null;

    const pathwayDto: PathwayGraphDto = {
      id: rawPathway.id,
      drug_id: rawPathway.drug_id,
      name: pathwayVariation ? pathwayVariation.name : rawPathway.name,
      description: pathwayVariation?.description ?? rawPathway.description ?? undefined,
      condition
    };

    // If AFTER_FOOD and drug has altered Tmax, overlay condition on drug response
    const drugDto = { ...drug };
    if (condition === 'AFTER_FOOD') {
      if (drugDto.id === 'drug-ibuprofen-001') {
        drugDto.tmax_hours = 2.5;
      } else if (drugDto.id === 'drug-amoxicillin-002') {
        drugDto.tmax_hours = 1.8;
      } else if (drugDto.id === 'drug-ambroxol-003') {
        drugDto.tmax_hours = 2.5;
      }
      // Note: drug-insulin-004 Tmax remains 0.5h (subcutaneous absorption is independent of gastrointestinal contents)
    }

    // 3. Fetch nodes with joined content and condition variation
    const nodes = await this.getNodesByPathwayId(rawPathway.id, condition);

    // 4. Fetch edges
    const edges = await this.getEdgesByPathwayId(rawPathway.id);

    return {
      drug: drugDto,
      pathway: pathwayDto,
      nodes,
      edges
    };
  }

  /**
   * Retrieves full pathway graph response for a drug and condition (BEFORE_FOOD or AFTER_FOOD).
   */
  public async getPathwayForDrug(drugId: string, conditionInput?: unknown): Promise<PathwayGraphResponseDto> {
    // 1. Resolve canonical drug record (supports canonical ID and short slug)
    const drug = await drugsService.getDrugById(drugId);

    const pathwayQuery = `
      SELECT id, drug_id, name, description
      FROM pathways
      WHERE drug_id = $1
      LIMIT 1;
    `;
    const pathwayResult = await getPool().query<RawPathwayRow>(pathwayQuery, [drug.id]);
    if (pathwayResult.rows.length === 0) {
      throw new NotFoundError('Pathway for drug', drugId);
    }
    return this.assemblePathwayGraph(pathwayResult.rows[0], conditionInput);
  }

  /**
   * Retrieves full pathway graph response by pathway ID and condition (BEFORE_FOOD or AFTER_FOOD).
   */
  public async getPathwayGraphById(pathwayId: string, conditionInput?: unknown): Promise<PathwayGraphResponseDto> {
    const rawPathway = await this.getPathwayById(pathwayId);
    return this.assemblePathwayGraph(rawPathway, conditionInput);
  }

  /**
   * Retrieves single pathway record by ID.
   */
  public async getPathwayById(pathwayId: string): Promise<RawPathwayRow> {
    const query = `
      SELECT id, drug_id, name, description
      FROM pathways
      WHERE id = $1;
    `;
    const result = await getPool().query<RawPathwayRow>(query, [pathwayId]);
    if (result.rows.length === 0) {
      throw new NotFoundError('Pathway', pathwayId);
    }
    return result.rows[0];
  }

  /**
   * Retrieves all nodes belonging to a pathway, with optional condition-specific variations.
   */
  public async getNodesByPathwayId(
    pathwayId: string,
    conditionInput?: unknown
  ): Promise<PathwayNodeWithDetailsDto[]> {
    // Verify pathway existence
    await this.getPathwayById(pathwayId);

    const condition: FoodCondition = conditionInput
      ? validateFoodCondition(conditionInput)
      : 'BEFORE_FOOD';

    const query = `
      SELECT
        pn.id,
        pn.pathway_id,
        pn.node_order,
        pn.name,
        pn.anatomical_location,
        pn.organ_system,
        pn.estimated_time_minutes,
        pn.camera_focus_x,
        pn.camera_focus_y,
        pn.camera_focus_z,
        nc.id AS content_id,
        nc.general_description,
        nc.physiological_role,
        nc.key_cellular_mechanisms,
        nc.micro_environment_ph,
        nc.key_takeaway,
        nc.defined_terms,
        nc.references_list,
        nc.review_status,
        nv.id AS variation_id,
        nv.condition,
        nv.transit_time_modifier_pct,
        nv.absorption_modifier_pct,
        nv.clinical_observation,
        nv.notes AS variation_notes
      FROM pathway_nodes pn
      LEFT JOIN node_content nc ON nc.node_id = pn.id
      LEFT JOIN node_variations nv ON nv.node_id = pn.id AND nv.condition = $2
      WHERE pn.pathway_id = $1
      ORDER BY pn.node_order ASC;
    `;

    const result = await getPool().query<RawNodeJoinedRow>(query, [pathwayId, condition]);

    return result.rows.map((row: RawNodeJoinedRow) => {
      const baseTime = parseFloat(String(row.estimated_time_minutes));
      // Effective transit time: in AFTER_FOOD state, gastric emptying is delayed to ~60 min
      let effectiveEstimatedTime = baseTime;
      if (condition === 'AFTER_FOOD' && row.id === 'node-stomach') {
        effectiveEstimatedTime = 60;
      }

      let content: NodeContentDto | undefined;
      if (row.content_id && row.general_description && row.physiological_role) {
        let parsedTerms: DefinedTermDto[] = [];
        if (row.defined_terms) {
          if (Array.isArray(row.defined_terms)) {
            parsedTerms = row.defined_terms as DefinedTermDto[];
          } else if (typeof row.defined_terms === 'string') {
            try {
              parsedTerms = JSON.parse(row.defined_terms);
            } catch {
              parsedTerms = [];
            }
          }
        }

        content = {
          id: row.content_id,
          node_id: row.id,
          general_description: row.general_description,
          physiological_role: row.physiological_role,
          key_cellular_mechanisms: row.key_cellular_mechanisms || [],
          micro_environment_ph:
            row.micro_environment_ph != null ? parseFloat(String(row.micro_environment_ph)) : undefined,
          key_takeaway: row.key_takeaway ?? undefined,
          defined_terms: parsedTerms.length > 0 ? parsedTerms : undefined,
          references_list: row.references_list || [],
          review_status: row.review_status ?? 'FLAGGED_FOR_SCIENTIFIC_REVIEW'
        };
      }

      let variation: NodeVariationDto | undefined;
      if (row.variation_id && row.clinical_observation) {
        variation = {
          id: row.variation_id,
          node_id: row.id,
          condition,
          transit_time_modifier_pct:
            row.transit_time_modifier_pct != null
              ? parseFloat(String(row.transit_time_modifier_pct))
              : 0,
          absorption_modifier_pct:
            row.absorption_modifier_pct != null
              ? parseFloat(String(row.absorption_modifier_pct))
              : 0,
          clinical_observation: row.clinical_observation,
          notes: row.variation_notes ?? undefined
        };
      }

      return {
        id: row.id,
        pathway_id: row.pathway_id,
        node_order: row.node_order,
        name: row.name,
        anatomical_location: row.anatomical_location,
        organ_system: row.organ_system,
        estimated_time_minutes: effectiveEstimatedTime,
        camera_focus_x:
          row.camera_focus_x != null ? parseFloat(String(row.camera_focus_x)) : undefined,
        camera_focus_y:
          row.camera_focus_y != null ? parseFloat(String(row.camera_focus_y)) : undefined,
        camera_focus_z:
          row.camera_focus_z != null ? parseFloat(String(row.camera_focus_z)) : undefined,
        content,
        variation
      };
    });
  }

  /**
   * Retrieves all edges connecting nodes in a pathway.
   */
  public async getEdgesByPathwayId(pathwayId: string): Promise<PathwayEdgeDto[]> {
    // Verify pathway existence
    await this.getPathwayById(pathwayId);

    const query = `
      SELECT
        id,
        pathway_id,
        from_node_id,
        to_node_id,
        transition_description,
        transition_duration_minutes
      FROM pathway_edges
      WHERE pathway_id = $1
      ORDER BY id ASC;
    `;

    const result = await getPool().query<RawEdgeRow>(query, [pathwayId]);

    return result.rows.map((row: RawEdgeRow) => ({
      id: row.id,
      pathway_id: row.pathway_id,
      from_node_id: row.from_node_id,
      to_node_id: row.to_node_id,
      transition_description: row.transition_description ?? undefined,
      transition_duration_minutes:
        row.transition_duration_minutes != null
          ? parseFloat(String(row.transition_duration_minutes))
          : undefined
    }));
  }
}

export const pathwaysService = new PathwaysService();
