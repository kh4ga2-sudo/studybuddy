import prisma from '../config/prisma.js';

export async function dashboard(req, res) {
  const user = await prisma.user.findUnique({ where: { id: req.user.id }, select: { name: true, gpa: true, year: true } });
  const enrolled = await prisma.enrollment.count({ where: { user_id: req.user.id } });
  const courses = await prisma.enrollment.findMany({ where: { user_id: req.user.id }, include: { course: true } });
  const totalCredits = courses.reduce((s, e) => s + (e.course.credits || 0), 0);
  const unread = await prisma.notification.count({ where: { user_id: req.user.id, unread: 1 } });
  const notes = await prisma.note.count({ where: { user_id: req.user.id } });
  const quizAttempts = await prisma.quizAttempt.count({ where: { user_id: req.user.id } });
  res.json({ user, stats: { enrolled, totalCredits, gpa: user?.gpa || '0.00', notes, quizAttempts }, unreadNotifications: unread });
}
