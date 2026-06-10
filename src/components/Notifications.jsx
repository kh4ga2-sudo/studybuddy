import { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';

export default function Notifications() {
  const { state, t, setView, notifications: initialNotifs } = useApp();
  const [notifs, setNotifs] = useState(initialNotifs);
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);
  const btnRef = useRef(null);

  const unreadCount = notifs.filter(n => n.unread).length;

  useEffect(() => {
    const handleClick = (e) => {
      if (open && !panelRef.current?.contains(e.target) && !btnRef.current?.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const markAllRead = () => setNotifs(notifs.map(n => ({ ...n, unread: false })));
  const clearAll = () => setNotifs([]);

  const handleRowClick = (notif) => {
    setNotifs(notifs.map(n => n.id === notif.id ? { ...n, unread: false } : n));
    setOpen(false);
    if (notif.view) setView(notif.view);
  };

  const iconMap = {
    deadline: 'alert-circle',
    grade: 'award',
    material: 'file-text',
    meeting: 'video',
    ai: 'zap',
  };

  const isAr = state.lang === 'ar';

  return (
    <div style={{ position: 'relative' }}>
      <button
        ref={btnRef}
        className="icon-btn topbar__notif-btn"
        onClick={() => setOpen(!open)}
        aria-label={t('topbar.notifications')}
        style={{ position: 'relative' }}
      >
        <svg width="18" height="18"><use href="#icon-bell" /></svg>
        {unreadCount > 0 && (
          <span className="notif-badge">{unreadCount}</span>
        )}
      </button>

      <div
        ref={panelRef}
        className="notif-panel"
        hidden={!open}
        style={{
          position: 'fixed',
          top: 64,
          ...(isAr ? { left: 16 } : { right: 16 }),
        }}
      >
        <div className="notif-panel__head">
          <div>
            <div className="notif-panel__title">{t('notif.title')}</div>
            {unreadCount > 0 && (
              <div className="notif-panel__sub">{unreadCount} {isAr ? 'غير مقروء' : 'unread'}</div>
            )}
          </div>
          <div className="notif-panel__actions">
            {unreadCount > 0 && (
              <button onClick={markAllRead}>{t('notif.markall')}</button>
            )}
            {notifs.length > 0 && (
              <button onClick={clearAll}>{t('notif.clearall')}</button>
            )}
          </div>
        </div>

        <div className="notif-panel__list">
          {notifs.length === 0 ? (
            <div className="notif-empty">{t('notif.empty')}</div>
          ) : (
            notifs.map(notif => (
              <button
                key={notif.id}
                className={`notif-row${notif.unread ? ' is-unread' : ''}`}
                onClick={() => handleRowClick(notif)}
              >
                <div className={`notif-row__icon notif-row__icon--${notif.kind}`}>
                  <svg width="14" height="14"><use href={`#icon-${iconMap[notif.kind] || 'bell'}`} /></svg>
                </div>
                <div className="notif-row__body">
                  <div className="notif-row__title">{isAr ? notif.titleAr : notif.titleEn}</div>
                  <div className="notif-row__text">{isAr ? notif.textAr : notif.textEn}</div>
                  <div className="notif-row__time">{isAr ? notif.timeAr : notif.time}</div>
                </div>
                {notif.unread && <div className="notif-row__dot" />}
              </button>
            ))
          )}
        </div>

        <div className="notif-panel__foot">
          <button onClick={() => setOpen(false)}>{t('notif.view')}</button>
        </div>
      </div>
    </div>
  );
}
