import prisma from '../config/prisma.js';
import { normalizeCourseLimit } from '../services/courseCatalogService.js';

export async function listCatalog(req, res) {
  const { major, level, q, limit } = req.query;
  const where = {};
  if (major) where.major_id = major;
  if (level) where.level = Number(level);
  if (q) where.OR = [
    { code: { contains: q, mode: 'insensitive' } },
    { name_en: { contains: q, mode: 'insensitive' } },
    { name_ar: { contains: q, mode: 'insensitive' } },
  ];
  res.json(await prisma.catalogCourse.findMany({ where, orderBy: { code: 'asc' }, take: normalizeCourseLimit(limit) }));
}

export async function getCatalogCourse(req, res) {
  const course = await prisma.catalogCourse.findUnique({ where: { id: req.params.id }, include: { major: true } });
  if (!course) return res.status(404).json({ error: 'Not found' });
  res.json(course);
}
