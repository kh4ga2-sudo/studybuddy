import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as c from '../controllers/resourceController.js';
const router = Router();
router.get('/', asyncHandler(c.listResources));
router.post('/', auth, asyncHandler(c.createResource));
export default router;
