import prisma from '../config/prisma.js';
import { parseJson } from '../utils/json.js';

const mapMaterial = m => ({ ...m, extra: parseJson(m.extra, {}) });

export async function listMaterials(req, res) {
  const { category } = req.query;
  const where = { course_id: req.params.courseId };
  if (category) where.category = category;
  const rows = await prisma.material.findMany({ where, orderBy: [{ category: 'asc' }, { date: 'desc' }] });
  res.json(rows.map(mapMaterial));
}
