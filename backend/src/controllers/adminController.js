import prisma from '../config/prisma.js';
import { parseJson, stringifyJson } from '../utils/json.js';

const mapMaterial = m => ({ ...m, extra: parseJson(m.extra, {}) });

export async function getAdminCatalog(_req, res) {
  const rows = await prisma.catalogCourse.findMany({ include: { major: true }, orderBy: { code: 'asc' } });
  res.json(rows.map(c => ({ ...c, major_name_en: c.major.name_en, major_name_ar: c.major.name_ar, major: undefined })));
}
export async function createCatalog(req, res) {
  const { id, code, name_en, name_ar, major_id, credits, level, instructor } = req.body;
  if (!id || !code || !name_en || !name_ar || !major_id) return res.status(400).json({ error: 'Missing required course fields' });
  await prisma.catalogCourse.create({ data: { id, code, name_en, name_ar, major_id, credits: Number(credits || 3), level: Number(level || 100), instructor: instructor || '' } });
  res.json({ ok: true, id });
}
export async function updateCatalog(req, res) {
  const { code, name_en, name_ar, major_id, credits, level, instructor } = req.body;
  await prisma.catalogCourse.update({ where: { id: req.params.id }, data: { code, name_en, name_ar, major_id, credits: Number(credits || 3), level: Number(level || 100), instructor: instructor || '' } });
  res.json({ ok: true });
}
export async function deleteCatalog(req, res) {
  await prisma.catalogCourse.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
}
export async function getMaterials(req, res) {
  const rows = await prisma.material.findMany({ where: { course_id: req.params.courseId }, orderBy: { category: 'asc' } });
  res.json(rows.map(mapMaterial));
}
export async function createMaterial(req, res) {
  const { id, course_id, category, title, title_ar, date, extra } = req.body;
  if (!id || !course_id || !category || !title) return res.status(400).json({ error: 'Missing required material fields' });
  await prisma.material.create({ data: { id, course_id, category, title, title_ar: title_ar || '', date: date || '', extra: stringifyJson(extra, {}) } });
  res.json({ ok: true, id });
}
export async function updateMaterial(req, res) {
  const { category, title, title_ar, date, extra } = req.body;
  await prisma.material.update({ where: { id: req.params.id }, data: { category, title, title_ar: title_ar || '', date: date || '', extra: stringifyJson(extra, {}) } });
  res.json({ ok: true });
}
export async function deleteMaterial(req, res) {
  await prisma.material.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
}
export async function stats(_req, res) {
  const [courses, majors, materials, quizzes, users] = await Promise.all([
    prisma.catalogCourse.count(), prisma.major.count(), prisma.material.count(), prisma.quizBank.count(), prisma.user.count()
  ]);
  res.json({ courses, majors, materials, quizzes, users });
}

export async function listUsers(_req, res) {
  const rows = await prisma.user.findMany({ select: { id: true, name: true, email: true, role: true, major_id: true, created_at: true }, orderBy: { id: 'asc' } });
  res.json(rows);
}
export async function listQuizAdmin(_req, res) {
  const rows = await prisma.quizBank.findMany({ take: 500, orderBy: { id: 'asc' } });
  res.json(rows.map(q => ({ ...q, options: parseJson(q.options, []) })));
}
export async function createQuizAdmin(req, res) {
  const { id, course_id, text_en, text_ar, options, correct, explain_en, explain_ar, difficulty } = req.body;
  if (!id || !text_en || !text_ar || !options || !correct) return res.status(400).json({ error: 'Missing quiz fields' });
  await prisma.quizBank.create({ data: { id, course_id: course_id || null, text_en, text_ar, options: stringifyJson(options, []), correct, explain_en: explain_en || '', explain_ar: explain_ar || '', difficulty: difficulty || 'medium' } });
  res.json({ ok: true, id });
}
export async function updateQuizAdmin(req, res) {
  const { course_id, text_en, text_ar, options, correct, explain_en, explain_ar, difficulty } = req.body;
  await prisma.quizBank.update({ where: { id: req.params.id }, data: { course_id: course_id || null, text_en, text_ar, options: stringifyJson(options, []), correct, explain_en: explain_en || '', explain_ar: explain_ar || '', difficulty: difficulty || 'medium' } });
  res.json({ ok: true });
}
export async function deleteQuizAdmin(req, res) {
  await prisma.quizBank.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
}
export async function listNotesAdmin(_req, res) {
  res.json(await prisma.note.findMany({ take: 500, orderBy: { updated_at: 'desc' } }));
}
export async function listCommunityAdmin(_req, res) {
  res.json(await prisma.communityPost.findMany({ take: 500, include: { comments: true }, orderBy: { created_at: 'desc' } }));
}


export async function listReportsAdmin(req, res) {
  const { status } = req.query;
  const where = status && status !== 'all' ? { status: String(status) } : {};
  const rows = await prisma.supportReport.findMany({
    where,
    take: 500,
    include: { user: { select: { id: true, name: true, email: true, role: true } } },
    orderBy: { created_at: 'desc' },
  });
  res.json(rows.map(r => ({
    id: r.id,
    user_id: r.user_id,
    user: r.user,
    name: r.name,
    email: r.email,
    category: r.category,
    subject: r.subject,
    message: r.message,
    status: r.status,
    admin_note: r.admin_note,
    created_at: r.created_at,
    updated_at: r.updated_at,
  })));
}

export async function updateReportAdmin(req, res) {
  const { status, admin_note } = req.body || {};
  const allowed = ['open', 'reviewing', 'resolved', 'closed'];
  if (status && !allowed.includes(status)) return res.status(400).json({ error: 'Invalid report status' });
  const data = {};
  if (status) data.status = status;
  if (admin_note !== undefined) data.admin_note = String(admin_note || '');
  const row = await prisma.supportReport.update({ where: { id: req.params.id }, data });
  res.json({ ok: true, report: row });
}
