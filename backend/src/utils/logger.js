import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({ format: winston.format.simple() })
  ]
});

export const httpLogger = (req, res, next) => next();
export default logger;
