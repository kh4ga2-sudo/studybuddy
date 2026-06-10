import prisma from '../config/prisma.js';

export async function isAdmin(req, res, next) {
  const user = await prisma.user.findUnique({ where: { id: req.user.id }, select: { role: true } });
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admins only.' });
  }
  next();
}
