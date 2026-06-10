import { useApp } from '../context/AppContext';
import Notifications from './Notifications';
import { useState, useEffect, useRef, useMemo } from 'react';
import * as api from '../api';

const PAGE_TITLES = {
  dashboard:     { en: 'Dashboard',     ar: 'الرئيسية' },
  courses:       { en: 'My Courses',    ar: 'مقرراتي' },
  majors:        { en: 'Majors',        ar: 'التخصصات' },
  'major-detail':{ en: 'Major Detail',  ar: 'تفاصيل التخصص' },
  'course-detail':{ en: 'Course Detail',ar: 'تفاصيل المقرر' },
  profile:       { en: 'My Profile',    ar: 'ملفي الشخصي' },
  meetings:      { en: 'Meetings',      ar: 'الاجتماعات' },
  ai:            { en: 'AI Assistant',  ar: 'المساعد الذكي' },
  calendar:      { en: 'Calendar',      ar: 'التقويم' },
};

/* ── Search bar component ── */
function SearchBar({ isAr }) {
  const { courses: COURSES, majors: MAJORS, catalog: CATALOG, events: EVENTS, setState, setView } = useApp();
  const [query, setQuery]   = useState('');
  const [open, setOpen]     = useState(false);
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);
  const wrapRef  = useRef(null);

  /* Build searchable items */
  const ALL_ITEMS = useMemo(() => {
    const items = [];

    /* Pages */
    const PAGES = [
      { icon: 'home',       nameAr: 'الرئيسية',      nameEn: 'Dashboard',     view: 'dashboard',  type: 'page' },
      { icon: 'book-open',  nameAr: 'مقرراتي',       nameEn: 'My Courses',    view: 'courses',    type: 'page' },
      { icon: 'layers',     nameAr: 'التخصصات',      nameEn: 'Majors',        view: 'majors',     type: 'page' },
      { icon: 'video',      nameAr: 'الاجتماعات',    nameEn: 'Meetings',      view: 'meetings',   type: 'page' },
      { icon: 'zap',        nameAr: 'المساعد الذكي', nameEn: 'AI Assistant',  view: 'ai',         type: 'page' },
      { icon: 'calendar',   nameAr: 'التقويم',       nameEn: 'Calendar',      view: 'calendar',   type: 'page' },
      { icon: 'user',       nameAr: 'الملف الشخصي',  nameEn: 'My Profile',    view: 'profile',    type: 'page' },
    ];
    items.push(...PAGES);

    /* Enrolled courses */
    COURSES.forEach(c => items.push({
      icon: 'book-open',
      nameAr: c.nameAr,
      nameEn: c.nameEn,
      sub: c.code,
      view: 'course-detail',
      type: 'course',
      courseId: c.id,
    }));

    /* Catalog courses */
    CATALOG.forEach(c => {
      if (!COURSES.find(ec => ec.id === c.id)) {
        items.push({
          icon: 'book',
          nameAr: c.nameAr,
          nameEn: c.nameEn,
          sub: `${c.code} · ${c.instructor}`,
          view: 'majors',
          type: 'catalog',
        });
      }
    });

    /* Majors */
    MAJORS.forEach(m => items.push({
      icon: 'layers',
      nameAr: m.nameAr,
      nameEn: m.nameEn,
      sub: isAr ? 'تخصص' : 'Major',
      view: 'major-detail',
      type: 'major',
      majorId: m.id,
    }));

    /* Upcoming events */
    const now = new Date();
    EVENTS.filter(e => e.start >= now).slice(0, 10).forEach(e => items.push({
      icon: e.type === 'deadline' ? 'clock' : 'calendar',
      nameAr: e.titleAr,
      nameEn: e.titleEn,
      sub: e.start.toLocaleDateString(isAr ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric' }),
      view: 'calendar',
      type: 'event',
    }));

    return items;
  }, [COURSES, MAJORS, CATALOG, EVENTS, isAr]);

  /* Filter results */
  const results = useMemo(() => {
    if (!query.trim()) {
      /* Default suggestions when no query */
      return ALL_ITEMS.filter(i => i.type === 'page').slice(0, 6);
    }
    const q = query.toLowerCase();
    return ALL_ITEMS.filter(i =>
      i.nameAr.includes(query) ||
      i.nameEn.toLowerCase().includes(q) ||
      (i.sub || '').toLowerCase().includes(q)
    ).slice(0, 8);
  }, [query, ALL_ITEMS]);

  /* Keyboard shortcut Ctrl+K / Cmd+K */
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
      if (e.key === 'Escape') { setOpen(false); setQuery(''); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  /* Arrow key navigation */
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => Math.min(a + 1, results.length - 1)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setActive(a => Math.max(a - 1, 0)); }
    if (e.key === 'Enter' && results[active]) { pick(results[active]); }
    if (e.key === 'Escape') { setOpen(false); setQuery(''); inputRef.current?.blur(); }
  };

  /* Close when clicking outside */
  useEffect(() => {
    const handler = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const pick = (item) => {
    if (item.type === 'course' && item.courseId) {
      setState((p) => ({ ...p, selectedCourseId: item.courseId, courseDetailFrom: 'courses', detailTab: 'overview' }));
    }
    if (item.type === 'major' && item.majorId) {
      setState((p) => ({ ...p, selectedMajorId: item.majorId }));
    }
    setView(item.view);
    setQuery('');
    setOpen(false);
    inputRef.current?.blur();
  };

  const typeLabel = (type) => {
    const map = { page: isAr ? 'صفحة' : 'Page', course: isAr ? 'مادة' : 'Course', catalog: isAr ? 'فهرس' : 'Catalog', major: isAr ? 'تخصص' : 'Major', event: isAr ? 'حدث' : 'Event' };
    return map[type] || type;
  };

  const typeClass = (type) => `search-type--${type || 'page'}`;

  return (
    <div ref={wrapRef} className="topbar-search">
      {/* Input */}
      <div
        className="search"
        onClick={() => { inputRef.current?.focus(); setOpen(true); }}
      >
        <svg width="16" height="16"><use href="#icon-search" /></svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setActive(0); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={isAr ? 'ابحث في الموقع...' : 'Search anywhere...'}
          autoComplete="off"
        />
        {!query && <kbd className="kbd">{isAr ? 'K ⌘' : '⌘K'}</kbd>}
        {query && (
          <button
            className="search__clear"
            onClick={() => { setQuery(''); inputRef.current?.focus(); }}
            aria-label={isAr ? 'مسح البحث' : 'Clear search'}
          >
            <svg width="14" height="14"><use href="#icon-x" /></svg>
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div className="search-dropdown">
          {results.length === 0 ? (
            <div className="search-dropdown__empty">
              <svg width="20" height="20"><use href="#icon-search" /></svg>
              <span>{isAr ? 'لا توجد نتائج' : 'No results found'}</span>
            </div>
          ) : (
            <>
              {!query && (
                <div className="search-dropdown__header">
                  {isAr ? 'اقتراحات سريعة' : 'Quick suggestions'}
                </div>
              )}
              {query && results.length > 0 && (
                <div className="search-dropdown__header">
                  {isAr ? `${results.length} نتيجة` : `${results.length} result${results.length !== 1 ? 's' : ''}`}
                </div>
              )}
              {results.map((item, i) => (
                <button
                  key={i}
                  className={`search-dropdown__item${i === active ? ' is-active' : ''}`}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => pick(item)}
                >
                  <div className={`search-dropdown__item-icon search-icon--${item.type}`}>
                    <svg width="14" height="14"><use href={`#icon-${item.icon}`} /></svg>
                  </div>
                  <div className="search-dropdown__item-body">
                    <span className="search-dropdown__item-name">
                      {isAr ? item.nameAr : item.nameEn}
                    </span>
                    {item.sub && <span className="search-dropdown__item-sub">{item.sub}</span>}
                  </div>
                  <span className={`search-dropdown__item-type ${typeClass(item.type)}`}>
                    {typeLabel(item.type)}
                  </span>
                </button>
              ))}
            </>
          )}

          {/* Footer */}
          <div className="search-dropdown__footer">
            <span><kbd>↑</kbd><kbd>↓</kbd> {isAr ? 'للتنقل' : 'navigate'}</span>
            <span><kbd>↵</kbd> {isAr ? 'للفتح' : 'open'}</span>
            <span><kbd>Esc</kbd> {isAr ? 'للإغلاق' : 'close'}</span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Main Topbar ── */
export default function Topbar({ onMenuClick }) {
  const { state, setLang, setTheme, courses: COURSES, profile: PROFILE, toast } = useApp();
  const isAr = state.lang === 'ar';
  const page = PAGE_TITLES[state.view] || PAGE_TITLES.dashboard;
  const [reportOpen, setReportOpen] = useState(false);
  const [reportBusy, setReportBusy] = useState(false);
  const [reportForm, setReportForm] = useState({ category: 'bug', subject: '', message: '' });

  const submitReport = async (e) => {
    e?.preventDefault();
    if (reportForm.subject.trim().length < 3 || reportForm.message.trim().length < 10) {
      toast(isAr ? 'اكتب عنوان وتفاصيل واضحة للبلاغ' : 'Please add a clear subject and details', 'warning');
      return;
    }
    setReportBusy(true);
    try {
      await api.createReport({
        name: PROFILE?.name || '',
        email: PROFILE?.email || '',
        category: reportForm.category,
        subject: reportForm.subject,
        message: reportForm.message,
      });
      setReportOpen(false);
      setReportForm({ category: 'bug', subject: '', message: '' });
      toast(isAr ? 'تم إرسال البلاغ للإدارة' : 'Report sent to admins', 'success');
    } catch (err) {
      toast(err.message || (isAr ? 'تعذر إرسال البلاغ' : 'Failed to send report'), 'warning');
    } finally {
      setReportBusy(false);
    }
  };

  const getSubtitle = () => {
    switch (state.view) {
      case 'dashboard': return isAr ? `الفصل الربيعي 2025 · المعدل ${PROFILE.gpa}` : `Spring 2025 · GPA ${PROFILE.gpa}`;
      case 'courses':   return isAr ? `${COURSES.length} مقررات مسجّلة هذا الفصل` : `${COURSES.length} enrolled this semester`;
      case 'majors':    return isAr ? 'استكشف البرامج الأكاديمية' : 'Explore academic programs';
      case 'profile':   return isAr ? 'إدارة معلوماتك الشخصية' : 'Manage your information';
      case 'meetings':  return isAr ? 'الجلسات القادمة والغرف' : 'Upcoming sessions & rooms';
      case 'ai':        return isAr ? 'مدعوم بالمساعد الذكي' : 'Powered by AI assistant';
      case 'calendar':  return isAr ? 'جدولك والأحداث' : 'Your schedule & events';
      default:          return '';
    }
  };

  return (
    <header className="topbar">
      <button className="topbar__menu icon-btn" onClick={onMenuClick} aria-label="Menu">
        <svg width="18" height="18"><use href="#icon-menu" /></svg>
      </button>

      <div className="topbar__title">
        <h1>{isAr ? page.ar : page.en}</h1>
        {getSubtitle() && <p>{getSubtitle()}</p>}
      </div>

      <SearchBar isAr={isAr} />

      <div className="topbar__actions">
        <div className="lang-switch">
          <button className={state.lang === 'en' ? 'is-active' : ''} onClick={() => setLang('en')}>EN</button>
          <button className={state.lang === 'ar' ? 'is-active' : ''} onClick={() => setLang('ar')}>AR</button>
        </div>
        <button className="icon-btn" onClick={() => setTheme(state.theme === 'dark' ? 'light' : 'dark')} aria-label="Toggle theme">
          <svg width="18" height="18"><use href={`#icon-${state.theme === 'dark' ? 'sun' : 'moon'}`} /></svg>
        </button>
        <button className="icon-btn" onClick={() => setReportOpen(true)} aria-label={isAr ? 'الإبلاغ عن مشكلة' : 'Report issue'} title={isAr ? 'الإبلاغ عن مشكلة' : 'Report issue'}>
          <svg width="18" height="18"><use href="#icon-alert-circle" /></svg>
        </button>
        <Notifications />
        <div className="topbar__avatar">{PROFILE?.initials || 'SB'}</div>
      </div>

      {reportOpen && (
        <div className="modal-backdrop is-open report-modal-backdrop" onClick={() => !reportBusy && setReportOpen(false)}>
          <div className="modal-content card app-report-modal" onClick={(e) => e.stopPropagation()}>
            <header className="card__header app-report-modal__header">
              <h3 className="card__title">{isAr ? 'الإبلاغ عن مشكلة' : 'Report an issue'}</h3>
              <button className="icon-btn" type="button" onClick={() => setReportOpen(false)} disabled={reportBusy}>
                <svg width="14" height="14"><use href="#icon-x"/></svg>
              </button>
            </header>
            <form className="report-form" onSubmit={submitReport}>
              <label className="report-form__field">
                <span>{isAr ? 'نوع البلاغ' : 'Category'}</span>
                <select className="report-form__control" value={reportForm.category} onChange={(e) => setReportForm({ ...reportForm, category: e.target.value })}>
                  <option value="bug">{isAr ? 'خلل تقني' : 'Bug'}</option>
                  <option value="content">{isAr ? 'مشكلة في المحتوى' : 'Content issue'}</option>
                  <option value="account">{isAr ? 'مشكلة في الحساب' : 'Account issue'}</option>
                  <option value="suggestion">{isAr ? 'اقتراح تحسين' : 'Suggestion'}</option>
                </select>
              </label>
              <label className="report-form__field">
                <span>{isAr ? 'عنوان المشكلة' : 'Subject'}</span>
                <input className="report-form__control" value={reportForm.subject} onChange={(e) => setReportForm({ ...reportForm, subject: e.target.value })} minLength={3} required />
              </label>
              <label className="report-form__field">
                <span>{isAr ? 'التفاصيل' : 'Details'}</span>
                <textarea className="report-form__control report-form__textarea" value={reportForm.message} onChange={(e) => setReportForm({ ...reportForm, message: e.target.value })} minLength={10} rows={5} required />
              </label>
              <button className="btn btn--primary btn--block" type="submit" disabled={reportBusy}>
                {reportBusy ? (isAr ? 'جاري الإرسال...' : 'Sending...') : (isAr ? 'إرسال البلاغ' : 'Submit report')}
              </button>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
