import { Router } from 'express';
import { drugsController } from './controllers/drugs.controller.js';
import { pathwaysController } from '../pathways/controllers/pathways.controller.js';
import { validateParams, validateQuery } from '../../middleware/index.js';
import { drugParamSchema, pathwayQuerySchema } from '../../validation/index.js';

export const drugsRouter: Router = Router();

// GET /api/v1/drugs - List all drugs
drugsRouter.get('/', (req, res, next) => drugsController.listDrugs(req, res, next));

// GET /api/v1/drugs/:drugId/pathway - Retrieve physiological pathway graph for drug (with ?condition=BEFORE_FOOD|AFTER_FOOD)
drugsRouter.get(
  '/:drugId/pathway',
  validateParams(drugParamSchema),
  validateQuery(pathwayQuerySchema),
  (req, res, next) => pathwaysController.getPathwayForDrug(req, res, next)
);

// GET /api/v1/drugs/:drugId - Retrieve single drug by ID
drugsRouter.get(
  '/:drugId',
  validateParams(drugParamSchema),
  (req, res, next) => drugsController.getDrug(req, res, next)
);

