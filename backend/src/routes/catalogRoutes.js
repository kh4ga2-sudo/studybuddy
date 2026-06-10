import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as c from '../controllers/catalogController.js';
const router = Router();
router.get('/', asyncHandler(c.listCatalog));
router.get('/:id', asyncHandler(c.getCatalogCourse));
export default router;
