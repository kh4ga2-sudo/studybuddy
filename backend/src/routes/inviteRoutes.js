import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as c from '../controllers/inviteController.js';
const router = Router();
router.get('/', auth, asyncHandler(c.listInvites));
router.put('/:id', auth, asyncHandler(c.respondInvite));
export default router;
