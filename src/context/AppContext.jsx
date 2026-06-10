import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { I18N } from '../data/i18n';
import * as api from '../api';

// Fallback static data (used until API loads)
import { MAJORS as STATIC_MAJORS, COURSES as STATIC_COURSES, CATALOG as STATIC_CATALOG, PROFILE as STATIC_PROFILE } from '../data/courses';
import { EVENTS as STATIC_EVENTS, ROOMS as STATIC_ROOMS, INVITES as STATIC_INVITES } from '../data/events';
import { NOTIFS as STATIC_NOTIFS } from '../data/notifications';

const AppContext = createContext(null);

const DEFAULT_STATE = {
  lang: 'en',
  theme: 'light',
  view: 'landing',
  prevView: null,
  selectedCourseId: null,
  courseDetailFrom: null,
  detailTab: 'overview',
  selectedMajorId: null,
  filterLevel: 'all',
  filterProgress: 'all',
};

const hasRows = (value) => Array.isArray(value) && value.length > 0;

const isAuthError = (err) => err?.status === 401 || err?.isAuthError === true;

const toMajor = (m) => ({
  id: m.id,
  icon: m.icon,
  nameEn: m.name_en,
  nameAr: m.name_ar,
  descEn: m.desc_en,
  descAr: m.desc_ar,
  courses: m.courses,
  credits: m.credits,
  students: m.students,
});

const toCatalogCourse = (c) => ({
  id: c.id,
  code: c.code,
  nameEn: c.name_en,
  nameAr: c.name_ar,
  majorId: c.major_id,
  credits: c.credits,
  level: c.level,
  instructor: c.instructor,
  students: c.students,
});

const toEvent = (e) => ({
  id: e.id,
  type: e.type,
  courseId: e.course_id,
  titleAr: e.title_ar,
  titleEn: e.title_en,
  start: new Date(e.start_time),
  end: new Date(e.end_time),
  link: e.link,
  host: e.host,
  hostEn: e.host_en,
  attendees: e.attendees || [],
  attendeesCount: e.attendees_count,
});

const toRoom = (r) => ({
  id: r.id,
  code: r.code,
  nameEn: r.name_en,
  nameAr: r.name_ar,
  status: r.status,
  capacity: r.capacity,
  current: r.current,
});

const toEnrolledCourse = (c) => ({
  id: c.course_id,
  code: c.code,
  nameEn: c.name_en,
  nameAr: c.name_ar,
  majorId: c.major_id,
  credits: c.credits,
  progress: c.progress,
  grade: c.grade,
  status: c.status,
  nextClass: c.next_class,
  instructor: c.instructor,
  colorVar: c.color_var,
  level: c.level,
});

const toNotification = (n) => ({
  id: n.id,
  kind: n.kind,
  titleEn: n.title_en,
  titleAr: n.title_ar,
  textEn: n.text_en,
  textAr: n.text_ar,
  time: n.time_en,
  timeAr: n.time_ar,
  unread: !!n.unread,
  view: n.view,
});

const toInvite = (i) => ({
  id: i.id,
  titleEn: i.title_en,
  titleAr: i.title_ar,
  fromEn: i.from_en,
  fromAr: i.from_ar,
  when: new Date(i.when_time),
});

export function AppProvider({ children }) {
  const [state, setState] = useState(DEFAULT_STATE);
  const [toasts, setToasts] = useState([]);
  const sessionErrorHandledRef = useRef(false);

  // Auth state
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(api.getToken());

  // Data state — starts with static fallbacks, gets replaced by API data
  const [majors, setMajors] = useState(STATIC_MAJORS);
  const [courses, setCourses] = useState(STATIC_COURSES);
  const [catalog, setCatalog] = useState(STATIC_CATALOG);
  const [events, setEvents] = useState(STATIC_EVENTS);
  const [notifications, setNotifications] = useState(STATIC_NOTIFS);
  const [rooms, setRooms] = useState(STATIC_ROOMS);
  const [invites, setInvites] = useState(STATIC_INVITES);
  const [profile, setProfile] = useState(STATIC_PROFILE);

  // Apply lang/theme to document
  useEffect(() => {
    document.documentElement.dir = state.lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = state.lang;
  }, [state.lang]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', state.theme);
  }, [state.theme]);

  const t = useCallback(
    (key) => {
      const dict = I18N[state.lang] || I18N['en'];
      return dict[key] ?? key;
    },
    [state.lang]
  );

  const setView = useCallback((view) => {
    setState((prev) => ({ ...prev, prevView: prev.view, view }));
  }, []);

  const setTheme = useCallback((theme) => {
    setState((prev) => ({ ...prev, theme }));
    if (api.getToken()) api.updateProfile({ theme }).catch(() => null);
  }, []);

  const setLang = useCallback((lang) => {
    setState((prev) => ({ ...prev, lang }));
    if (api.getToken()) api.updateProfile({ lang }).catch(() => null);
  }, []);

  const toast = useCallback((msg, kind = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, msg, kind }]);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearAuthState = useCallback((nextView = 'landing') => {
    api.setToken(null);
    setTokenState(null);
    setUser(null);
    setProfile(STATIC_PROFILE);
    setCourses(STATIC_COURSES);
    setNotifications(STATIC_NOTIFS);
    setInvites(STATIC_INVITES);
    setState(prev => ({ ...DEFAULT_STATE, lang: prev.lang, theme: prev.theme, view: nextView }));
  }, []);

  // ─── Load data from API ─────────────────────────────────────────
  const loadData = useCallback(async () => {
    try {
      const [majorsData, catalogData, eventsData, roomsData] = await Promise.all([
        api.getMajors().catch(() => null),
        api.getCatalog().catch(() => null),
        api.getEvents().catch(() => null),
        api.getRooms().catch(() => null),
      ]);

      if (hasRows(majorsData)) setMajors(majorsData.map(toMajor));
      if (hasRows(catalogData)) setCatalog(catalogData.map(toCatalogCourse));
      if (hasRows(eventsData)) setEvents(eventsData.map(toEvent));
      if (hasRows(roomsData)) setRooms(roomsData.map(toRoom));
    } catch (err) {
      console.warn('Failed to load public data, using fallbacks', err);
    }
  }, []);

  const addEvent = useCallback(async (evData) => {
    const backendData = {
      type: evData.type,
      course_id: evData.courseId,
      title_ar: evData.titleAr,
      title_en: evData.titleEn,
      start_time: evData.start.toISOString(),
      end_time: evData.end.toISOString(),
      link: evData.link,
      host: evData.host,
      host_en: evData.hostEn,
      attendees: evData.attendees,
      attendees_count: evData.attendeesCount,
    };
    await api.createEvent(backendData);
    await loadData();
  }, [loadData]);

  const loadUserData = useCallback(async () => {
    const protectedRequest = async (fn) => {
      try {
        return await fn();
      } catch (err) {
        if (isAuthError(err)) throw err;
        return null;
      }
    };

    const profileData = await api.getProfile();
    if (!profileData) throw new Error('Profile could not be loaded');

    setUser(profileData);
    setProfile({
      nameEn: profileData.name, nameAr: profileData.name,
      email: profileData.email, phone: profileData.phone || '',
      majorId: profileData.major_id, university: profileData.university || '',
      year: profileData.year || '3', gpa: profileData.gpa || '0.00',
      bio: profileData.bio || '', bioAr: profileData.bio_ar || '',
      initials: profileData.initials || 'SB', notifs: !!profileData.notifs,
      role: profileData.role || 'student',
    });
    setState(prev => ({
      ...prev,
      theme: profileData.theme || prev.theme,
      lang: profileData.lang || prev.lang,
    }));

    const [coursesData, notifsData, invitesData] = await Promise.all([
      protectedRequest(api.getCourses),
      protectedRequest(api.getNotifications),
      protectedRequest(api.getInvites),
    ]);

    if (Array.isArray(coursesData)) setCourses(coursesData.map(toEnrolledCourse));
    if (hasRows(notifsData)) setNotifications(notifsData.map(toNotification));
    if (hasRows(invitesData)) setInvites(invitesData.map(toInvite));
  }, []);

  // ─── Auth methods ─────────────────────────────────────────────────
  const doLogin = useCallback(async (email, password) => {
    const res = await api.login(email, password);
    api.setToken(res.token);
    setTokenState(res.token);
    setUser(res.user);
    sessionErrorHandledRef.current = false;
    await loadUserData();
    setState(prev => ({ ...prev, view: 'dashboard' }));
    return res;
  }, [loadUserData]);

  const doSignup = useCallback(async (data) => {
    const res = await api.signup(data);
    api.setToken(res.token);
    setTokenState(res.token);
    setUser(res.user);
    sessionErrorHandledRef.current = false;
    await loadUserData();
    return res;
  }, [loadUserData]);

  const doGoogleLogin = useCallback(async (name, email) => {
    const res = await api.googleAuth(name, email);
    api.setToken(res.token);
    setTokenState(res.token);
    setUser(res.user);
    sessionErrorHandledRef.current = false;
    await loadUserData();
    return res;
  }, [loadUserData]);

  const doLogout = useCallback(() => {
    sessionErrorHandledRef.current = false;
    clearAuthState('landing');
  }, [clearAuthState]);

  // Load public data on mount
  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    const handleAuthError = () => {
      if (sessionErrorHandledRef.current) return;
      sessionErrorHandledRef.current = true;
      clearAuthState('auth');
    };

    window.addEventListener(api.AUTH_ERROR_EVENT, handleAuthError);
    return () => window.removeEventListener(api.AUTH_ERROR_EVENT, handleAuthError);
  }, [clearAuthState]);

  // If we have a saved token, try to restore session
  useEffect(() => {
    if (!token) return;

    loadUserData().then(() => {
      sessionErrorHandledRef.current = false;
      setState(prev => ({ ...prev, view: 'dashboard' }));
    }).catch((err) => {
      if (isAuthError(err)) {
        sessionErrorHandledRef.current = true;
        clearAuthState('auth');
        return;
      }
      console.warn('Failed to restore saved session', err);
      clearAuthState('auth');
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const value = {
    state, setState, t, setView, setTheme, setLang,
    toast, toasts, dismissToast,
    // Auth
    user, token, doLogin, doSignup, doGoogleLogin, doLogout,
    // Data
    majors, courses, catalog, events, notifications, rooms, invites, profile,
    setCourses, setEvents, setNotifications, setInvites, setProfile,
    // Reload helpers
    loadData, loadUserData, addEvent,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return ctx;
}
