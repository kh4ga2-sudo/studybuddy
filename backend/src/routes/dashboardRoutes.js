import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as c from '../controllers/dashboardController.js';
const router = Router();
router.get('/', auth, asyncHandler(c.dashboard));
export default router;
