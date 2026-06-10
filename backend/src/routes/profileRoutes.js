import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as c from '../controllers/profileController.js';
const router = Router();
router.get('/', auth, asyncHandler(c.getProfile));
router.put('/', auth, asyncHandler(c.updateProfile));
export default router;
