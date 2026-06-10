const API = '/api';
export const AUTH_ERROR_EVENT = 'studybuddy:auth-error';

let _token = localStorage.getItem('sb_token') || null;

export class ApiError extends Error {
  constructor(message, status, body = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
    this.isAuthError = status === 401;
  }
}

export function setToken(t) {
  _token = t;
  if (t) localStorage.setItem('sb_token', t);
  else localStorage.removeItem('sb_token');
}

export function getToken() {
  return _token;
}

async function readBody(res) {
  const text = await res.text().catch(() => '');
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { error: text };
  }
}

async function request(path, opts = {}) {
  const headers = { 'Content-Type': 'application/json', ...opts.headers };
  if (_token) headers['Authorization'] = `Bearer ${_token}`;
  const res = await fetch(`${API}${path}`, { ...opts, headers });
  const body = await readBody(res);

  if (!res.ok) {
    const message = body?.error || body?.message || `Request failed: ${res.status}`;
    const error = new ApiError(message, res.status, body);
    if (error.isAuthError && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(AUTH_ERROR_EVENT, { detail: { path, status: res.status, message } }));
    }
    throw error;
  }

  return body;
}

// ─── Auth ────────────────────────────────────────────────────────────
export const login = (email, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
export const signup = (data) => request('/auth/signup', { method: 'POST', body: JSON.stringify(data) });
export const googleAuth = (name, email) => request('/auth/google', { method: 'POST', body: JSON.stringify({ name, email }) });
export const changePassword = (currentPassword, newPassword) => request('/auth/password', { method: 'PUT', body: JSON.stringify({ currentPassword, newPassword }) });
export const forgotPassword = (email) => request('/auth/password/forgot', { method: 'POST', body: JSON.stringify({ email }) });
export const verifyResetCode = (email, code) => request('/auth/password/verify-code', { method: 'POST', body: JSON.stringify({ email, code }) });
export const resetPassword = (email, code, newPassword) => request('/auth/password/reset', { method: 'POST', body: JSON.stringify({ email, code, newPassword }) });

// ─── Profile ─────────────────────────────────────────────────────────
export const getProfile = () => request('/profile');
export const updateProfile = (data) => request('/profile', { method: 'PUT', body: JSON.stringify(data) });

// ─── Majors ──────────────────────────────────────────────────────────
export const getMajors = () => request('/majors');
export const getMajor = (id) => request(`/majors/${id}`);

// ─── Catalog ─────────────────────────────────────────────────────────
export const getCatalog = (params = {}) => {
  const q = new URLSearchParams(params).toString();
  return request(`/catalog${q ? '?' + q : ''}`);
};

// ─── Courses (enrollments) ───────────────────────────────────────────
export const getCourses = () => request('/courses');
export const enrollCourse = (course_id) => request('/courses', { method: 'POST', body: JSON.stringify({ course_id }) });
export const unenrollCourse = (courseId) => request(`/courses/${courseId}`, { method: 'DELETE' });

// ─── Events ──────────────────────────────────────────────────────────
export const getEvents = () => request('/events');
export const createEvent = (data) => request('/events', { method: 'POST', body: JSON.stringify(data) });
export const deleteEvent = (id) => request(`/events/${id}`, { method: 'DELETE' });

// ─── Notifications ───────────────────────────────────────────────────
export const getNotifications = () => request('/notifications');
export const markNotifRead = (id) => request(`/notifications/${id}/read`, { method: 'PUT' });
export const markAllRead = () => request('/notifications/read-all', { method: 'PUT' });
export const clearNotifications = () => request('/notifications', { method: 'DELETE' });

// ─── Materials ───────────────────────────────────────────────────────
export const getMaterials = (courseId, category) => {
  const q = category ? `?category=${category}` : '';
  return request(`/courses/${courseId}/materials${q}`);
};

// ─── Rooms ───────────────────────────────────────────────────────────
export const getRooms = () => request('/rooms');

// ─── Invites ─────────────────────────────────────────────────────────
export const getInvites = () => request('/invites');
export const respondInvite = (id, status) => request(`/invites/${id}`, { method: 'PUT', body: JSON.stringify({ status }) });

// ─── Chat ────────────────────────────────────────────────────────────
export const getChat = (courseId) => request(`/chat/${courseId}`);
export const sendChat = (courseId, text) => request(`/chat/${courseId}`, { method: 'POST', body: JSON.stringify({ text }) });

// ─── AI ──────────────────────────────────────────────────────────────
export const getAIConversations = () => request('/ai/conversations');
export const createAIConversation = (title) => request('/ai/conversations', { method: 'POST', body: JSON.stringify({ title }) });
export const getAIMessages = (convId) => request(`/ai/conversations/${convId}/messages`);
export const sendAIMessage = (convId, role, text, file = null, mode = 'chat', courseId = null) => request(`/ai/conversations/${convId}/messages`, { method: 'POST', body: JSON.stringify({ role, text, file, mode, courseId }) });
export const deleteAIConversation = (id) => request(`/ai/conversations/${id}`, { method: 'DELETE' });

// ─── Dashboard ───────────────────────────────────────────────────────
export const getDashboard = () => request('/dashboard');

// ─── Quiz ────────────────────────────────────────────────────────────
export const getQuizBank = () => request('/quiz');

// ─── Admin ───────────────────────────────────────────────────────────
export const adminGetCatalog = () => request('/admin/catalog');
export const adminCreateCourse = (data) => request('/admin/catalog', { method: 'POST', body: JSON.stringify(data) });
export const adminUpdateCourse = (id, data) => request(`/admin/catalog/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const adminDeleteCourse = (id) => request(`/admin/catalog/${id}`, { method: 'DELETE' });

export const adminGetMaterials = (courseId) => request(`/admin/materials/${courseId}`);
export const adminCreateMaterial = (data) => request('/admin/materials', { method: 'POST', body: JSON.stringify(data) });
export const adminUpdateMaterial = (id, data) => request(`/admin/materials/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const adminDeleteMaterial = (id) => request(`/admin/materials/${id}`, { method: 'DELETE' });

// ─── New Feature Modules ───────────────────────────────────────────
export const getNotes = (courseId = null) => request(`/notes${courseId ? `?courseId=${courseId}` : ''}`);
export const createNote = (data) => request('/notes', { method: 'POST', body: JSON.stringify(data) });
export const updateNote = (id, data) => request(`/notes/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteNote = (id) => request(`/notes/${id}`, { method: 'DELETE' });

export const getResources = (courseId = null) => request(`/resources${courseId ? `?courseId=${courseId}` : ''}`);
export const createResource = (data) => request('/resources', { method: 'POST', body: JSON.stringify(data) });

export const getProgressLogs = (courseId = null) => request(`/progress${courseId ? `?courseId=${courseId}` : ''}`);
export const getProgressSummary = () => request('/progress/summary');
export const updateCourseProgress = (courseId, progress, note = '') => request(`/courses/${courseId}/progress`, { method: 'PUT', body: JSON.stringify({ progress, note }) });

export const createQuizAttempt = (data) => request('/quiz/attempts', { method: 'POST', body: JSON.stringify(data) });
export const getQuizAttempts = () => request('/quiz/attempts');

export const getCommunityPosts = (courseId = null) => request(`/community/posts${courseId ? `?courseId=${courseId}` : ''}`);
export const createCommunityPost = (data) => request('/community/posts', { method: 'POST', body: JSON.stringify(data) });
export const likeCommunityPost = (id) => request(`/community/posts/${id}/like`, { method: 'PUT' });
export const commentCommunityPost = (id, body) => request(`/community/posts/${id}/comments`, { method: 'POST', body: JSON.stringify({ body }) });

export const getAnalytics = () => request('/analytics');
export const getAchievements = () => request('/gamification/achievements');
export const getLeaderboard = () => request('/gamification/leaderboard');
export const adminGetStats = () => request('/admin/stats');

// ─── Support Reports ────────────────────────────────────────────
export const createReport = (data) => request('/reports', { method: 'POST', body: JSON.stringify(data) });
export const adminGetReports = (status = 'all') => request(`/admin/reports?status=${encodeURIComponent(status)}`);
export const adminUpdateReport = (id, data) => request(`/admin/reports/${id}`, { method: 'PUT', body: JSON.stringify(data) });
