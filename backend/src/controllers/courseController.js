import prisma from '../config/prisma.js';

function mapEnrollment(e) {
  return {
    ...e,
    code: e.course.code,
    name_en: e.course.name_en,
    name_ar: e.course.name_ar,
    major_id: e.course.major_id,
    credits: e.course.credits,
    level: e.course.level,
    instructor: e.course.instructor,
  };
}

export async function listCourses(req, res) {
  const rows = await prisma.enrollment.findMany({ where: { user_id: req.user.id }, include: { course: true }, orderBy: { course: { code: 'asc' } } });
  res.json(rows.map(mapEnrollment));
}

export async function enrollCourse(req, res) {
  const { course_id } = req.body;
  if (!course_id) return res.status(400).json({ error: 'Missing course_id' });
  const existingCount = await prisma.enrollment.count({ where: { user_id: req.user.id } });
  await prisma.enrollment.create({ data: {
    user_id: req.user.id, course_id, progress: 0, status: 'inprogress', color_var: ['--accent','--info','--success','--warning'][existingCount % 4]
  }});
  res.json({ ok: true });
}

export async function unenrollCourse(req, res) {
  await prisma.enrollment.deleteMany({ where: { user_id: req.user.id, course_id: req.params.courseId } });
  res.json({ ok: true });
}

export async function updateCourseProgress(req, res) {
  const progress = Math.max(0, Math.min(100, Number(req.body.progress ?? 0)));
  await prisma.enrollment.updateMany({ where: { user_id: req.user.id, course_id: req.params.courseId }, data: { progress } });
  await prisma.progressLog.create({ data: { id: `pl_${Date.now()}`, user_id: req.user.id, course_id: req.params.courseId, metric: 'progress', value: progress, note: req.body.note || '' } });
  res.json({ ok: true, progress });
}
