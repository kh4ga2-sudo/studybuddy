import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as c from '../controllers/chatController.js';
const router = Router();
router.get('/:courseId', auth, asyncHandler(c.listChat));
router.post('/:courseId', auth, asyncHandler(c.sendChat));
export default router;
