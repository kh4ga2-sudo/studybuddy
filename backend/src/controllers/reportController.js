import prisma from '../config/prisma.js';
import { makeId } from '../utils/id.js';

export async function createReport(req, res) {
  const { name = '', email = '', category = 'general', subject = '', message = '' } = req.body || {};
  const cleanSubject = String(subject).trim();
  const cleanMessage = String(message).trim();
  const cleanEmail = String(email).trim().toLowerCase();
  const cleanName = String(name).trim();
  const cleanCategory = String(category || 'general').trim() || 'general';

  if (cleanSubject.length < 3) return res.status(400).json({ error: 'Report subject is required' });
  if (cleanMessage.length < 10) return res.status(400).json({ error: 'Report details must be at least 10 characters' });
  if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) return res.status(400).json({ error: 'Invalid email address' });

  const report = await prisma.supportReport.create({
    data: {
      id: makeId('report'),
      user_id: req.user?.id || null,
      name: cleanName || req.user?.name || '',
      email: cleanEmail || req.user?.email || '',
      category: cleanCategory,
      subject: cleanSubject,
      message: cleanMessage,
      status: 'open',
    },
  });

  res.status(201).json({ ok: true, report: { id: report.id, status: report.status, created_at: report.created_at } });
}
