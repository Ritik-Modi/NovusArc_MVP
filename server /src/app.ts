import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import routes from './routes/index.routes'; // we'll create an index routes barrel (see note)
import logger from './utils/logger';
import dotenv from 'dotenv';
import connectDatabase from './config/database';

const app = express();
dotenv.config();
connectDatabase();
// Security + basic middlewares
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

// Health check
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

// Mount routes (assuming src/routes/index.ts exports a router)
app.use('/api', routes);

// 404
app.use((req, res) => {
  res.status(404).json({ message: 'API Not Found' });
});

// Error handler (simple)
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error(err);
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  res.status(status).json({ message });
});

export default app;
