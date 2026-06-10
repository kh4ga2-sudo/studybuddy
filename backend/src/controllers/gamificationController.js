import prisma from '../config/prisma.js';

export async function achievements(req, res) {
  const all = await prisma.achievement.findMany({ orderBy: { points: 'asc' } });
  const earned = await prisma.userAchievement.findMany({ where: { user_id: req.user.id } });
  const earnedSet = new Set(earned.map(e => e.achievement_id));
  res.json(all.map(a => ({ ...a, earned: earnedSet.has(a.id) })));
}
export async function leaderboard(_req, res) {
  const rows = await prisma.userAchievement.groupBy({ by: ['user_id'], _count: { achievement_id: true } });
  res.json(rows.sort((a,b) => b._count.achievement_id - a._count.achievement_id).slice(0, 10));
}
