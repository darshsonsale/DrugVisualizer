import express, { type Express, type Request, type Response, Router } from 'express';
import cors, { type CorsOptions } from 'cors';
import { config } from './config/index.js';
import { notFoundHandler } from './common/middleware/notFoundHandler.js';
import { errorHandler } from './common/middleware/errorHandler.js';
import { authContextMiddleware } from './common/middleware/authContext.js';

// Domain modules
import { healthRouter } from './modules/health/health.router.js';
import { authRouter } from './modules/auth/index.js';
import { drugsRouter } from './modules/drugs/index.js';
import { pathwaysRouter } from './modules/pathways/index.js';
import { contentRouter } from './modules/content/index.js';
import { quizRouter } from './modules/quiz/index.js';
import { progressRouter } from './modules/progress/index.js';
import { adminRouter } from './modules/admin/index.js';

export function createApp(): Express {
  const app: Express = express();

  // CORS configuration
  const corsOptions: CorsOptions = {
    origin: (requestOrigin, callback) => {
      // Allow non-browser requests (curl, server-to-server, health probes)
      if (!requestOrigin) return callback(null, true);

      if (Array.isArray(config.corsOrigin)) {
        if (config.corsOrigin.includes(requestOrigin) || config.corsOrigin.includes('*')) {
          return callback(null, true);
        }
        return callback(new Error(`Origin ${requestOrigin} not allowed by CORS`));
      }

      if (config.corsOrigin === '*' || config.corsOrigin === requestOrigin) {
        return callback(null, true);
      }

      return callback(new Error(`Origin ${requestOrigin} not allowed by CORS`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  };

  app.use(cors(corsOptions));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(authContextMiddleware);

  // Root welcome / status endpoint
  app.get('/', (_req: Request, res: Response) => {
    res.status(200).json({
      service: 'drug-path-visualiser-backend',
      version: '0.1.0',
      status: 'operational',
      documentation: `${config.apiPrefix}/health`
    });
  });

  // API v1 Router
  const apiV1Router: Router = Router();
  apiV1Router.use('/health', healthRouter);
  apiV1Router.use('/auth', authRouter);
  apiV1Router.use('/drugs', drugsRouter);
  apiV1Router.use('/pathways', pathwaysRouter);
  apiV1Router.use('/content', contentRouter);
  apiV1Router.use('/quiz', quizRouter);
  apiV1Router.use('/quizzes', quizRouter);
  apiV1Router.use('/progress', progressRouter);
  apiV1Router.use('/admin', adminRouter);

  app.use(config.apiPrefix, apiV1Router);

  // 404 & Centralized Error Handlers
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

export const app = createApp();
export default app;
