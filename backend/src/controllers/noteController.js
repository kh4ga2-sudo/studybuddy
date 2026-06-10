import prisma from '../config/prisma.js';
import { makeId } from '../utils/id.js';

export async function listNotes(req, res) {
  const where = { user_id: req.user.id };
  if (req.query.courseId) where.course_id = req.query.courseId;
  res.json(await prisma.note.findMany({ where, orderBy: [{ pinned: 'desc' }, { updated_at: 'desc' }] }));
}
export async function createNote(req, res) {
  const { course_id, title, body, pinned } = req.body;
  if (!course_id || !title) return res.status(400).json({ error: 'Missing course_id or title' });
  const note = await prisma.note.create({ data: { id: makeId('note'), user_id: req.user.id, course_id, title, body: body || '', pinned: !!pinned } });
  res.json({ ok: true, id: note.id });
}
export async function updateNote(req, res) {
  const { title, body, pinned } = req.body;
  await prisma.note.updateMany({ where: { id: req.params.id, user_id: req.user.id }, data: { title, body, pinned } });
  res.json({ ok: true });
}
export async function deleteNote(req, res) {
  await prisma.note.deleteMany({ where: { id: req.params.id, user_id: req.user.id } });
  res.json({ ok: true });
}
