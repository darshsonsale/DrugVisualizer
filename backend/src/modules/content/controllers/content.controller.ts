import type { Request, Response, NextFunction } from 'express';
import { contentService } from '../services/content.service.js';
import type { ApiResponse } from '../../../common/types/index.js';
import type { DrugEducationalContentDto } from '../dto/content.dto.js';

export class ContentController {
  public async getDrugContent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { drugId } = req.params;
      const conditionParam =
        typeof req.query.condition === 'string' ? req.query.condition : undefined;
      const content = await contentService.getDrugEducationalContent(drugId, conditionParam);
      const response: ApiResponse<DrugEducationalContentDto> = {
        success: true,
        data: content,
        meta: {
          timestamp: new Date().toISOString()
        }
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }
}

export const contentController = new ContentController();
