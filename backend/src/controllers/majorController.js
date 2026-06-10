import prisma from '../config/prisma.js';

export async function listMajors(_req, res) {
  res.json(await prisma.major.findMany({ orderBy: { name_en: 'asc' } }));
}

export async function getMajor(req, res) {
  const major = await prisma.major.findUnique({ where: { id: req.params.id }, include: { catalog: { orderBy: [{ level: 'asc' }, { code: 'asc' }] } } });
  if (!major) return res.status(404).json({ error: 'Not found' });
  const { catalog, ...rest } = major;
  res.json({ ...rest, catalogCourses: catalog });
}
