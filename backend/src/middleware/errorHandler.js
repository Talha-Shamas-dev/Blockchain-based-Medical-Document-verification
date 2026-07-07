import { AppError } from '../services/fabric.service.js';

export const errorHandler = (err, req, res, next) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode || 500).json({ error: { message: err.message, code: err.code } });
  }
  console.error('[Error]', err);
  res.status(500).json({ error: { message: 'Internal server error' } });
};

export const notFound = (req, res) => res.status(404).json({ error: { message: 'Not found' } });
