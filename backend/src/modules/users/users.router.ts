import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { requireOwnership } from '../../middleware/authorization.js';
import { usersController } from './controllers/users.controller.js';
import { validateParams } from '../../middleware/index.js';
import { userParamSchema } from '../../validation/index.js';

export const usersRouter: Router = Router();

// All user data endpoints require verified authentication
usersRouter.use(requireAuth);

// Authenticated user shortcuts
usersRouter.get('/me/progress', (req, res, next) => usersController.getMyProgress(req, res, next));
usersRouter.get('/me/attempts', (req, res, next) => usersController.getMyAttempts(req, res, next));
usersRouter.get('/me/overview', (req, res, next) => usersController.getMyOverview(req, res, next));

// Parameterized user endpoints protected with ownership enforcement & validation
usersRouter.get(
  '/:userId/progress',
  validateParams(userParamSchema),
  requireOwnership('userId'),
  (req, res, next) => usersController.getUserProgress(req, res, next)
);
usersRouter.get(
  '/:userId/attempts',
  validateParams(userParamSchema),
  requireOwnership('userId'),
  (req, res, next) => usersController.getUserAttempts(req, res, next)
);

