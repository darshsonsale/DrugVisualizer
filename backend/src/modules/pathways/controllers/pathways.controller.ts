import type { Request, Response, NextFunction } from 'express';
import { pathwaysService } from '../services/pathways.service.js';
import type { ApiResponse } from '../../../common/types/index.js';
import type {
  PathwayGraphResponseDto,
  PathwayNodeWithDetailsDto,
  PathwayEdgeDto
} from '../dto/pathway.dto.js';

export class PathwaysController {
  /**
   * GET /drugs/:drugId/pathway?condition=BEFORE_FOOD|AFTER_FOOD
   */
  public async getPathwayForDrug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { drugId } = req.params;
      const { condition } = req.query;

      const graph = await pathwaysService.getPathwayForDrug(drugId, condition);
      const response: ApiResponse<PathwayGraphResponseDto> = {
        success: true,
        data: graph,
        meta: {
          timestamp: new Date().toISOString()
        }
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /pathways/:pathwayId?condition=BEFORE_FOOD|AFTER_FOOD
   */
  public async getPathwayById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { pathwayId } = req.params;
      const { condition } = req.query;
      const graph = await pathwaysService.getPathwayGraphById(pathwayId, condition);
      const response: ApiResponse<PathwayGraphResponseDto> = {
        success: true,
        data: graph,
        meta: {
          timestamp: new Date().toISOString()
        }
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /pathways/:pathwayId/nodes?condition=BEFORE_FOOD|AFTER_FOOD
   */
  public async getNodesByPathwayId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { pathwayId } = req.params;
      const { condition } = req.query;

      const nodes = await pathwaysService.getNodesByPathwayId(pathwayId, condition);
      const response: ApiResponse<PathwayNodeWithDetailsDto[]> = {
        success: true,
        data: nodes,
        meta: {
          timestamp: new Date().toISOString(),
          count: nodes.length
        }
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /pathways/:pathwayId/edges
   */
  public async getEdgesByPathwayId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { pathwayId } = req.params;

      const edges = await pathwaysService.getEdgesByPathwayId(pathwayId);
      const response: ApiResponse<PathwayEdgeDto[]> = {
        success: true,
        data: edges,
        meta: {
          timestamp: new Date().toISOString(),
          count: edges.length
        }
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }
}

export const pathwaysController = new PathwaysController();
