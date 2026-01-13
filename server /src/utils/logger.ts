import winston from 'winston';

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

// When NODE_ENV=production → JSON logs (Docker/BullMQ friendly)
// When NODE_ENV=development → Pretty console logs
const isProd = process.env.NODE_ENV === 'production';

const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

const logger = winston.createLogger({
  level: 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }), // include stack traces
    isProd ? json() : logFormat
  ),
  transports: [
    new winston.transports.Console({
      format: isProd
        ? json()
        : combine(colorize({ all: true }), logFormat)
    })
  ]
});

export default logger;
