import { useState } from 'react';
import { useApp } from '../context/AppContext';
import * as api from '../api';

/* ── Password Change Modal ── */
function PasswordModal({ isAr, onClose, onSuccess, toast }) {
  const [currentPw, setCurrentPw]   = useState('');
  const [newPw,     setNewPw]       = useState('');
  const [confirmPw, setConfirmPw]   = useState('');
  const [showCur,   setShowCur]     = useState(false);
  const [showNew,   setShowNew]     = useState(false);
  const [loading,   setLoading]     = useState(false);
  const [errors,    setErrors]      = useState({});

  const strength = (pw) => {
    if (!pw) return 0;
    let s = 0;
    if (pw.length >= 8) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^a-zA-Z0-9]/.test(pw)) s++;
    return s;
  };
  const str = strength(newPw);
  const strLabel = isAr
    ? ['', 'ضعيفة', 'متوسطة', 'قوية', 'قوية جداً'][str]
    : ['', 'Weak', 'Fair', 'Strong', 'Very strong'][str];
  const strColor = ['', '#ef4444', '#f59e0b', '#22c55e', '#16a34a'][str];

  const validate = () => {
    const e = {};
    if (!currentPw) e.cur = isAr ? 'أدخل كلمة المرور الحالية' : 'Enter current password';
    if (newPw.length < 8) e.new = isAr ? 'يجب 8 أحرف على الأقل' : 'At least 8 characters';
    if (newPw !== confirmPw) e.conf = isAr ? 'كلمتا المرور غير متطابقتين' : "Passwords don't match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await api.changePassword(currentPw, newPw);
      toast(isAr ? 'تم تغيير كلمة المرور بنجاح ✓' : 'Password changed successfully ✓', 'success');
      onSuccess();
      onClose();
    } catch (err) {
      const msg = err.message || '';
      if (msg.includes('incorrect') || msg.includes('Current'))
        setErrors({ cur: isAr ? 'كلمة المرور الحالية غير صحيحة' : 'Incorrect current password' });
      else
        toast(msg || (isAr ? 'حدث خطأ' : 'An error occurred'), 'warning');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="logout-overlay" onClick={onClose}>
      <div className="pw-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="pw-modal__head">
          <div className="pw-modal__icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <div>
            <h3 className="pw-modal__title">{isAr ? 'تغيير كلمة المرور' : 'Change Password'}</h3>
            <p className="pw-modal__sub">{isAr ? 'اختر كلمة مرور قوية لحماية حسابك' : 'Choose a strong password to protect your account'}</p>
          </div>
          <button className="pw-modal__close" onClick={onClose}>
            <svg width="16" height="16"><use href="#icon-x"/></svg>
          </button>
        </div>

        <div className="pw-modal__body">
          {/* Current password */}
          <div className="input-group">
            <label className="input-label">{isAr ? 'كلمة المرور الحالية' : 'Current Password'}</label>
            <div className={`input${errors.cur ? ' input--err' : ''}`}>
              <svg width="14" height="14"><use href="#icon-lock"/></svg>
              <input
                type={showCur ? 'text' : 'password'}
                placeholder="••••••••"
                dir="ltr"
                value={currentPw}
                onChange={e => { setCurrentPw(e.target.value); setErrors(p => ({...p, cur: undefined})); }}
              />
              <button type="button" className="icon-btn" onClick={() => setShowCur(s => !s)}>
                <svg width="14" height="14"><use href={`#icon-${showCur ? 'eye-off' : 'eye'}`}/></svg>
              </button>
            </div>
            {errors.cur && <div className="input-error">{errors.cur}</div>}
          </div>

          {/* New password */}
          <div className="input-group">
            <label className="input-label">{isAr ? 'كلمة المرور الجديدة' : 'New Password'}</label>
            <div className={`input${errors.new ? ' input--err' : ''}`}>
              <svg width="14" height="14"><use href="#icon-lock"/></svg>
              <input
                type={showNew ? 'text' : 'password'}
                placeholder="••••••••"
                dir="ltr"
                value={newPw}
                onChange={e => { setNewPw(e.target.value); setErrors(p => ({...p, new: undefined})); }}
              />
              <button type="button" className="icon-btn" onClick={() => setShowNew(s => !s)}>
                <svg width="14" height="14"><use href={`#icon-${showNew ? 'eye-off' : 'eye'}`}/></svg>
              </button>
            </div>
            {newPw && (
              <div className="pw-strength">
                <div className="pw-strength__bars">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="pw-strength__bar" style={{ background: i <= str ? strColor : 'var(--border)' }} />
                  ))}
                </div>
                <span className="pw-strength__label" style={{ color: strColor }}>{strLabel}</span>
              </div>
            )}
            {errors.new && <div className="input-error">{errors.new}</div>}
          </div>

          {/* Confirm password */}
          <div className="input-group">
            <label className="input-label">{isAr ? 'تأكيد كلمة المرور' : 'Confirm Password'}</label>
            <div className={`input${errors.conf ? ' input--err' : ''}`}>
              <svg width="14" height="14"><use href="#icon-lock"/></svg>
              <input
                type="password"
                placeholder="••••••••"
                dir="ltr"
                value={confirmPw}
                onChange={e => { setConfirmPw(e.target.value); setErrors(p => ({...p, conf: undefined})); }}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              />
            </div>
            {errors.conf && <div className="input-error">{errors.conf}</div>}
          </div>
        </div>

        {/* Actions */}
        <div className="pw-modal__actions">
          <button className="btn btn--ghost" onClick={onClose} disabled={loading}>
            {isAr ? 'إلغاء' : 'Cancel'}
          </button>
          <button className="btn btn--primary" onClick={handleSubmit} disabled={loading || !currentPw || !newPw || !confirmPw}>
            {loading
              ? (isAr ? 'جارٍ الحفظ...' : 'Saving...')
              : (isAr ? 'حفظ كلمة المرور' : 'Save Password')}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── small reusable toggle ── */
function Toggle({ on, onChange }) {
  return (
    <button
      type="button"
      className={`prof-toggle${on ? ' is-on' : ''}`}
      onClick={() => onChange(!on)}
      aria-checked={on}
      role="switch"
    />
  );
}

/* ── editable row ── */
function EditRow({ label, sub, value, onEdit, isEditing, editNode, editActions }) {
  return (
    <div className="prof-row">
      <div className="prof-row__meta">
        <span className="prof-row__label">{label}</span>
        {sub && <span className="prof-row__sub">{sub}</span>}
      </div>
      <div className="prof-row__mid">
        {isEditing ? editNode : <span className="prof-row__val">{value}</span>}
      </div>
      <div className="prof-row__action">
        {isEditing ? editActions : (
          onEdit && (
            <button className="prof-edit-btn" onClick={onEdit}>
              <svg width="13" height="13"><use href="#icon-edit-2" /></svg>
              <span>تعديل</span>
            </button>
          )
        )}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { state, t, setLang, setTheme, toast, profile: PROFILE, majors: MAJORS, courses, loadUserData } = useApp();
  const isAr = state.lang === 'ar';

  const [profile, setProfile]   = useState(PROFILE);
  const [editing, setEditing]   = useState(null); // field key
  const [temp, setTemp]         = useState('');
  const [showPwModal, setShowPwModal] = useState(false);

  const major = MAJORS.find((m) => m.id === profile.majorId) || MAJORS[0];

  /* ── generic start/save/cancel ── */
  const startEdit = (field, current) => { setEditing(field); setTemp(current ?? ''); };
  const cancelEdit = () => setEditing(null);

  const saveField = async (backendKey, value) => {
    try {
      await api.updateProfile({ [backendKey]: value });
      await loadUserData();
      setProfile(p => ({ ...p, [editing]: value }));
      setEditing(null);
      toast(isAr ? 'تم حفظ التغييرات' : 'Saved successfully', 'success');
    } catch (err) {
      toast(err.message || (isAr ? 'فشل الحفظ' : 'Save failed'), 'warning');
    }
  };

  /* ── save helpers per field ── */
  const saveMap = {
    nameEn:   () => saveField('name',       temp),
    email:    () => saveField('email',      temp),
    phone:    () => saveField('phone',      temp),
    majorId:  () => saveField('major_id',   temp),
    year:     () => saveField('year',       temp),
    gpa:      () => saveField('gpa',        temp),
  };

  /* ── save/cancel mini bar ── */
  const SaveCancel = ({ onSave }) => (
    <div style={{ display: 'flex', gap: 6 }}>
      <button className="prof-save-btn" onClick={onSave}>
        <svg width="13" height="13"><use href="#icon-check" /></svg>
        <span>{isAr ? 'حفظ' : 'Save'}</span>
      </button>
      <button className="prof-cancel-btn" onClick={cancelEdit}>
        <svg width="13" height="13"><use href="#icon-x" /></svg>
      </button>
    </div>
  );

  /* ── achievements data ── */
  const gpa = parseFloat(profile.gpa) || 0;
  const credits = courses.reduce((s, c) => s + (c.credits || 0), 0);
  const ACHIEVEMENTS = [
    {
      id: 'honor',
      icon: 'award',
      titleAr: 'طالب مُتميز',
      titleEn: 'Honor Student',
      descAr: 'معدل أعلى من 3.5',
      descEn: 'GPA above 3.5',
      earned: gpa >= 3.5,
    },
    {
      id: 'attend',
      icon: 'star',
      titleAr: 'منظّم',
      titleEn: 'Organized',
      descAr: 'حضور 100% لـ 3 أسابيع',
      descEn: '100% attendance for 3 weeks',
      earned: true,
    },
    {
      id: 'halfway',
      icon: 'graduation-cap',
      titleAr: 'نصف الطريق',
      titleEn: 'Halfway There',
      descAr: `أنجزت ${credits} ساعة معتمدة`,
      descEn: `Completed ${credits} credit hours`,
      earned: credits >= 60,
    },
    {
      id: 'enrolled',
      icon: 'book-open',
      titleAr: 'متحمّس للتعلم',
      titleEn: 'Eager Learner',
      descAr: 'مسجّل في 5 مواد أو أكثر',
      descEn: 'Enrolled in 5+ courses',
      earned: courses.length >= 5,
    },
  ];
  const earnedCount = ACHIEVEMENTS.filter(a => a.earned).length;

  return (
    <div className="prof-layout">

      {/* ══════ RIGHT SIDEBAR ══════ */}
      <aside className="prof-sidebar">

        {/* Profile card */}
        <div className="card prof-card">
          <div className="prof-avatar">{profile.initials}</div>
          <h2 className="prof-name">{isAr ? profile.nameAr : profile.nameEn}</h2>
          <p className="prof-email">{profile.email}</p>
          <div className="prof-stats">
            <div className="prof-stat">
              <span className="prof-stat__num">{courses.length}</span>
              <span className="prof-stat__lbl">{isAr ? 'المسجّلة' : 'Enrolled'}</span>
            </div>
            <div className="prof-stat__divider" />
            <div className="prof-stat">
              <span className="prof-stat__num">{profile.year}</span>
              <span className="prof-stat__lbl">{isAr ? 'المستوى' : 'Level'}</span>
            </div>
            <div className="prof-stat__divider" />
            <div className="prof-stat">
              <span className="prof-stat__num">{profile.gpa}</span>
              <span className="prof-stat__lbl">{isAr ? 'المعدل' : 'GPA'}</span>
            </div>
          </div>
        </div>

        {/* Achievements card */}
        <div className="card prof-achievements">
          <div className="prof-achievements__header">
            <h3 className="card__title">{isAr ? 'الإنجازات' : 'Achievements'}</h3>
            <span className="prof-badge">{earnedCount} {isAr ? 'من' : 'of'} {ACHIEVEMENTS.length}</span>
          </div>
          <div className="prof-achievements__list">
            {ACHIEVEMENTS.map(a => (
              <div key={a.id} className={`prof-achievement${a.earned ? ' is-earned' : ''}`}>
                <div className="prof-achievement__icon">
                  <svg width="18" height="18"><use href={`#icon-${a.icon}`} /></svg>
                </div>
                <div className="prof-achievement__info">
                  <span className="prof-achievement__title">{isAr ? a.titleAr : a.titleEn}</span>
                  <span className="prof-achievement__desc">{isAr ? a.descAr : a.descEn}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </aside>

      {/* ══════ MAIN CONTENT ══════ */}
      <main className="prof-main">

        {/* Page header */}
        <div className="prof-main__header">
          <div>
            <h1 className="prof-main__title">{isAr ? 'الملف الشخصي' : 'My Profile'}</h1>
            <p className="prof-main__sub">{isAr ? 'إدارة بياناتك والإعدادات.' : 'Manage your info and settings.'}</p>
          </div>
        </div>

        {/* ── Academic Info ── */}
        <div className="card prof-section">
          <div className="prof-section__head">
            <div>
              <h3 className="card__title">{isAr ? 'المعلومات الأكاديمية' : 'Academic Information'}</h3>
              <p className="prof-section__desc">{isAr ? 'تستخدم لاحتساب الإحصاءات وعرض المواد' : 'Used to calculate stats and display courses'}</p>
            </div>
          </div>

          <EditRow
            label={isAr ? 'التخصص' : 'Major'}
            value={isAr ? major?.nameAr : major?.nameEn}
            isEditing={editing === 'majorId'}
            onEdit={() => startEdit('majorId', profile.majorId)}
            editNode={
              <select className="prof-select" value={temp} onChange={e => setTemp(e.target.value)}>
                {MAJORS.map(m => (
                  <option key={m.id} value={m.id}>{isAr ? m.nameAr : m.nameEn}</option>
                ))}
              </select>
            }
            editActions={<SaveCancel onSave={saveMap.majorId} />}
          />

          <EditRow
            label={isAr ? 'المستوى' : 'Academic Year'}
            value={profile.year}
            isEditing={editing === 'year'}
            onEdit={() => startEdit('year', profile.year)}
            editNode={
              <select className="prof-select" value={temp} onChange={e => setTemp(e.target.value)}>
                {[1,2,3,4,5].map(y => (
                  <option key={y} value={String(y)}>
                    {isAr ? `السنة ${['الأولى','الثانية','الثالثة','الرابعة','الخامسة'][y-1]}` : `Year ${y}`}
                  </option>
                ))}
              </select>
            }
            editActions={<SaveCancel onSave={saveMap.year} />}
          />

          <EditRow
            label={isAr ? 'المعدل التراكمي' : 'Cumulative GPA'}
            value={`${profile.gpa} / 4.00`}
            isEditing={editing === 'gpa'}
            onEdit={() => startEdit('gpa', profile.gpa)}
            editNode={
              <input
                className="prof-input"
                type="number"
                min="0" max="4" step="0.01"
                value={temp}
                onChange={e => setTemp(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') saveMap.gpa(); if (e.key === 'Escape') cancelEdit(); }}
                autoFocus
              />
            }
            editActions={<SaveCancel onSave={saveMap.gpa} />}
          />
        </div>

        {/* ── Contact Info ── */}
        <div className="card prof-section">
          <div className="prof-section__head">
            <h3 className="card__title">{isAr ? 'معلومات الاتصال' : 'Contact Information'}</h3>
          </div>

          <EditRow
            label={isAr ? 'البريد الإلكتروني' : 'Email Address'}
            value={profile.email}
            isEditing={editing === 'email'}
            onEdit={() => startEdit('email', profile.email)}
            editNode={
              <input
                className="prof-input"
                type="email" dir="ltr"
                value={temp}
                onChange={e => setTemp(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') saveMap.email(); if (e.key === 'Escape') cancelEdit(); }}
                autoFocus
              />
            }
            editActions={<SaveCancel onSave={saveMap.email} />}
          />

          <EditRow
            label={isAr ? 'رقم الجوال' : 'Phone Number'}
            value={profile.phone || (isAr ? 'غير محدد' : 'Not set')}
            isEditing={editing === 'phone'}
            onEdit={() => startEdit('phone', profile.phone || '')}
            editNode={
              <input
                className="prof-input"
                type="tel" dir="ltr"
                placeholder="+966 5XX XXX XXXX"
                value={temp}
                onChange={e => setTemp(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') saveMap.phone(); if (e.key === 'Escape') cancelEdit(); }}
                autoFocus
              />
            }
            editActions={<SaveCancel onSave={saveMap.phone} />}
          />
        </div>

        {/* ── Preferences ── */}
        <div className="card prof-section">
          <div className="prof-section__head">
            <div>
              <h3 className="card__title">{isAr ? 'التفضيلات' : 'Preferences'}</h3>
              <p className="prof-section__desc">{isAr ? 'اللغة، الإشعارات، والمظهر' : 'Language, notifications, and theme'}</p>
            </div>
          </div>

          {/* Language */}
          <div className="prof-row">
            <span className="prof-row__label">{isAr ? 'اللغة' : 'Language'}</span>
            <div className="prof-row__mid" />
            <div className="prof-row__action">
              <div className="lang-switch" style={{ display: 'inline-flex' }}>
                <button className={state.lang === 'en' ? 'is-active' : ''} onClick={() => setLang('en')}>English</button>
                <button className={state.lang === 'ar' ? 'is-active' : ''} onClick={() => setLang('ar')}>العربية</button>
              </div>
            </div>
          </div>

          {/* Email notifs */}
          <div className="prof-row">
            <div className="prof-row__meta">
              <span className="prof-row__label">{isAr ? 'إشعارات البريد' : 'Email Notifications'}</span>
              <span className="prof-row__sub">{isAr ? 'تنبيهات المواعيد والاختبارات عبر البريد' : 'Deadline and exam alerts via email'}</span>
            </div>
            <div className="prof-row__mid" />
            <div className="prof-row__action">
              <Toggle on={!!profile.notifs} onChange={async (val) => {
                try {
                  await api.updateProfile({ notifs: val ? 1 : 0 });
                  await loadUserData();
                  setProfile(p => ({ ...p, notifs: val }));
                  toast(isAr ? 'تم تحديث الإشعارات' : 'Notifications updated', 'success');
                } catch { toast(isAr ? 'فشل التحديث' : 'Update failed', 'warning'); }
              }} />
            </div>
          </div>

          {/* Browser notifs */}
          <div className="prof-row">
            <div className="prof-row__meta">
              <span className="prof-row__label">{isAr ? 'إشعارات المتصفح' : 'Browser Notifications'}</span>
              <span className="prof-row__sub">{isAr ? 'تنبيهات داخل المنصة' : 'In-platform alerts'}</span>
            </div>
            <div className="prof-row__mid" />
            <div className="prof-row__action">
              <Toggle on={true} onChange={() => {}} />
            </div>
          </div>

          {/* Theme */}
          <div className="prof-row">
            <div className="prof-row__meta">
              <span className="prof-row__label">{isAr ? 'المظهر' : 'Theme'}</span>
              <span className="prof-row__sub">{isAr ? 'تبديل بين الفاتح والداكن' : 'Toggle light / dark mode'}</span>
            </div>
            <div className="prof-row__mid" />
            <div className="prof-row__action">
              <Toggle on={state.theme === 'dark'} onChange={(val) => setTheme(val ? 'dark' : 'light')} />
            </div>
          </div>
        </div>

        {/* ── Security ── */}
        <div className="card prof-section">
          <div className="prof-section__head">
            <h3 className="card__title">{isAr ? 'الأمان' : 'Security'}</h3>
          </div>

          <div className="prof-row">
            <div className="prof-row__meta">
              <span className="prof-row__label">{isAr ? 'كلمة المرور' : 'Password'}</span>
              <span className="prof-row__sub">{isAr ? 'يمكنك تحديث كلمة المرور من هنا' : 'You can update your password here'}</span>
            </div>
            <div className="prof-row__mid">
              <span className="prof-row__val" style={{ letterSpacing: 3 }}>••••••••</span>
            </div>
            <div className="prof-row__action">
              <button className="prof-edit-btn" onClick={() => setShowPwModal(true)}>
                {isAr ? 'تغيير' : 'Change'}
              </button>
            </div>
          </div>
        </div>

      </main>

      {showPwModal && (
        <PasswordModal
          isAr={isAr}
          toast={toast}
          onClose={() => setShowPwModal(false)}
          onSuccess={() => {}}
        />
      )}
    </div>
  );
}
