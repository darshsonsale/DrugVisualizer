import { getPool } from '../../../database/pool.js';
import { AppError, NotFoundError, BadRequestError } from '../../../common/errors/AppError.js';
import type {
  AdminContentSummaryDto,
  AdminNodeContentDetailDto,
  UpdateNodeContentInputDto,
  AdminEdgeDetailDto,
  UpdateEdgeInputDto,
  AdminQuizDetailDto
} from '../dto/adminContent.dto.js';

export class AdminContentService {
  /**
   * Retrieves platform content summary.
   */
  public async getContentSummary(): Promise<AdminContentSummaryDto> {
    const pool = getPool();
    const res = await pool.query<{
      total_drugs: string;
      total_pathways: string;
      total_nodes: string;
      total_edges: string;
      total_quizzes: string;
      total_questions: string;
      total_options: string;
      options_needing_review: string;
    }>(`
      SELECT
        (SELECT COUNT(*) FROM drugs) AS total_drugs,
        (SELECT COUNT(*) FROM pathways) AS total_pathways,
        (SELECT COUNT(*) FROM pathway_nodes) AS total_nodes,
        (SELECT COUNT(*) FROM pathway_edges) AS total_edges,
        (SELECT COUNT(*) FROM quizzes) AS total_quizzes,
        (SELECT COUNT(*) FROM quiz_questions) AS total_questions,
        (SELECT COUNT(*) FROM quiz_options) AS total_options,
        (SELECT COUNT(*) FROM quiz_options WHERE needs_scientific_review = true) AS options_needing_review;
    `);

    const statusCountsRes = await pool.query<{ review_status: string; count: string }>(`
      SELECT review_status, COUNT(*) AS count
      FROM node_content
      GROUP BY review_status;
    `);

    const review_status_counts: Record<string, number> = {};
    for (const r of statusCountsRes.rows) {
      review_status_counts[r.review_status || 'UNKNOWN'] = parseInt(r.count, 10);
    }

    const row = res.rows[0];
    return {
      total_drugs: parseInt(row.total_drugs, 10),
      total_pathways: parseInt(row.total_pathways, 10),
      total_nodes: parseInt(row.total_nodes, 10),
      total_edges: parseInt(row.total_edges, 10),
      total_quizzes: parseInt(row.total_quizzes, 10),
      total_questions: parseInt(row.total_questions, 10),
      total_options: parseInt(row.total_options, 10),
      review_status_counts,
      options_needing_review: parseInt(row.options_needing_review, 10)
    };
  }

  /**
   * Retrieves nodes and content for a given drug.
   */
  public async getDrugNodesContent(drugId: string): Promise<AdminNodeContentDetailDto[]> {
    const pool = getPool();
    const res = await pool.query<{
      node_id: string;
      pathway_id: string;
      drug_id: string;
      node_order: number;
      node_name: string;
      anatomical_location: string;
      organ_system: string;
      estimated_time_minutes: string | number;
      content_id: string | null;
      general_description: string | null;
      physiological_role: string | null;
      key_takeaway: string | null;
      key_cellular_mechanisms: string[] | null;
      defined_terms: any;
      references_list: string[] | null;
      micro_environment_ph: string | number | null;
      review_status: string | null;
      updated_at: Date;
    }>(
      `
      SELECT
        pn.id AS node_id,
        pn.pathway_id,
        p.drug_id,
        pn.node_order,
        pn.name AS node_name,
        pn.anatomical_location,
        pn.organ_system,
        pn.estimated_time_minutes,
        nc.id AS content_id,
        nc.general_description,
        nc.physiological_role,
        nc.key_takeaway,
        nc.key_cellular_mechanisms,
        nc.defined_terms,
        nc.references_list,
        nc.micro_environment_ph,
        nc.review_status,
        COALESCE(nc.updated_at, pn.updated_at) AS updated_at
      FROM pathway_nodes pn
      JOIN pathways p ON p.id = pn.pathway_id
      LEFT JOIN node_content nc ON nc.node_id = pn.id
      WHERE p.drug_id = $1 OR p.drug_id = (SELECT id FROM drugs WHERE name ILIKE $1 OR id = $1 LIMIT 1)
      ORDER BY pn.node_order ASC;
    `,
      [drugId]
    );

    if (res.rows.length === 0) {
      throw new NotFoundError(`No pathway nodes found for drug: "${drugId}"`);
    }

    return res.rows.map((r) => ({
      node_id: r.node_id,
      pathway_id: r.pathway_id,
      drug_id: r.drug_id,
      node_order: r.node_order,
      node_name: r.node_name,
      anatomical_location: r.anatomical_location,
      organ_system: r.organ_system,
      estimated_time_minutes: Number(r.estimated_time_minutes),
      content_id: r.content_id,
      general_description: r.general_description || '',
      physiological_role: r.physiological_role || '',
      key_takeaway: r.key_takeaway || '',
      key_cellular_mechanisms: r.key_cellular_mechanisms || [],
      defined_terms: typeof r.defined_terms === 'string' ? JSON.parse(r.defined_terms) : r.defined_terms || [],
      references_list: r.references_list || [],
      micro_environment_ph: r.micro_environment_ph !== null ? Number(r.micro_environment_ph) : null,
      review_status: r.review_status || 'FLAGGED_FOR_SCIENTIFIC_REVIEW',
      updated_at: r.updated_at.toISOString()
    }));
  }

  /**
   * Fetches pathway transition edges for a given drug.
   */
  public async getDrugEdges(drugId: string): Promise<AdminEdgeDetailDto[]> {
    const pool = getPool();
    const res = await pool.query<{
      id: string;
      pathway_id: string;
      from_node_id: string;
      to_node_id: string;
      from_node_name: string;
      to_node_name: string;
      transition_description: string | null;
      transition_duration_minutes: string | number | null;
      updated_at: Date;
    }>(
      `
      SELECT
        pe.id,
        pe.pathway_id,
        pe.from_node_id,
        pe.to_node_id,
        fn.name AS from_node_name,
        tn.name AS to_node_name,
        pe.transition_description,
        pe.transition_duration_minutes,
        pe.updated_at
      FROM pathway_edges pe
      JOIN pathways p ON p.id = pe.pathway_id
      JOIN pathway_nodes fn ON fn.id = pe.from_node_id
      JOIN pathway_nodes tn ON tn.id = pe.to_node_id
      WHERE p.drug_id = $1 OR p.drug_id = (SELECT id FROM drugs WHERE name ILIKE $1 OR id = $1 LIMIT 1)
      ORDER BY fn.node_order ASC;
    `,
      [drugId]
    );

    return res.rows.map((r) => ({
      id: r.id,
      pathway_id: r.pathway_id,
      from_node_id: r.from_node_id,
      to_node_id: r.to_node_id,
      from_node_name: r.from_node_name,
      to_node_name: r.to_node_name,
      transition_description: r.transition_description,
      transition_duration_minutes: r.transition_duration_minutes !== null ? Number(r.transition_duration_minutes) : null,
      updated_at: r.updated_at.toISOString()
    }));
  }

  /**
   * Updates educational content for a pathway node.
   * Preserves review_status = 'FLAGGED_FOR_SCIENTIFIC_REVIEW' to maintain clinical review integrity.
   */
  public async updateNodeContent(
    nodeId: string,
    input: UpdateNodeContentInputDto
  ): Promise<AdminNodeContentDetailDto> {
    const pool = getPool();
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const nodeCheck = await client.query<{ id: string; pathway_id: string }>(
        'SELECT id, pathway_id FROM pathway_nodes WHERE id = $1;',
        [nodeId]
      );

      if (nodeCheck.rows.length === 0) {
        throw new NotFoundError(`Pathway node "${nodeId}" not found`);
      }

      const definedTermsJson = JSON.stringify(input.defined_terms || []);
      const cellularMechanisms = input.key_cellular_mechanisms || [];
      const referencesList = input.references_list || [];
      const ph = input.micro_environment_ph ?? null;

      // Upsert node_content while strictly preserving review_status = 'FLAGGED_FOR_SCIENTIFIC_REVIEW'
      await client.query(
        `
        INSERT INTO node_content (
          id, node_id, general_description, physiological_role,
          key_takeaway, key_cellular_mechanisms, defined_terms,
          references_list, micro_environment_ph, review_status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'FLAGGED_FOR_SCIENTIFIC_REVIEW')
        ON CONFLICT (node_id) DO UPDATE SET
          general_description = EXCLUDED.general_description,
          physiological_role = EXCLUDED.physiological_role,
          key_takeaway = EXCLUDED.key_takeaway,
          key_cellular_mechanisms = EXCLUDED.key_cellular_mechanisms,
          defined_terms = EXCLUDED.defined_terms,
          references_list = EXCLUDED.references_list,
          micro_environment_ph = EXCLUDED.micro_environment_ph,
          review_status = 'FLAGGED_FOR_SCIENTIFIC_REVIEW',
          updated_at = clock_timestamp()
        RETURNING *;
      `,
        [
          `content-${nodeId}`,
          nodeId,
          input.general_description,
          input.physiological_role,
          input.key_takeaway,
          cellularMechanisms,
          definedTermsJson,
          referencesList,
          ph
        ]
      );

      await client.query('COMMIT');

      // Fetch node details for full DTO
      const nodeDetail = await this.getNodeDetail(nodeId);
      return nodeDetail;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Updates review status of a node.
   * Only permits 'FLAGGED_FOR_SCIENTIFIC_REVIEW' to prevent false clinical endorsement.
   */
  public async updateReviewStatus(
    nodeId: string,
    reviewStatus: string
  ): Promise<{ nodeId: string; review_status: string; updated_at: string }> {
    if (reviewStatus !== 'FLAGGED_FOR_SCIENTIFIC_REVIEW') {
      throw new BadRequestError(
        'INVALID_REVIEW_STATUS',
        'Administrative updates must retain FLAGGED_FOR_SCIENTIFIC_REVIEW pending formal clinical review.'
      );
    }

    const pool = getPool();
    const res = await pool.query<{ node_id: string; review_status: string; updated_at: Date }>(
      `UPDATE node_content
       SET review_status = $1, updated_at = clock_timestamp()
       WHERE node_id = $2
       RETURNING node_id, review_status, updated_at;`,
      [reviewStatus, nodeId]
    );

    if (res.rows.length === 0) {
      throw new NotFoundError(`Node content for node "${nodeId}" not found`);
    }

    return {
      nodeId: res.rows[0].node_id,
      review_status: res.rows[0].review_status,
      updated_at: res.rows[0].updated_at.toISOString()
    };
  }

  /**
   * Updates pathway transition edge with concurrency-safe pathway-level locking & cycle detection.
   */
  public async updatePathwayEdge(
    edgeId: string,
    input: UpdateEdgeInputDto
  ): Promise<AdminEdgeDetailDto> {
    const pool = getPool();
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // 1. Fetch current edge to obtain parent pathway_id
      const currentEdgeRes = await client.query<{
        id: string;
        pathway_id: string;
        from_node_id: string;
        to_node_id: string;
        transition_duration_minutes: string | number | null;
        transition_description: string | null;
      }>('SELECT * FROM pathway_edges WHERE id = $1;', [edgeId]);

      if (currentEdgeRes.rows.length === 0) {
        throw new NotFoundError(`Pathway edge "${edgeId}" not found`);
      }

      const pathwayId = currentEdgeRes.rows[0].pathway_id;

      // 2. CONCURRENCY-SAFE PATHWAY LOCK: Lock the pathway row to serialize all edge updates on this pathway
      await client.query('SELECT id FROM pathways WHERE id = $1 FOR UPDATE;', [pathwayId]);

      // 3. Self-loop validation
      if (input.from_node_id === input.to_node_id) {
        throw new AppError(
          'A pathway transition edge cannot connect a node to itself.',
          400,
          'INVALID_PATHWAY_RELATIONSHIP'
        );
      }

      // 4. Same-pathway node membership validation
      const nodesRes = await client.query<{ id: string; pathway_id: string }>(
        'SELECT id, pathway_id FROM pathway_nodes WHERE id IN ($1, $2);',
        [input.from_node_id, input.to_node_id]
      );

      if (nodesRes.rows.length !== 2) {
        throw new AppError(
          'One or both specified nodes do not exist.',
          400,
          'INVALID_PATHWAY_RELATIONSHIP'
        );
      }

      if (nodesRes.rows[0].pathway_id !== pathwayId || nodesRes.rows[1].pathway_id !== pathwayId) {
        throw new AppError(
          'Both edge endpoints must belong to the same pathway.',
          400,
          'INVALID_PATHWAY_RELATIONSHIP'
        );
      }

      // 5. In-Memory DAG Cycle Detection
      const allEdgesRes = await client.query<{ id: string; from_node_id: string; to_node_id: string }>(
        'SELECT id, from_node_id, to_node_id FROM pathway_edges WHERE pathway_id = $1;',
        [pathwayId]
      );

      // Construct adjacency list with the proposed edge replacing current edge
      const adj = new Map<string, string[]>();
      for (const e of allEdgesRes.rows) {
        if (e.id === edgeId) {
          // Use proposed endpoints
          const targets = adj.get(input.from_node_id) || [];
          targets.push(input.to_node_id);
          adj.set(input.from_node_id, targets);
        } else {
          const targets = adj.get(e.from_node_id) || [];
          targets.push(e.to_node_id);
          adj.set(e.from_node_id, targets);
        }
      }

      if (this.hasCycle(adj)) {
        throw new AppError(
          'Edge update creates an invalid cyclic transit loop in the directed pathway.',
          400,
          'INVALID_PATHWAY_RELATIONSHIP'
        );
      }

      // 6. Execute edge update
      const updateRes = await client.query<{
        id: string;
        pathway_id: string;
        from_node_id: string;
        to_node_id: string;
        transition_description: string | null;
        transition_duration_minutes: string | number | null;
        updated_at: Date;
      }>(
        `
        UPDATE pathway_edges
        SET
          from_node_id = $1,
          to_node_id = $2,
          transition_duration_minutes = COALESCE($3, transition_duration_minutes),
          transition_description = COALESCE($4, transition_description),
          updated_at = clock_timestamp()
        WHERE id = $5
        RETURNING *;
      `,
        [
          input.from_node_id,
          input.to_node_id,
          input.transition_duration_minutes ?? null,
          input.transition_description ?? null,
          edgeId
        ]
      );

      await client.query('COMMIT');

      const updatedRow = updateRes.rows[0];
      return {
        id: updatedRow.id,
        pathway_id: updatedRow.pathway_id,
        from_node_id: updatedRow.from_node_id,
        to_node_id: updatedRow.to_node_id,
        transition_description: updatedRow.transition_description,
        transition_duration_minutes:
          updatedRow.transition_duration_minutes !== null
            ? Number(updatedRow.transition_duration_minutes)
            : null,
        updated_at: updatedRow.updated_at.toISOString()
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Retrieves full details for a drug quiz.
   */
  public async getDrugQuiz(drugId: string): Promise<AdminQuizDetailDto> {
    const pool = getPool();
    const quizRes = await pool.query<{
      id: string;
      drug_id: string;
      title: string;
      description: string | null;
      pass_percentage: string | number;
      updated_at: Date;
    }>(
      `
      SELECT id, drug_id, title, description, pass_percentage, updated_at
      FROM quizzes
      WHERE drug_id = $1 OR drug_id = (SELECT id FROM drugs WHERE name ILIKE $1 OR id = $1 LIMIT 1);
    `,
      [drugId]
    );

    if (quizRes.rows.length === 0) {
      throw new NotFoundError(`Quiz for drug "${drugId}" not found`);
    }

    const quiz = quizRes.rows[0];

    const questionsRes = await pool.query<{
      id: string;
      quiz_id: string;
      question_order: number;
      question_text: string;
    }>(
      `
      SELECT id, quiz_id, question_order, question_text
      FROM quiz_questions
      WHERE quiz_id = $1
      ORDER BY question_order ASC;
    `,
      [quiz.id]
    );

    const optionsRes = await pool.query<{
      id: string;
      question_id: string;
      option_text: string;
      explanation: string | null;
      needs_scientific_review: boolean;
    }>(
      `
      SELECT id, question_id, option_text, explanation, needs_scientific_review
      FROM quiz_options
      WHERE question_id IN (SELECT id FROM quiz_questions WHERE quiz_id = $1)
      ORDER BY id ASC;
    `,
      [quiz.id]
    );

    const optionsByQuestion = new Map<string, any[]>();
    for (const opt of optionsRes.rows) {
      const list = optionsByQuestion.get(opt.question_id) || [];
      list.push(opt);
      optionsByQuestion.set(opt.question_id, list);
    }

    return {
      id: quiz.id,
      drug_id: quiz.drug_id,
      title: quiz.title,
      description: quiz.description,
      pass_percentage: Number(quiz.pass_percentage),
      questions_count: questionsRes.rows.length,
      options_count: optionsRes.rows.length,
      updated_at: quiz.updated_at.toISOString(),
      questions: questionsRes.rows.map((q) => ({
        id: q.id,
        question_order: q.question_order,
        question_text: q.question_text,
        options: optionsByQuestion.get(q.id) || []
      }))
    };
  }

  /**
   * Updates quiz settings (title, description, pass_percentage).
   */
  public async updateQuizSettings(
    quizId: string,
    input: { title?: string; description?: string; pass_percentage?: number }
  ): Promise<{ id: string; title: string; pass_percentage: number; updated_at: string }> {
    const pool = getPool();
    const res = await pool.query<{ id: string; title: string; pass_percentage: string | number; updated_at: Date }>(
      `
      UPDATE quizzes
      SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        pass_percentage = COALESCE($3, pass_percentage),
        updated_at = clock_timestamp()
      WHERE id = $4
      RETURNING id, title, pass_percentage, updated_at;
    `,
      [input.title ?? null, input.description ?? null, input.pass_percentage ?? null, quizId]
    );

    if (res.rows.length === 0) {
      throw new NotFoundError(`Quiz "${quizId}" not found`);
    }

    return {
      id: res.rows[0].id,
      title: res.rows[0].title,
      pass_percentage: Number(res.rows[0].pass_percentage),
      updated_at: res.rows[0].updated_at.toISOString()
    };
  }

  /**
   * Updates question text without modifying ordering, foreign keys, or historical attempts.
   */
  public async updateQuizQuestion(
    questionId: string,
    questionText: string
  ): Promise<{ id: string; question_text: string; updated_at: string }> {
    const pool = getPool();
    const res = await pool.query<{ id: string; question_text: string; updated_at: Date }>(
      `
      UPDATE quiz_questions
      SET question_text = $1, updated_at = clock_timestamp()
      WHERE id = $2
      RETURNING id, question_text, updated_at;
    `,
      [questionText, questionId]
    );

    if (res.rows.length === 0) {
      throw new NotFoundError(`Quiz question "${questionId}" not found`);
    }

    return {
      id: res.rows[0].id,
      question_text: res.rows[0].question_text,
      updated_at: res.rows[0].updated_at.toISOString()
    };
  }

  /**
   * Updates option explanation or review flag.
   * Option ID and is_correct are strictly preserved to protect historical attempt grading.
   */
  public async updateQuizOptionReview(
    optionId: string,
    input: { needs_scientific_review: boolean; explanation?: string }
  ): Promise<{ id: string; needs_scientific_review: boolean; explanation: string | null; updated_at: string }> {
    const pool = getPool();
    const res = await pool.query<{
      id: string;
      needs_scientific_review: boolean;
      explanation: string | null;
      updated_at: Date;
    }>(
      `
      UPDATE quiz_options
      SET
        needs_scientific_review = $1,
        explanation = COALESCE($2, explanation),
        updated_at = clock_timestamp()
      WHERE id = $3
      RETURNING id, needs_scientific_review, explanation, updated_at;
    `,
      [input.needs_scientific_review, input.explanation ?? null, optionId]
    );

    if (res.rows.length === 0) {
      throw new NotFoundError(`Quiz option "${optionId}" not found`);
    }

    return {
      id: res.rows[0].id,
      needs_scientific_review: res.rows[0].needs_scientific_review,
      explanation: res.rows[0].explanation,
      updated_at: res.rows[0].updated_at.toISOString()
    };
  }

  private async getNodeDetail(nodeId: string): Promise<AdminNodeContentDetailDto> {
    const pool = getPool();
    const res = await pool.query<{
      node_id: string;
      pathway_id: string;
      drug_id: string;
      node_order: number;
      node_name: string;
      anatomical_location: string;
      organ_system: string;
      estimated_time_minutes: string | number;
      content_id: string | null;
      general_description: string | null;
      physiological_role: string | null;
      key_takeaway: string | null;
      key_cellular_mechanisms: string[] | null;
      defined_terms: any;
      references_list: string[] | null;
      micro_environment_ph: string | number | null;
      review_status: string | null;
      updated_at: Date;
    }>(
      `
      SELECT
        pn.id AS node_id,
        pn.pathway_id,
        p.drug_id,
        pn.node_order,
        pn.name AS node_name,
        pn.anatomical_location,
        pn.organ_system,
        pn.estimated_time_minutes,
        nc.id AS content_id,
        nc.general_description,
        nc.physiological_role,
        nc.key_takeaway,
        nc.key_cellular_mechanisms,
        nc.defined_terms,
        nc.references_list,
        nc.micro_environment_ph,
        nc.review_status,
        COALESCE(nc.updated_at, pn.updated_at) AS updated_at
      FROM pathway_nodes pn
      JOIN pathways p ON p.id = pn.pathway_id
      LEFT JOIN node_content nc ON nc.node_id = pn.id
      WHERE pn.id = $1;
    `,
      [nodeId]
    );

    if (res.rows.length === 0) {
      throw new NotFoundError(`Node "${nodeId}" not found`);
    }

    const r = res.rows[0];
    return {
      node_id: r.node_id,
      pathway_id: r.pathway_id,
      drug_id: r.drug_id,
      node_order: r.node_order,
      node_name: r.node_name,
      anatomical_location: r.anatomical_location,
      organ_system: r.organ_system,
      estimated_time_minutes: Number(r.estimated_time_minutes),
      content_id: r.content_id,
      general_description: r.general_description || '',
      physiological_role: r.physiological_role || '',
      key_takeaway: r.key_takeaway || '',
      key_cellular_mechanisms: r.key_cellular_mechanisms || [],
      defined_terms: typeof r.defined_terms === 'string' ? JSON.parse(r.defined_terms) : r.defined_terms || [],
      references_list: r.references_list || [],
      micro_environment_ph: r.micro_environment_ph !== null ? Number(r.micro_environment_ph) : null,
      review_status: r.review_status || 'FLAGGED_FOR_SCIENTIFIC_REVIEW',
      updated_at: r.updated_at.toISOString()
    };
  }

  private hasCycle(adj: Map<string, string[]>): boolean {
    const visited = new Set<string>();
    const recStack = new Set<string>();

    const dfs = (node: string): boolean => {
      visited.add(node);
      recStack.add(node);

      const neighbors = adj.get(node) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          if (dfs(neighbor)) return true;
        } else if (recStack.has(neighbor)) {
          return true; // Back-edge detected => cycle
        }
      }

      recStack.delete(node);
      return false;
    };

    for (const node of adj.keys()) {
      if (!visited.has(node)) {
        if (dfs(node)) return true;
      }
    }

    return false;
  }
}

export const adminContentService = new AdminContentService();
