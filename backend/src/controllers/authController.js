import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';
import { env } from '../config/env.js';
import { safeUser } from '../utils/safeUser.js';
import { makeId } from '../utils/id.js';
import { sendPasswordResetCode } from '../services/emailService.js';

function sign(user) {
  return jwt.sign({ id: user.id, email: user.email, role: user.role || 'student' }, env.jwtSecret, { expiresIn: '7d' });
}

export async function login(req, res) {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !bcrypt.compareSync(password, user.password)) return res.status(401).json({ error: 'Invalid credentials' });
  res.json({ token: sign(user), user: safeUser(user) });
}

export async function signup(req, res) {
  const { name, email, password, major_id, university, year, gpa } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });

  const selectedMajorId = String(major_id || '').trim();
  if (!selectedMajorId) return res.status(400).json({ error: 'Please choose a major' });

  const major = await prisma.major.findUnique({ where: { id: selectedMajorId }, select: { id: true } });
  if (!major) return res.status(400).json({ error: 'Selected major is not available. Please initialize the database seed and try again.' });

  const exists = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (exists) return res.status(409).json({ error: 'Email taken' });
  const parts = name.split(/\s+/);
  const initials = ((parts[0]?.[0] || 'S') + (parts[1]?.[0] || 'B')).toUpperCase();
  const user = await prisma.user.create({ data: {
    name, email, password: bcrypt.hashSync(password, 10), initials,
    major_id: selectedMajorId, university: university || '', year: year || '1', gpa: gpa || '0.00', role: 'student'
  }});
  res.json({ token: sign(user), user: safeUser(user) });
}

export async function googleAuth(req, res) {
  const { name, email } = req.body;
  if (!email) return res.status(400).json({ error: 'Missing email' });
  let user = await prisma.user.findUnique({ where: { email } });
  let isNewUser = false;
  if (!user) {
    isNewUser = true;
    const fallbackMajor = await prisma.major.findFirst({ orderBy: { name_en: 'asc' }, select: { id: true } });
    if (!fallbackMajor) return res.status(400).json({ error: 'No majors are available. Please initialize the database seed and try again.' });

    const parts = (name || '').trim().split(/\s+/);
    const initials = (((parts[0]?.[0] || 'G') + (parts[1]?.[0] || 'U')).substring(0, 2)).toUpperCase();
    user = await prisma.user.create({ data: {
      name: name || 'Google User', email, password: bcrypt.hashSync(Math.random().toString(36), 10), initials,
      major_id: fallbackMajor.id, university: '', year: '1', gpa: '0.00', role: 'student'
    }});
  }
  res.json({ token: sign(user), user: safeUser(user), isNewUser });
}

export async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Missing fields' });
  if (newPassword.length < 8) return res.status(400).json({ error: 'Password too short' });
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) return res.status(404).json({ error: 'User not found' });
  if (!bcrypt.compareSync(currentPassword, user.password)) return res.status(401).json({ error: 'Current password is incorrect' });
  await prisma.user.update({ where: { id: req.user.id }, data: { password: bcrypt.hashSync(newPassword, 10) } });
  res.json({ ok: true });
}


function resetCodeHash(email, code) {
  return bcrypt.hashSync(`${email.toLowerCase()}:${code}`, 10);
}

function resetCodeMatches(email, code, hash) {
  return bcrypt.compareSync(`${email.toLowerCase()}:${code}`, hash);
}

function makeResetCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function forgotPassword(req, res) {
  const email = String(req.body?.email || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Valid email is required' });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  // Project requirement: verify the email is actually registered before sending a reset code.
  if (!user) {
    return res.status(404).json({ error: 'This email is not registered in Study Buddy' });
  }

  const code = makeResetCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  const resetRecord = await prisma.passwordResetCode.create({
    data: {
      id: makeId('reset'),
      email,
      code_hash: resetCodeHash(email, code),
      expires_at: expiresAt,
      ip: req.ip || '',
      user_agent: req.headers['user-agent'] || '',
    },
  });

  try {
    await sendPasswordResetCode({ to: email, name: user.name, code });
  } catch (err) {
    // Do not leave an active code in the DB if the email was not actually sent.
    await prisma.passwordResetCode.update({
      where: { id: resetRecord.id },
      data: { used_at: new Date() },
    }).catch(() => null);
    const message = err?.message || 'Could not send verification email';
    return res.status(err?.status || 500).json({ error: message });
  }

  res.json({ ok: true, message: 'Verification code sent to the registered email.' });
}

export async function verifyResetCode(req, res) {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const code = String(req.body?.code || '').trim();
  if (!email || !/^\d{6}$/.test(code)) return res.status(400).json({ error: 'Valid email and 6-digit code are required' });

  const record = await prisma.passwordResetCode.findFirst({
    where: { email, used_at: null, expires_at: { gt: new Date() } },
    orderBy: { created_at: 'desc' },
  });
  if (!record || !resetCodeMatches(email, code, record.code_hash)) return res.status(400).json({ error: 'Invalid or expired verification code' });
  res.json({ ok: true });
}

export async function resetPassword(req, res) {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const code = String(req.body?.code || '').trim();
  const newPassword = String(req.body?.newPassword || '');
  if (!email || !/^\d{6}$/.test(code)) return res.status(400).json({ error: 'Valid email and 6-digit code are required' });
  if (newPassword.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(400).json({ error: 'Invalid or expired verification code' });

  const record = await prisma.passwordResetCode.findFirst({
    where: { email, used_at: null, expires_at: { gt: new Date() } },
    orderBy: { created_at: 'desc' },
  });
  if (!record || !resetCodeMatches(email, code, record.code_hash)) return res.status(400).json({ error: 'Invalid or expired verification code' });

  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { password: bcrypt.hashSync(newPassword, 10) } }),
    prisma.passwordResetCode.update({ where: { id: record.id }, data: { used_at: new Date() } }),
  ]);

  res.json({ ok: true });
}
