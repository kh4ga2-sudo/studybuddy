import prisma from '../config/prisma.js';
import { safeUser } from '../utils/safeUser.js';

const allowed = ['name','email','phone','bio','bio_ar','major_id','university','year','gpa','notifs','theme','lang'];

export async function getProfile(req, res) {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) return res.status(404).json({ error: 'Not found' });
  res.json(safeUser(user));
}

export async function updateProfile(req, res) {
  const data = {};
  for (const f of allowed) if (req.body[f] !== undefined) data[f] = req.body[f];
  if (!Object.keys(data).length) return res.status(400).json({ error: 'No fields' });
  await prisma.user.update({ where: { id: req.user.id }, data });
  res.json({ ok: true });
}
