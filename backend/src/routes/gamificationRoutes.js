import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as c from '../controllers/gamificationController.js';
const router = Router();
router.get('/achievements', auth, asyncHandler(c.achievements));
router.get('/leaderboard', asyncHandler(c.leaderboard));
export default router;
