import type { Request, Response, NextFunction } from 'express';
import { adminContentService } from '../services/adminContent.service.js';
import type { ApiResponse } from '../../../common/types/index.js';

export class AdminContentController {
  /**
   * GET /api/v1/admin/content/summary
   */
  public async getContentSummary(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const summary = await adminContentService.getContentSummary();
      const response: ApiResponse<typeof summary> = {
        success: true,
        data: summary,
        meta: { timestamp: new Date().toISOString() }
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/admin/content/drugs/:drugId/nodes
   */
  public async getDrugNodesContent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { drugId } = req.params;
      const nodes = await adminContentService.getDrugNodesContent(drugId);
      const response: ApiResponse<typeof nodes> = {
        success: true,
        data: nodes,
        meta: { timestamp: new Date().toISOString(), total: nodes.length }
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/admin/content/drugs/:drugId/edges
   */
  public async getDrugEdges(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { drugId } = req.params;
      const edges = await adminContentService.getDrugEdges(drugId);
      const response: ApiResponse<typeof edges> = {
        success: true,
        data: edges,
        meta: { timestamp: new Date().toISOString(), total: edges.length }
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/v1/admin/content/nodes/:nodeId
   */
  public async updateNodeContent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { nodeId } = req.params;
      const updated = await adminContentService.updateNodeContent(nodeId, req.body);
      const response: ApiResponse<typeof updated> = {
        success: true,
        data: updated,
        meta: { timestamp: new Date().toISOString() }
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  /**
   * PATCH /api/v1/admin/content/nodes/:nodeId/review-status
   */
  public async updateReviewStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { nodeId } = req.params;
      const { review_status } = req.body;
      const result = await adminContentService.updateReviewStatus(nodeId, review_status);
      const response: ApiResponse<typeof result> = {
        success: true,
        data: result,
        meta: { timestamp: new Date().toISOString() }
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/v1/admin/content/edges/:edgeId
   */
  public async updatePathwayEdge(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { edgeId } = req.params;
      const result = await adminContentService.updatePathwayEdge(edgeId, req.body);
      const response: ApiResponse<typeof result> = {
        success: true,
        data: result,
        meta: { timestamp: new Date().toISOString() }
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/admin/content/drugs/:drugId/quiz
   */
  public async getDrugQuiz(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { drugId } = req.params;
      const quiz = await adminContentService.getDrugQuiz(drugId);
      const response: ApiResponse<typeof quiz> = {
        success: true,
        data: quiz,
        meta: { timestamp: new Date().toISOString() }
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  /**
   * PATCH /api/v1/admin/content/quizzes/:quizId
   */
  public async updateQuizSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { quizId } = req.params;
      const result = await adminContentService.updateQuizSettings(quizId, req.body);
      const response: ApiResponse<typeof result> = {
        success: true,
        data: result,
        meta: { timestamp: new Date().toISOString() }
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  /**
   * PATCH /api/v1/admin/content/quiz-questions/:questionId
   */
  public async updateQuizQuestion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { questionId } = req.params;
      const { question_text } = req.body;
      const result = await adminContentService.updateQuizQuestion(questionId, question_text);
      const response: ApiResponse<typeof result> = {
        success: true,
        data: result,
        meta: { timestamp: new Date().toISOString() }
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  /**
   * PATCH /api/v1/admin/content/quiz-options/:optionId/review
   */
  public async updateQuizOptionReview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { optionId } = req.params;
      const result = await adminContentService.updateQuizOptionReview(optionId, req.body);
      const response: ApiResponse<typeof result> = {
        success: true,
        data: result,
        meta: { timestamp: new Date().toISOString() }
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }
}

export const adminContentController = new AdminContentController();
