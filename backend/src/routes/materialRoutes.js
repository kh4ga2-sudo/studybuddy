import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as c from '../controllers/materialController.js';
const router = Router();
router.get('/courses/:courseId/materials', asyncHandler(c.listMaterials));
export default router;
