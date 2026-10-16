import { apiClient } from '../api/client';
import type {
  AdminContentSummary,
  AdminNodeContentDetail,
  AdminEdgeDetail,
  AdminQuizDetail
} from '../api/types';

export class AdminContentService {
  /**
   * Fetches high-level content summary across all medicines.
   */
  public static async getContentSummary(): Promise<AdminContentSummary> {
    const res = await apiClient.get<AdminContentSummary>('/admin/content/summary');
    return res;
  }

  /**
   * Fetches nodes and content for a given drug.
   */
  public static async getDrugNodesContent(drugId: string): Promise<AdminNodeContentDetail[]> {
    const res = await apiClient.get<AdminNodeContentDetail[]>(`/admin/content/drugs/${drugId}/nodes`);
    return res;
  }

  /**
   * Fetches transition edges for a given drug.
   */
  public static async getDrugEdges(drugId: string): Promise<AdminEdgeDetail[]> {
    const res = await apiClient.get<AdminEdgeDetail[]>(`/admin/content/drugs/${drugId}/edges`);
    return res;
  }

  /**
   * Updates node content while preserving scientific review flags.
   */
  public static async updateNodeContent(
    nodeId: string,
    payload: {
      general_description: string;
      physiological_role: string;
      key_takeaway: string;
      micro_environment_ph?: number;
      key_cellular_mechanisms?: string[];
      references_list?: string[];
    }
  ): Promise<AdminNodeContentDetail> {
    const res = await apiClient.put<AdminNodeContentDetail>(`/admin/content/nodes/${nodeId}`, payload);
    return res;
  }

  /**
   * Updates pathway transition edge duration or description.
   */
  public static async updatePathwayEdge(
    edgeId: string,
    payload: {
      from_node_id: string;
      to_node_id: string;
      transition_duration_minutes?: number;
      transition_description?: string;
    }
  ): Promise<AdminEdgeDetail> {
    const res = await apiClient.put<AdminEdgeDetail>(`/admin/content/edges/${edgeId}`, payload);
    return res;
  }

  /**
   * Fetches quiz and question definitions for a drug.
   */
  public static async getDrugQuiz(drugId: string): Promise<AdminQuizDetail> {
    const res = await apiClient.get<AdminQuizDetail>(`/admin/content/drugs/${drugId}/quiz`);
    return res;
  }

  /**
   * Updates quiz settings (pass threshold, title, description).
   */
  public static async updateQuizSettings(
    quizId: string,
    payload: { pass_percentage?: number; title?: string; description?: string }
  ): Promise<{ id: string; title: string; pass_percentage: number; updated_at: string }> {
    const res = await apiClient.patch<{ id: string; title: string; pass_percentage: number; updated_at: string }>(
      `/admin/content/quizzes/${quizId}`,
      payload
    );
    return res;
  }

  /**
   * Updates question text without altering option IDs or historical attempts.
   */
  public static async updateQuizQuestion(
    questionId: string,
    questionText: string
  ): Promise<{ id: string; question_text: string; updated_at: string }> {
    const res = await apiClient.patch<{ id: string; question_text: string; updated_at: string }>(
      `/admin/content/quiz-questions/${questionId}`,
      { question_text: questionText }
    );
    return res;
  }

  /**
   * Toggles scientific review flag or updates explanation for an assessment option.
   */
  public static async updateQuizOptionReview(
    optionId: string,
    payload: { needs_scientific_review: boolean; explanation?: string }
  ): Promise<{ id: string; needs_scientific_review: boolean; explanation: string | null; updated_at: string }> {
    const res = await apiClient.patch<{
      id: string;
      needs_scientific_review: boolean;
      explanation: string | null;
      updated_at: string;
    }>(`/admin/content/quiz-options/${optionId}/review`, payload);
    return res;
  }
}
