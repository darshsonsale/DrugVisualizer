import { Router } from 'express';
import { pathwaysController } from './controllers/pathways.controller.js';

export const pathwaysRouter: Router = Router();

// GET /api/v1/pathways/:pathwayId - Retrieve pathway metadata by ID
pathwaysRouter.get('/:pathwayId', (req, res, next) => pathwaysController.getPathwayById(req, res, next));

// GET /api/v1/pathways/:pathwayId/nodes - Retrieve nodes for a pathway (with optional ?condition=BEFORE_FOOD|AFTER_FOOD)
pathwaysRouter.get('/:pathwayId/nodes', (req, res, next) => pathwaysController.getNodesByPathwayId(req, res, next));

// GET /api/v1/pathways/:pathwayId/edges - Retrieve edges for a pathway
pathwaysRouter.get('/:pathwayId/edges', (req, res, next) => pathwaysController.getEdgesByPathwayId(req, res, next));
