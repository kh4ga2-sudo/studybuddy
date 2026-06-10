import prisma from '../config/prisma.js';
import { parseJson, stringifyJson } from '../utils/json.js';
import { makeId } from '../utils/id.js';

const mapQuiz = q => ({ ...q, options: parseJson(q.options, []) });

export async function listQuiz(req, res) {
  const { courseId, limit } = req.query;
  const where = courseId ? { course_id: courseId } : {};
  const rows = await prisma.quizBank.findMany({ where, take: limit ? Math.min(Number(limit), 100) : undefined, orderBy: { id: 'asc' } });
  res.json(rows.map(mapQuiz));
}

export async function createAttempt(req, res) {
  const { course_id, score, total, answers } = req.body;
  if (!course_id) return res.status(400).json({ error: 'Missing course_id' });
  const attempt = await prisma.quizAttempt.create({ data: { id: makeId('qa'), user_id: req.user.id, course_id, score: Number(score || 0), total: Number(total || 0), answers: stringifyJson(answers, []) } });
  res.json({ ok: true, id: attempt.id });
}

export async function listAttempts(req, res) {
  res.json(await prisma.quizAttempt.findMany({ where: { user_id: req.user.id }, orderBy: { created_at: 'desc' } }));
}

export async function getQuestion(req, res) {
  const item = await prisma.quizBank.findUnique({ where: { id: req.params.id } });
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(mapQuiz(item));
}
export async function deleteAttempt(req, res) {
  await prisma.quizAttempt.deleteMany({ where: { id: req.params.id, user_id: req.user.id } });
  res.json({ ok: true });
}
