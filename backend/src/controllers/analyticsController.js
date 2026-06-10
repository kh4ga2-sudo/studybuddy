import prisma from '../config/prisma.js';

export async function analytics(req, res) {
  const [courses, materials, quizzes, notes, resources, posts] = await Promise.all([
    prisma.catalogCourse.count(), prisma.material.count(), prisma.quizBank.count(), prisma.note.count({ where: { user_id: req.user.id } }), prisma.resource.count(), prisma.communityPost.count()
  ]);
  const byMajor = await prisma.catalogCourse.groupBy({ by: ['major_id'], _count: { id: true } });
  res.json({ totals: { courses, materials, quizzes, notes, resources, posts }, byMajor });
}
