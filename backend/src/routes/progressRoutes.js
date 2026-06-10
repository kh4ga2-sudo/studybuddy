import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as c from '../controllers/progressController.js';
const router = Router();
router.get('/', auth, asyncHandler(c.listProgress));
router.post('/', auth, asyncHandler(c.createProgressLog));
router.get('/summary', auth, asyncHandler(c.summary));
export default router;
