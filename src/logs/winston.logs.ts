import DailyRotateFile from 'winston-daily-rotate-file';
import winston from 'winston';

const fileTransport = new DailyRotateFile({
  filename: 'logs/app-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d',
});

const consoleTransport = new winston.transports.Console();

export const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.colorize(),
    winston.format.printf((info) => {
      return `${info.timestamp} \n ${info.level}: \n ${info.message}`;
    }),
  ),
  transports: [fileTransport, consoleTransport],
});
