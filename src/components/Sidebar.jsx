import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

const NAV_WORKSPACE = [
  { key: 'dashboard', icon: 'home',      labelAr: 'الرئيسية',    labelEn: 'Dashboard' },
  { key: 'courses',   icon: 'book-open', labelAr: 'المواد',      labelEn: 'Courses',  badgeKey: 'courses' },
  { key: 'calendar',  icon: 'calendar',  labelAr: 'التقويم',     labelEn: 'Calendar' },
];

const NAV_STUDY = [
  { key: 'ai',        icon: 'zap',    labelAr: 'المساعد الذكي', labelEn: 'AI Assistant' },
  { key: 'meetings',  icon: 'video',  labelAr: 'الاجتماعات',    labelEn: 'Meetings', badgeKey: 'meetings' },
  { key: 'majors',    icon: 'layers', labelAr: 'التخصصات',      labelEn: 'Majors' },
];

export default function Sidebar({ isOpen, onClose }) {
  const { state, setView, setTheme, doLogout, profile, user, courses, events } = useApp();
  const isAr = state.lang === 'ar';
  const [showLogout, setShowLogout] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 1100);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 1100);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const handleNav = (view) => {
    setView(view);
    if (isMobile) onClose?.();
  };

  const NOW = new Date();
  const badges = {
    courses: courses.length || null,
    meetings: events.filter((e) => e.type !== 'deadline' && e.start >= NOW).length || null,
  };

  const renderItem = (item) => (
    <button
      key={item.key}
      className={`nav-item${state.view === item.key ? ' is-active' : ''}`}
      onClick={() => handleNav(item.key)}
    >
      <svg className="nav-item__icon" width="18" height="18">
        <use href={`#icon-${item.icon}`} />
      </svg>
      <span className="nav-item__label">{isAr ? item.labelAr : item.labelEn}</span>
      {item.badgeKey && badges[item.badgeKey] && (
        <span className="nav-item__badge">{badges[item.badgeKey]}</span>
      )}
    </button>
  );

  return (
    <>
      {isMobile && isOpen && <div className="sidebar-backdrop" onClick={onClose} />}

      <aside className={`sidebar${isOpen && isMobile ? ' is-open' : ''}`}>
        <div className="sidebar__brand">
          <img className="sidebar__brand-logo" src="/logo.svg" alt="StudyBuddy" />
        </div>

        <nav className="sidebar__nav">
          <p className="sidebar__nav-label">{isAr ? 'مساحة العمل' : 'Workspace'}</p>
          <div className="sidebar__nav-group">
            {NAV_WORKSPACE.map(renderItem)}
          </div>

          <p className="sidebar__nav-label">{isAr ? 'أدوات الدراسة' : 'Study Tools'}</p>
          <div className="sidebar__nav-group">
            {NAV_STUDY.map(renderItem)}
          </div>

          {user?.role === 'admin' && (
            <>
              <p className="sidebar__nav-label">{isAr ? 'النظام' : 'System'}</p>
              <div className="sidebar__nav-group">
                <button
                  className={`nav-item nav-item--admin${state.view === 'admin' ? ' is-active' : ''}`}
                  onClick={() => handleNav('admin')}
                >
                  <svg className="nav-item__icon" width="18" height="18">
                    <use href="#icon-shield" />
                  </svg>
                  <span className="nav-item__label">{isAr ? 'لوحة الإدارة' : 'Admin Panel'}</span>
                </button>
              </div>
            </>
          )}
        </nav>

        <div className="sidebar__footer">
          <button className="sidebar__user-card" onClick={() => handleNav('profile')}>
            <div className="sidebar__user-avatar">{profile?.initials || 'SB'}</div>
            <div className="sidebar__user-info">
              <span className="sidebar__user-name">{isAr ? profile?.nameAr : profile?.nameEn}</span>
              <span className="sidebar__user-sub">
                {profile?.majorId?.toUpperCase()} · {isAr ? 'المستوى' : 'Lvl'} {profile?.year}
              </span>
            </div>
          </button>

          <div className="sidebar__footer-row">
            <button className="nav-item sidebar__logout-btn" onClick={() => setShowLogout(true)}>
              <svg className="nav-item__icon" width="18" height="18">
                <use href="#icon-log-out" />
              </svg>
              <span className="nav-item__label">{isAr ? 'تسجيل الخروج' : 'Sign out'}</span>
            </button>
            <button
              className="sidebar__theme-btn"
              onClick={() => setTheme(state.theme === 'dark' ? 'light' : 'dark')}
              title={state.theme === 'dark' ? (isAr ? 'وضع فاتح' : 'Light') : (isAr ? 'وضع داكن' : 'Dark')}
            >
              <svg width="16" height="16">
                <use href={`#icon-${state.theme === 'dark' ? 'sun' : 'moon'}`} />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {showLogout && (
        <div className="logout-overlay" onClick={() => setShowLogout(false)}>
          <div className="logout-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="logout-dialog__icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </div>
            <h3 className="logout-dialog__title">{isAr ? 'تسجيل الخروج' : 'Sign Out'}</h3>
            <p className="logout-dialog__message">
              {isAr ? 'هل أنت متأكد من تسجيل الخروج؟' : 'Are you sure you want to sign out?'}
            </p>
            <div className="logout-dialog__actions">
              <button className="logout-dialog__btn logout-dialog__btn--cancel" onClick={() => setShowLogout(false)}>
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                className="logout-dialog__btn logout-dialog__btn--confirm"
                onClick={() => { setShowLogout(false); doLogout(); onClose?.(); }}
              >
                {isAr ? 'تسجيل الخروج' : 'Sign Out'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
