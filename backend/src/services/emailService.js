import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

function requireEmailConfig() {
  const missing = [];
  if (!env.smtp.host) missing.push('SMTP_HOST');
  if (!env.smtp.user) missing.push('SMTP_USER');
  if (!env.smtp.pass) missing.push('SMTP_PASS');
  if (!env.smtp.from) missing.push('SMTP_FROM');
  if (missing.length) {
    const err = new Error(`Email service is not configured. Missing: ${missing.join(', ')}`);
    err.status = 500;
    throw err;
  }
}

function transporter() {
  requireEmailConfig();
  const port = Number(env.smtp.port || 587);
  return nodemailer.createTransport({
    host: env.smtp.host,
    port,
    secure: env.smtp.secure || port === 465,
    auth: {
      user: env.smtp.user,
      // Google App Passwords are often copied with spaces; remove whitespace safely.
      pass: String(env.smtp.pass || '').replace(/\s+/g, ''),
    },
  });
}

export async function sendPasswordResetCode({ to, name = '', code }) {
  const displayName = name?.trim() || 'Study Buddy user';
  const subject = 'Study Buddy password reset code';
  const text = `Hello ${displayName},\n\nYour Study Buddy password reset code is: ${code}\n\nThis code expires in 10 minutes. If you did not request it, ignore this message.\n\nStudy Buddy Team`;
  const html = `
    <div style="font-family:Arial,sans-serif;background:#f6f4ff;padding:24px;color:#1f1733">
      <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:18px;padding:28px;border:1px solid #e8ddff">
        <h2 style="margin:0 0 10px;color:#6d28d9">Study Buddy</h2>
        <p style="margin:0 0 18px">Hello ${escapeHtml(displayName)},</p>
        <p style="margin:0 0 18px">Use this verification code to reset your password:</p>
        <div style="font-size:32px;font-weight:800;letter-spacing:8px;text-align:center;background:#f3e8ff;color:#4c1d95;padding:18px;border-radius:14px;margin:18px 0">${code}</div>
        <p style="margin:0;color:#6b627d">This code expires in 10 minutes. If you did not request it, you can ignore this email.</p>
      </div>
    </div>`;

  const cleanTo = String(to || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanTo)) {
    const err = new Error('Invalid recipient email address');
    err.status = 400;
    throw err;
  }
  await transporter().sendMail({ from: env.smtp.from, to: cleanTo, subject, text, html });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
