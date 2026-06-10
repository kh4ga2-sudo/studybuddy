import prisma from '../config/prisma.js';
import { makeId } from '../utils/id.js';

export async function listPosts(req, res) {
  const where = req.query.courseId ? { course_id: req.query.courseId } : {};
  res.json(await prisma.communityPost.findMany({ where, include: { user: { select: { name: true, initials: true } }, comments: true }, orderBy: { created_at: 'desc' } }));
}
export async function createPost(req, res) {
  const { course_id, title, body } = req.body;
  if (!title || !body) return res.status(400).json({ error: 'Missing title or body' });
  const post = await prisma.communityPost.create({ data: { id: makeId('post'), user_id: req.user.id, course_id: course_id || null, title, body } });
  res.json({ ok: true, id: post.id });
}
export async function likePost(req, res) {
  await prisma.communityPost.update({ where: { id: req.params.id }, data: { likes: { increment: 1 } } });
  res.json({ ok: true });
}
export async function comment(req, res) {
  if (!req.body.body) return res.status(400).json({ error: 'Missing body' });
  const item = await prisma.communityComment.create({ data: { id: makeId('comment'), post_id: req.params.id, user_id: req.user.id, body: req.body.body } });
  res.json({ ok: true, id: item.id });
}
