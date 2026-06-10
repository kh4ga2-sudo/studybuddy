import prisma from '../config/prisma.js';
import { makeId } from '../utils/id.js';

export async function listResources(req, res) {
  const where = {};
  if (req.query.courseId) where.course_id = req.query.courseId;
  res.json(await prisma.resource.findMany({ where, orderBy: { created_at: 'desc' } }));
}
export async function createResource(req, res) {
  const { course_id, type, title_en, title_ar, url, source } = req.body;
  if (!course_id || !title_en || !url) return res.status(400).json({ error: 'Missing course_id, title_en, or url' });
  const resource = await prisma.resource.create({ data: { id: makeId('res'), course_id, type: type || 'link', title_en, title_ar: title_ar || title_en, url, source: source || 'StudyBuddy' } });
  res.json({ ok: true, id: resource.id });
}
