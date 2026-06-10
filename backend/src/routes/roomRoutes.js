import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as c from '../controllers/roomController.js';
const router = Router();
router.get('/', asyncHandler(c.listRooms));
export default router;
