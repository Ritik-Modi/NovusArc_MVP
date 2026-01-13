import 'dotenv/config';
import http from 'http';
import mongoose from 'mongoose';
import app from './app';
import logger from './utils/logger';

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/campus';

const server = http.createServer(app);

async function start() {
  try {
    logger.info('Starting server...');
    
    // Check if already connected
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(MONGO_URL, {
        // mongoose options as needed
      } as any);
      logger.info('Connected to MongoDB');
    } else {
      logger.info('MongoDB already connected');
    }

    server.listen(PORT, () => {
      logger.info(`Server listening on port ${PORT}`);
    });
  } catch (err) {
    logger.error('Failed to start', err);
    process.exit(1);
  }
}

start();

// Graceful shutdown
const shutdown = async (signal: string) => {
  try {
    logger.info(`Received ${signal}. Closing server...`);
    server.close();
    await mongoose.disconnect();
    logger.info('MongoDB disconnected. Exiting.');
    process.exit(0);
  } catch (err) {
    logger.error('Error during shutdown', err);
    process.exit(1);
  }
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

