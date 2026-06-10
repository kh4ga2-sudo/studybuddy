import prisma from '../config/prisma.js';
export async function listRooms(_req, res) { res.json(await prisma.room.findMany({ orderBy: { code: 'asc' } })); }
