import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';

const pad = (n) => String(n).padStart(2, '0');

export default function EventModal({ open, onClose, onSave, defaultDate, mode = 'event' }) {
  const { state, t, courses: COURSES } = useApp();
  const isAr = state.lang === 'ar';
  const [title, setTitle] = useState('');
  const [type, setType] = useState('lecture');
  const [courseId, setCourseId] = useState('');
  const [date, setDate] = useState('');
  const [start, setStart] = useState(mode === 'meeting' ? '10:00' : '');
  const [end, setEnd] = useState(mode === 'meeting' ? '11:30' : '');
  const [location, setLocation] = useState('');
  const [host, setHost] = useState(isAr ? 'يوسف حكيم' : 'Youssef Hakim');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (open) {
      const d = defaultDate || new Date();
      setDate(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`);
      setTitle('');
      setType('lecture');
      setCourseId('');
      setStart(mode === 'meeting' ? '10:00' : '');
      setEnd(mode === 'meeting' ? '11:30' : '');
      setLocation('');
      setNotes('');
      setHost(isAr ? 'يوسف حكيم' : 'Youssef Hakim');
    }
  }, [open, defaultDate, mode, isAr]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !date) return;
    const [y, mo, da] = date.split('-').map(Number);
    let sh = 10, sm = 0, eh = 11, em = 0;
    if (start) { const [a, b] = start.split(':').map(Number); sh = a || 0; sm = b || 0; }
    if (end) { const [a, b] = end.split(':').map(Number); eh = a || 0; em = b || 0; }
    if (start && !end) { eh = sh + 1; em = sm; }

    const ev = {
      id: 'm' + Date.now(),
      type, courseId: courseId || null,
      titleAr: title, titleEn: title,
      start: new Date(y, mo - 1, da, sh, sm),
      end: new Date(y, mo - 1, da, eh, em),
      link: location,
      host, hostEn: host,
      attendees: [host.split(' ').map(s => s[0]).join('').slice(0, 2).toUpperCase()],
      attendeesCount: 1,
    };
    onSave(ev);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" role="dialog" aria-modal="true" style={{ maxWidth: 540 }}>
        <header className="modal__header">
          <div>
            <h3 className="modal__title">
              {t(mode === 'meeting' ? 'calendar.modal.title.meeting' : 'calendar.modal.title')}
            </h3>
            <p className="modal__sub" style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', marginTop: 2 }}>
              {t(mode === 'meeting' ? 'calendar.modal.sub.meeting' : 'calendar.modal.sub')}
            </p>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <svg width="16" height="16"><use href="#icon-x"/></svg>
          </button>
        </header>

        <form className="event-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">{isAr ? 'العنوان' : 'Title'}</label>
            <div className="input">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={isAr ? 'مثال: مراجعة الفصل الثالث' : 'e.g. Chapter 3 review'}
                autoFocus
              />
            </div>
          </div>

          <div className="event-form__row">
            <div className="input-group">
              <label className="input-label">{isAr ? 'النوع' : 'Type'}</label>
              <select className="select" value={type} onChange={(e) => setType(e.target.value)}>
                <option value="lecture">{t('calendar.type.lecture')}</option>
                <option value="study">{t('calendar.type.study')}</option>
                <option value="exam">{t('calendar.type.exam')}</option>
                <option value="deadline">{t('calendar.type.deadline')}</option>
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">{isAr ? 'المقرر' : 'Course'}</label>
              <select className="select" value={courseId} onChange={(e) => setCourseId(e.target.value)}>
                <option value="">{t('calendar.no_course')}</option>
                {COURSES.map((c) => (
                  <option key={c.id} value={c.id}>{c.code} · {isAr ? c.nameAr : c.nameEn}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="event-form__row">
            <div className="input-group">
              <label className="input-label">{isAr ? 'التاريخ' : 'Date'}</label>
              <div className="input">
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
            </div>
            <div className="input-group">
              <label className="input-label">
                {isAr ? 'الوقت' : 'Time'} <span className="label-hint">{isAr ? 'بداية - نهاية' : 'start - end'}</span>
              </label>
              <div className="event-form__row" style={{ gap: 'var(--s-2)' }}>
                <div className="input"><input type="time" value={start} onChange={(e) => setStart(e.target.value)} /></div>
                <div className="input"><input type="time" value={end} onChange={(e) => setEnd(e.target.value)} /></div>
              </div>
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">
              {isAr ? 'الموقع / الرابط' : 'Location / Link'} <span className="label-hint">({isAr ? 'اختياري' : 'optional'})</span>
            </label>
            <div className="input">
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={mode === 'meeting' ? 'https://meet.studybuddy.app/…' : (isAr ? 'قاعة A-101' : 'Room A-101')}
              />
            </div>
          </div>

          {mode === 'meeting' && (
            <div className="input-group ev-meet-only">
              <label className="input-label">{isAr ? 'المستضيف' : 'Host'}</label>
              <div className="input">
                <input value={host} onChange={(e) => setHost(e.target.value)} />
              </div>
            </div>
          )}

          <div className="input-group">
            <label className="input-label">
              {isAr ? 'ملاحظات' : 'Notes'} <span className="label-hint">({isAr ? 'اختياري' : 'optional'})</span>
            </label>
            <textarea className="textarea" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--s-2)', marginTop: 'var(--s-3)' }}>
            <button type="button" className="btn btn--ghost" onClick={onClose}>
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>
            <button type="submit" className="btn btn--primary">
              {t(mode === 'meeting' ? 'calendar.modal.submit.meeting' : 'calendar.modal.submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
