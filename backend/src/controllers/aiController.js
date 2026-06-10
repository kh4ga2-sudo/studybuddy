import prisma from '../config/prisma.js';
import { makeId } from '../utils/id.js';
import { generateStudyBuddyReply } from '../services/anthropicService.js';

export async function listConversations(req, res) {
  res.json(await prisma.aiConversation.findMany({ where: { user_id: req.user.id }, orderBy: { created_at: 'desc' } }));
}
export async function createConversation(req, res) {
  const id = makeId('c');
  await prisma.aiConversation.create({ data: { id, user_id: req.user.id, title: req.body.title || 'New conversation' } });
  res.json({ id, ok: true });
}
export async function listMessages(req, res) {
  res.json(await prisma.aiMessage.findMany({ where: { conv_id: req.params.id }, orderBy: { created_at: 'asc' } }));
}
function buildFallbackReply(text) {
  const isAr = /[\u0600-\u06FF]/.test(text || '');
  return isAr
    ? 'خدمة الذكاء الاصطناعي غير متاحة مؤقتًا أو لم يتم إعدادها بعد. تم حفظ رسالتك، جرّب مرة أخرى لاحقًا بعد ضبط مفتاح Claude.'
    : 'The AI service is temporarily unavailable or not configured yet. Your message was saved. Please try again later after the Claude API key is configured.';
}

export async function sendMessage(req, res) {
  const { role, text, file, mode = 'chat', courseId } = req.body;
  const msg = await prisma.aiMessage.create({ data: { conv_id: req.params.id, role, text: text || '', file_name: file?.name || null, file_type: file?.type || null, file_data: file?.data || null } });

  if (role === 'user') {
    let assistantText = buildFallbackReply(text);

    try {
      const course = courseId ? await prisma.catalogCourse.findUnique({
        where: { id: String(courseId) },
        include: {
          materials: {
            orderBy: { created_at: 'desc' },
            take: 6,
            select: { title: true, title_ar: true, category: true },
          },
        },
      }) : null;

      const history = await prisma.aiMessage.findMany({
        where: { conv_id: req.params.id, NOT: { id: msg.id } },
        orderBy: { created_at: 'desc' },
        take: 8,
        select: { role: true, text: true },
      });

      assistantText = await generateStudyBuddyReply({
        userText: text || '',
        mode,
        course,
        history: history.reverse(),
        attachment: file ? { name: file.name || null, type: file.type || null, data: file.data || null } : null,
      });
    } catch {
      assistantText = buildFallbackReply(text);
    }

    await prisma.aiMessage.create({ data: { conv_id: req.params.id, role: 'assistant', text: assistantText } });
  }

  res.json({ id: msg.id, ok: true });
}
export async function deleteConversation(req, res) {
  await prisma.aiConversation.deleteMany({ where: { id: req.params.id, user_id: req.user.id } });
  res.json({ ok: true });
}
