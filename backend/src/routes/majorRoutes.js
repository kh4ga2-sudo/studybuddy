import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as c from '../controllers/majorController.js';
const router = Router();
router.get('/', asyncHandler(c.listMajors));
router.get('/:id', asyncHandler(c.getMajor));
export default router;
