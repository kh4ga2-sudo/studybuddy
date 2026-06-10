import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as c from '../controllers/eventController.js';
const router = Router();
router.get('/', asyncHandler(c.listEvents));
router.post('/', auth, asyncHandler(c.createEvent));
router.delete('/:id', auth, asyncHandler(c.deleteEvent));
export default router;
