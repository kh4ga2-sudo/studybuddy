import { env } from '../config/env.js';

const CLAUDE_MODEL = 'claude-sonnet-4-6';
const MAX_OUTPUT_TOKENS = 900;
const MAX_TEXT_CHARS = 4000;
const MAX_HISTORY_CHARS = 1200;
const MAX_MATERIALS = 6;

class ClaudeServiceUnavailableError extends Error {
  constructor(message = 'Claude service is unavailable') {
    super(message);
    this.name = 'ClaudeServiceUnavailableError';
  }
}

let client = null;
let sdkPromise = null;

function limitText(value, maxChars) {
  const text = String(value || '').trim();
  if (text.length <= maxChars) return text;
  return `${text.slice(0, maxChars)}…`;
}

function normalizeMode(mode) {
  return ['chat', 'explain', 'quiz', 'summary'].includes(mode) ? mode : 'chat';
}

function modeInstruction(mode) {
  const safeMode = normalizeMode(mode);
  if (safeMode === 'explain') return 'Explain clearly and simply. Break down concepts step by step when useful.';
  if (safeMode === 'quiz') return 'Help with quiz practice. Create useful study questions, answers, and brief explanations when appropriate.';
  if (safeMode === 'summary') return 'Summarize clearly. Keep the answer organized and focused on the key points.';
  return 'Respond as a helpful study assistant. Clarify, explain, summarize, or guide the student as needed.';
}

function formatCourseContext(course) {
  if (!course) return 'No selected course.';

  const lines = [
    `Code: ${course.code || 'N/A'}`,
    `Name EN: ${course.name_en || 'N/A'}`,
    `Name AR: ${course.name_ar || 'N/A'}`,
    `Instructor: ${course.instructor || 'N/A'}`,
    `Credits: ${course.credits ?? 'N/A'}`,
  ];

  const materials = Array.isArray(course.materials) ? course.materials.slice(0, MAX_MATERIALS) : [];
  if (materials.length) {
    lines.push('Recent material titles:');
    for (const material of materials) {
      const title = material.title || material.title_ar || 'Untitled material';
      const category = material.category ? ` (${material.category})` : '';
      lines.push(`- ${limitText(title, 120)}${category}`);
    }
  }

  return lines.join('\n');
}

function formatAttachmentContext(attachment) {
  if (!attachment?.name && !attachment?.type) return 'No attachment.';
  const sizeInfo = attachment?.data ? `\nFile data present: yes, but raw file data was not sent to Claude.` : '';
  return [
    `File name: ${attachment.name || 'N/A'}`,
    `File type: ${attachment.type || 'N/A'}${sizeInfo}`,
  ].join('\n');
}

function toClaudeRole(role) {
  if (role === 'assistant' || role === 'ai') return 'assistant';
  return 'user';
}

function buildMessages({ userText, mode, course, history = [], attachment }) {
  const safeMode = normalizeMode(mode);
  const messages = [];

  for (const item of history) {
    const content = limitText(item?.text, MAX_HISTORY_CHARS);
    if (!content) continue;
    const role = toClaudeRole(item.role);
    const previous = messages[messages.length - 1];
    if (previous?.role === role) {
      previous.content = `${previous.content}\n\n${content}`;
    } else {
      messages.push({ role, content });
    }
  }

  const latestPrompt = [
    `Mode: ${safeMode}`,
    `Mode instruction: ${modeInstruction(safeMode)}`,
    'Course context:',
    formatCourseContext(course),
    'Attachment metadata:',
    formatAttachmentContext(attachment),
    'Latest user message:',
    limitText(userText, MAX_TEXT_CHARS),
  ].join('\n\n');

  const previous = messages[messages.length - 1];
  if (previous?.role === 'user') {
    previous.content = `${previous.content}\n\n${latestPrompt}`;
  } else {
    messages.push({ role: 'user', content: latestPrompt });
  }

  return messages.slice(-9);
}

async function getClient() {
  if (!env.anthropicApiKey) return null;
  if (client) return client;
  if (!sdkPromise) {
    sdkPromise = import('@anthropic-ai/sdk');
  }
  const module = await sdkPromise;
  const Anthropic = module.default;
  client = new Anthropic({ apiKey: env.anthropicApiKey });
  return client;
}

export async function generateStudyBuddyReply({ userText, mode, course, history, attachment }) {
  const anthropic = await getClient().catch(() => null);
  if (!anthropic) throw new ClaudeServiceUnavailableError();

  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: MAX_OUTPUT_TOKENS,
    temperature: 0.3,
    system: [
      'You are Study Buddy, a university study assistant inside a learning app.',
      'Answer in the same language as the latest user message whenever possible. If the message is mixed, use the dominant language.',
      'Use the provided course context and recent conversation history, but do not invent course details that were not provided.',
      'If the context is insufficient, say what is missing and give the best safe guidance you can.',
      'Keep answers focused, practical, and student-friendly.',
    ].join(' '),
    messages: buildMessages({ userText, mode, course, history, attachment }),
  });

  const text = response.content
    .filter((part) => part.type === 'text')
    .map((part) => part.text)
    .join('\n')
    .trim();

  if (!text) throw new ClaudeServiceUnavailableError();
  return text;
}
