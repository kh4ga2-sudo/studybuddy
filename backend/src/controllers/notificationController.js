import prisma from '../config/prisma.js';

export async function listNotifications(req, res) {
  res.json(await prisma.notification.findMany({ where: { user_id: req.user.id }, orderBy: { created_at: 'desc' } }));
}
export async function markRead(req, res) {
  await prisma.notification.updateMany({ where: { id: req.params.id, user_id: req.user.id }, data: { unread: 0 } });
  res.json({ ok: true });
}
export async function markAllRead(req, res) {
  await prisma.notification.updateMany({ where: { user_id: req.user.id }, data: { unread: 0 } });
  res.json({ ok: true });
}
export async function clearNotifications(req, res) {
  await prisma.notification.deleteMany({ where: { user_id: req.user.id } });
  res.json({ ok: true });
}
