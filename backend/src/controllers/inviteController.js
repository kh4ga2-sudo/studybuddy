import prisma from '../config/prisma.js';
export async function listInvites(req, res) { res.json(await prisma.invite.findMany({ where: { user_id: req.user.id, status: 'pending' }, orderBy: { when_time: 'asc' } })); }
export async function respondInvite(req, res) { await prisma.invite.updateMany({ where: { id: req.params.id, user_id: req.user.id }, data: { status: req.body.status } }); res.json({ ok: true }); }
