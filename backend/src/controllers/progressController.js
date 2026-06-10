import prisma from '../config/prisma.js';

export async function listProgress(req, res) {
  const where = { user_id: req.user.id };
  if (req.query.courseId) where.course_id = req.query.courseId;
  res.json(await prisma.progressLog.findMany({ where, orderBy: { created_at: 'desc' } }));
}
export async function summary(req, res) {
  const enrollments = await prisma.enrollment.findMany({ where: { user_id: req.user.id }, include: { course: true } });
  const average = enrollments.length ? Math.round(enrollments.reduce((s, e) => s + e.progress, 0) / enrollments.length) : 0;
  res.json({ averageProgress: average, courses: enrollments.length, completed: enrollments.filter(e => e.status === 'completed').length });
}

export async function createProgressLog(req, res) {
  const { course_id, metric, value, note } = req.body;
  if (!course_id || !metric) return res.status(400).json({ error: 'Missing course_id or metric' });
  const row = await prisma.progressLog.create({ data: { id: `pl_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, user_id: req.user.id, course_id, metric, value: Number(value || 0), note: note || '' } });
  res.json({ ok: true, id: row.id });
}
