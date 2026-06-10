import prisma from '../config/prisma.js';

export async function listChat(req, res) {
  res.json(await prisma.chatMessage.findMany({ where: { course_id: req.params.courseId }, orderBy: { created_at: 'asc' } }));
}
export async function sendChat(req, res) {
  const { text } = req.body;
  if (!text?.trim()) return res.status(400).json({ error: 'Missing text' });
  const user = await prisma.user.findUnique({ where: { id: req.user.id }, select: { name: true, initials: true } });
  const msg = await prisma.chatMessage.create({ data: { course_id: req.params.courseId, user_id: req.user.id, author_name: user.name, author_initials: user.initials, text } });
  res.json({ id: msg.id, ok: true });
}
