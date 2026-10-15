import type { Request, Response, NextFunction } from 'express';
import { drugsService } from '../services/drugs.service.js';
import type { ApiResponse } from '../../../common/types/index.js';
import type { DrugSummaryDto } from '../dto/drug.dto.js';

export class DrugsController {
  public async listDrugs(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const drugs = await drugsService.getAllDrugs();
      const response: ApiResponse<DrugSummaryDto[]> = {
        success: true,
        data: drugs,
        meta: {
          timestamp: new Date().toISOString(),
          count: drugs.length
        }
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  public async getDrug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { drugId } = req.params;
      const drug = await drugsService.getDrugById(drugId);
      const response: ApiResponse<DrugSummaryDto> = {
        success: true,
        data: drug,
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

export const drugsController = new DrugsController();
