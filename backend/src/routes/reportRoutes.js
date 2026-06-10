import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as c from '../controllers/reportController.js';

const router = Router();

function optionalAuth(req, _res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token) {
    try { req.user = jwt.verify(token, env.jwtSecret); } catch { /* public reports still allowed */ }
  }
  next();
}

router.post('/', optionalAuth, asyncHandler(c.createReport));

export default router;
