import prisma from '../config/prisma.js';
import { makeId } from '../utils/id.js';
import { parseJson, stringifyJson } from '../utils/json.js';

const mapEvent = e => ({ ...e, attendees: parseJson(e.attendees, []) });

export async function listEvents(_req, res) {
  const rows = await prisma.event.findMany({ orderBy: { start_time: 'asc' } });
  res.json(rows.map(mapEvent));
}

export async function createEvent(req, res) {
  const { type, course_id, title_ar, title_en, start_time, end_time, link, host, host_en, attendees, attendees_count } = req.body;
  const id = makeId('ev');
  await prisma.event.create({ data: { id, type, course_id: course_id || null, title_ar, title_en, start_time: new Date(start_time), end_time: new Date(end_time), link: link || '', host: host || '', host_en: host_en || '', attendees: stringifyJson(attendees, []), attendees_count: attendees_count || 0, created_by: req.user.id } });
  res.json({ id, ok: true });
}

export async function deleteEvent(req, res) {
  await prisma.event.deleteMany({ where: { id: req.params.id, OR: [{ created_by: req.user.id }, { created_by: null }] } });
  res.json({ ok: true });
}
