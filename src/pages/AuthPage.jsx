import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { signInWithGoogle } from '../firebase';
import * as api from '../api';
import {
  buildAcademicRows,
  filterMajorRows,
  getCollegeOptions,
  getDepartmentOptions,
  hasAcademicHierarchy,
} from '../utils/academicHierarchy';

const UNIS = [
  { id: 'kau', nameEn: 'King Abdullah University', nameAr: 'جامعة الملك عبدالله', subEn: 'KAUST · Jeddah', subAr: 'كاوست · جدة' },
  { id: 'ksu', nameEn: 'King Saud University', nameAr: 'جامعة الملك سعود', subEn: 'KSU · Riyadh', subAr: 'KSU · الرياض' },
  { id: 'uqu', nameEn: 'Umm Al-Qura University', nameAr: 'جامعة أم القرى', subEn: 'UQU · Mecca', subAr: 'أم القرى · مكة' },
];

function pwStrength(pw) {
  if (!pw) return -1;
  if (pw.length < 8) return 0;
  let s = 0;
  if (/[a-z]/.test(pw)) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^a-zA-Z0-9]/.test(pw)) s++;
  return Math.min(s, 4);
}

export default function AuthPage() {
  const { state, t, setView, setLang, toast, doLogin, doSignup, doGoogleLogin, majors: MAJORS } = useApp();
  const isAr = state.lang === 'ar';

  const [mode, setMode] = useState('login');
  const [legalOpen, setLegalOpen] = useState(null);

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPw, setLoginPw] = useState('');
  const [showLoginPw, setShowLoginPw] = useState(false);
  const [remember, setRemember] = useState(true);

  // Signup state
  const [step, setStep] = useState(1);
  const [suName, setSuName] = useState('');
  const [suEmail, setSuEmail] = useState('');
  const [suPw, setSuPw] = useState('');
  const [suPw2, setSuPw2] = useState('');
  const [showSuPw, setShowSuPw] = useState(false);
  const [terms, setTerms] = useState(false);
  const [suUni, setSuUni] = useState('');
  const [suMajor, setSuMajor] = useState('');
  const [suCollege, setSuCollege] = useState('');
  const [suDepartment, setSuDepartment] = useState('');
  const [suYear, setSuYear] = useState('');
  const [suGpa, setSuGpa] = useState('');
  const [suGpaScale, setSuGpaScale] = useState('4');
  const [errors, setErrors] = useState({});

  // Password reset state. This is connected to real backend endpoints and SMTP email sending.
  const [resetOpen, setResetOpen] = useState(false);
  const [resetStep, setResetStep] = useState(1);
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [resetPw, setResetPw] = useState('');
  const [resetPw2, setResetPw2] = useState('');
  const [resetBusy, setResetBusy] = useState(false);

  const strength = useMemo(() => pwStrength(suPw), [suPw]);
  const availableMajors = useMemo(() => (Array.isArray(MAJORS) ? MAJORS : []), [MAJORS]);
  const academicMajorRows = useMemo(() => buildAcademicRows(availableMajors, []), [availableMajors]);
  const signupHasHierarchy = suUni === 'uqu' && hasAcademicHierarchy(academicMajorRows);
  const signupCollegeOptions = useMemo(() => getCollegeOptions(academicMajorRows), [academicMajorRows]);
  const signupDepartmentOptions = useMemo(
    () => (suCollege ? getDepartmentOptions(academicMajorRows, suCollege) : []),
    [academicMajorRows, suCollege]
  );
  const filteredSignupMajors = useMemo(() => {
    if (!signupHasHierarchy) return academicMajorRows;
    if (!suCollege) return [];
    return filterMajorRows(academicMajorRows, { college: suCollege, department: suDepartment, isAr });
  }, [academicMajorRows, signupHasHierarchy, suCollege, suDepartment, isAr]);

  const L = (ar, en) => (isAr ? ar : en);

  const changeSignupUniversity = (id) => {
    if (suUni === id) return;
    setSuUni(id);
    setSuCollege('');
    setSuDepartment('');
    setSuMajor('');
    if (errors.major) setErrors({ ...errors, major: undefined });
  };

  const changeSignupCollege = (value) => {
    setSuCollege(value);
    setSuDepartment('');
    setSuMajor('');
    if (errors.major) setErrors({ ...errors, major: undefined });
  };

  const changeSignupDepartment = (value) => {
    setSuDepartment(value);
    setSuMajor('');
    if (errors.major) setErrors({ ...errors, major: undefined });
  };

  const resetSignup = () => {
    setStep(1);
    setSuName(''); setSuEmail(''); setSuPw(''); setSuPw2('');
    setShowSuPw(false); setTerms(false);
    setSuUni(''); setSuCollege(''); setSuDepartment(''); setSuMajor(''); setSuYear(''); setSuGpa(''); setSuGpaScale('4');
    setErrors({});
  };

  const handleSignIn = async (e) => {
    e?.preventDefault();
    try {
      await doLogin(loginEmail, loginPw);
      toast(isAr ? 'مرحباً بعودتك!' : 'Welcome back!', 'success');
    } catch (err) {
      toast(err.message || (isAr ? 'خطأ في تسجيل الدخول' : 'Login failed'), 'warning');
    }
  };

  const openResetModal = () => {
    setResetEmail(loginEmail || '');
    setResetCode('');
    setResetPw('');
    setResetPw2('');
    setResetStep(1);
    setResetOpen(true);
  };

  const closeResetModal = () => {
    if (resetBusy) return;
    setResetOpen(false);
  };

  const requestResetCode = async (e) => {
    e?.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resetEmail.trim())) {
      toast(isAr ? 'اكتب بريد إلكتروني صحيح' : 'Enter a valid email address', 'warning');
      return;
    }
    setResetBusy(true);
    try {
      await api.forgotPassword(resetEmail.trim());
      setResetStep(2);
      toast(isAr ? 'تم إرسال رمز التحقق إلى بريدك' : 'Verification code sent to your email', 'success');
    } catch (err) {
      toast(err.message || (isAr ? 'تعذر إرسال رمز التحقق' : 'Could not send verification code'), 'warning');
    } finally {
      setResetBusy(false);
    }
  };

  const verifyResetCode = async (e) => {
    e?.preventDefault();
    if (!/^\d{6}$/.test(resetCode.trim())) {
      toast(isAr ? 'رمز التحقق يجب أن يكون 6 أرقام' : 'The code must be 6 digits', 'warning');
      return;
    }
    setResetBusy(true);
    try {
      await api.verifyResetCode(resetEmail.trim(), resetCode.trim());
      setResetStep(3);
      toast(isAr ? 'تم التحقق من الرمز' : 'Code verified', 'success');
    } catch (err) {
      toast(err.message || (isAr ? 'رمز غير صحيح أو منتهي' : 'Invalid or expired code'), 'warning');
    } finally {
      setResetBusy(false);
    }
  };

  const submitNewPassword = async (e) => {
    e?.preventDefault();
    if (resetPw.length < 8) {
      toast(isAr ? 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' : 'Password must be at least 8 characters', 'warning');
      return;
    }
    if (resetPw !== resetPw2) {
      toast(isAr ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match', 'warning');
      return;
    }
    setResetBusy(true);
    try {
      await api.resetPassword(resetEmail.trim(), resetCode.trim(), resetPw);
      setLoginEmail(resetEmail.trim());
      setLoginPw('');
      setResetOpen(false);
      toast(isAr ? 'تم تغيير كلمة المرور. سجّل دخولك الآن.' : 'Password changed. You can sign in now.', 'success');
    } catch (err) {
      toast(err.message || (isAr ? 'تعذر تغيير كلمة المرور' : 'Could not reset password'), 'warning');
    } finally {
      setResetBusy(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const { user } = await signInWithGoogle();
      
      // Connect to backend to register or login this Google user and get a JWT token
      const res = await doGoogleLogin(user.displayName, user.email);

      if (res.isNewUser) {
        // Pre-fill what we know from Google, then ask for academic info
        setSuName(user.displayName || '');
        setSuEmail(user.email || '');
        setMode('signup');
        setStep(2); // skip account step — go straight to university/major
        toast(
          isAr ? `مرحباً ${user.displayName?.split(' ')[0] || ''}! أكمل بياناتك الأكاديمية` : `Welcome ${user.displayName?.split(' ')[0] || ''}! Complete your academic profile`,
          'info'
        );
      } else {
        // Existing user — go straight to dashboard
        toast(isAr ? `مرحباً بعودتك ${user.displayName?.split(' ')[0] || ''}!` : `Welcome back, ${user.displayName?.split(' ')[0] || ''}!`, 'success');
        setView('dashboard');
      }
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        toast(err.message || (isAr ? 'فشل تسجيل الدخول بـ Google' : 'Google sign-in failed'), 'warning');
      }
    }
  };

  const validateStep1 = () => {
    const e = {};
    if (suName.trim().length < 2) e.name = L('الاسم قصير جداً', 'Name is too short');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(suEmail.trim())) e.email = L('بريد إلكتروني غير صحيح', 'Invalid email');
    if (suPw.length < 8) e.pw = L('يجب 8 أحرف على الأقل', 'At least 8 characters');
    else if (strength === 0) e.pw = L('كلمة المرور ضعيفة جداً', 'Password is too weak');
    if (suPw2 !== suPw) e.pw2 = L('كلمتا المرور غير متطابقتين', "Passwords don't match");
    if (!terms) {
      toast(L('يجب الموافقة على الشروط', 'You must accept the terms'), 'warning');
      setErrors(e);
      return false;
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e = {};
    if (!suUni) {
      toast(L('اختر جامعتك أولاً', 'Please choose your university first'), 'warning');
      return false;
    }
    if (!suMajor) e.major = L('اختر تخصصاً', 'Please choose a major');
    if (!suYear) e.year = L('اختر مستواك الدراسي', 'Please choose your level');
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const goTo = (n) => {
    if (n > step) {
      if (step === 1 && !validateStep1()) return;
      if (step === 2 && !validateStep2()) return;
    }
    setStep(n);
  };

  const createAccount = async () => {
    try {
      if (!suPw) {
        // Google sign-in flow: user already exists in DB, just update academic info
        await api.updateProfile({
          university: suUni,
          major_id: suMajor,
          year: suYear,
          gpa: suGpa || '0.00',
        });
      } else {
        // Normal email signup flow
        await doSignup({
          name: suName, email: suEmail, password: suPw,
          major_id: suMajor, university: suUni, year: suYear, gpa: suGpa,
        });
      }
      setStep(4);
    } catch (err) {
      toast(err.message || (isAr ? 'خطأ في إنشاء الحساب' : 'Signup failed'), 'warning');
    }
  };

  const goToDashboard = () => {
    setView('dashboard');
    const firstName = suName.split(/\s+/)[0] || L('صديقي', 'friend');
    toast(L(`مرحباً بك يا ${firstName}!`, `Welcome, ${firstName}!`), 'success');
    setMode('login');
    resetSignup();
  };

  const strengthLabels = isAr
    ? ['ضعيفة جداً', 'ضعيفة', 'متوسطة', 'قوية', 'قوية جداً']
    : ['Too weak', 'Weak', 'Fair', 'Strong', 'Very strong'];
  const strengthPcts = [10, 25, 50, 75, 100];

  const reviewRows = () => {
    const uni = UNIS.find(u => u.id === suUni);
    const m = availableMajors.find(x => x.id === suMajor);
    const rows = [
      { lbl: L('الاسم', 'Name'), val: suName },
      { lbl: L('البريد الإلكتروني', 'Email'), val: suEmail, mono: true },
      { lbl: L('الجامعة', 'University'), val: uni ? (isAr ? uni.nameAr : uni.nameEn) : '—' },
      { lbl: L('التخصص', 'Major'), val: m ? (isAr ? m.nameAr : m.nameEn) : '—' },
      { lbl: L('السنة الدراسية', 'Academic Year'), val: suYear, mono: true },
    ];
    if (suGpa) rows.push({ lbl: L('المعدل', 'GPA'), val: suGpa, mono: true });
    return rows;
  };

  return (
    <section id="page-auth" className="page auth-page" style={{ padding: 0 }} dir={isAr ? 'rtl' : 'ltr'}>

      {/* Full-screen flex container — everything centered */}
      <div className="auth-centered">

        {/* Top navigation bar */}
        <div className="auth-centered__topbar">
          <button
            type="button"
            onClick={() => setView('landing')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 500 }}
          >
            <svg width="12" height="12" style={{ transform: isAr ? 'rotate(180deg)' : 'none' }}><use href="#icon-chevron-left" /></svg>
            <span>{isAr ? 'الرئيسية' : 'Back to Home'}</span>
          </button>
          <div className="lang-switch" role="group" aria-label="Language">
            <button className={state.lang === 'ar' ? 'is-active' : ''} onClick={() => setLang('ar')}>العربية</button>
            <button className={state.lang === 'en' ? 'is-active' : ''} onClick={() => setLang('en')}>English</button>
          </div>
        </div>

        {/* Centered card */}
        <div className="auth-centered__card">

          {/* Logo — always shown */}
          <div className="auth-centered__logo" onClick={() => setView('landing')} style={{ cursor: 'pointer' }}>
            <svg width="100%" viewBox="0 0 900 220" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ maxWidth: 480, direction: 'ltr' }}>
              <defs>
                <linearGradient id="sbGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#A855F7"/>
                  <stop offset="100%" stopColor="#6D28D9"/>
                </linearGradient>
                <pattern id="stripePattern" width="10" height="10" patternUnits="userSpaceOnUse">
                  <rect width="10" height="10" fill="transparent"/>
                  <rect y="4" width="10" height="2" fill="#C084FC"/>
                </pattern>
                <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.18"/>
                </filter>
              </defs>
              {/* Monogram */}
              <g transform="translate(20,20)" filter="url(#shadow)">
                <text x="0" y="90" fontFamily="Georgia, Times New Roman, serif" fontSize="110" fontWeight="700"
                  fill="url(#stripePattern)" stroke="url(#sbGradient)" strokeWidth="3">SB</text>
              </g>
              {/* Divider */}
              <line x1="210" y1="82" x2="240" y2="82" stroke="#8B5CF6" strokeWidth="2"/>
              {/* Book Icon */}
              <g transform="translate(250,58)">
                <rect x="0" y="0" width="42" height="8" rx="4" fill="url(#sbGradient)"/>
                <rect x="3" y="12" width="42" height="8" rx="4" fill="url(#sbGradient)"/>
                <rect x="0" y="24" width="42" height="8" rx="4" fill="url(#sbGradient)"/>
              </g>
              <line x1="305" y1="82" x2="335" y2="82" stroke="#8B5CF6" strokeWidth="2"/>
              {/* Brand Name */}
              <text x="355" y="92" fontFamily="Georgia, Times New Roman, serif" fontSize="46"
                letterSpacing="4" fill="#6D28D9">STUDY BUDDY</text>
            </svg>
            <div className="sidebar__brand-sub" style={{ marginTop: '-4px' }}>{isAr ? 'المنصة الأكاديمية' : 'Academic Platform'}</div>
          </div>

          {/* Login/signup forms only. The marketing feature banner was removed so the auth page stays clean and matches the internal app theme. */}

          {/* ── LOGIN ── */}
          {mode === 'login' && (
            <div className="auth-centered__form-wrap">
              <h1 className="auth-centered__title">{t('auth.login.title')}</h1>
              <p className="auth-centered__sub">{t('auth.login.sub')}</p>

              {/* Google Sign In */}
              <button
                type="button"
                className="btn-google"
                onClick={handleGoogleSignIn}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span>{isAr ? 'المتابعة بـ Google' : 'Continue with Google'}</span>
              </button>

              <div className="auth__divider" style={{ margin: 'var(--s-5) 0' }}>
                <span>{isAr ? 'أو بالبريد الإلكتروني' : 'or with email'}</span>
              </div>

              <form onSubmit={handleSignIn} style={{ width: '100%' }}>

                <div className="input-group">
                  <label className="input-label" htmlFor="auth-email">{t('auth.login.email')}</label>
                  <div className="input">
                    <svg width="14" height="14"><use href="#icon-user" /></svg>
                    <input id="auth-email" type="email" placeholder="ahlan@studybuddy.com" dir="ltr"
                      value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} />
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label" htmlFor="auth-pw">{t('auth.login.password')}</label>
                  <div className="input">
                    <svg width="14" height="14"><use href="#icon-lock" /></svg>
                    <input id="auth-pw" type={showLoginPw ? 'text' : 'password'} placeholder="••••••••••" dir="ltr"
                      value={loginPw} onChange={(e) => setLoginPw(e.target.value)} />
                    <button className="icon-btn" type="button" aria-label="Show password" onClick={() => setShowLoginPw(s => !s)}>
                      <svg width="14" height="14"><use href={`#icon-${showLoginPw ? 'eye-off' : 'eye'}`} /></svg>
                    </button>
                  </div>
                </div>

                <div className="auth__row">
                  <label className="auth__remember">
                    <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                    <span>{t('auth.login.remember')}</span>
                  </label>
                  <button type="button" className="link-button" onClick={openResetModal}>
                    {isAr ? 'نسيت كلمة المرور؟' : 'Forgot password?'}
                  </button>
                </div>

                <button type="submit" className="btn btn--primary btn--block">{t('auth.login.btn')}</button>
              </form>

              <p className="auth__switch" style={{ marginTop: 'var(--s-6)' }}>
                <span>{t('auth.login.switch')} </span>
                <button type="button" className="link-button" onClick={() => { setMode('signup'); resetSignup(); }}>
                  {t('auth.login.switchlink')}
                </button>
              </p>
            </div>
          )}

          {/* ── SIGNUP ── */}
          {mode === 'signup' && (
            <div className="signup auth-centered__form-wrap">
              <button
                type="button"
                onClick={() => { setMode('login'); resetSignup(); }}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 500, marginBottom: 'var(--s-5)', padding: 0 }}
              >
                <svg width="12" height="12"><use href="#icon-chevron-left" /></svg>
                <span>{isAr ? 'العودة لتسجيل الدخول' : 'Back to sign in'}</span>
              </button>

              {step !== 4 && (
                <div className="signup-progress" aria-label="Signup progress">
                  <div className={`signup-progress__step${step === 1 ? ' is-active' : ''}${step > 1 ? ' is-done' : ''}`}>
                    <span className="signup-progress__num">1</span>
                    <span className="signup-progress__label">{isAr ? 'الحساب' : 'Account'}</span>
                  </div>
                  <div className={`signup-progress__bar${step > 1 ? ' is-done' : ''}`}><span></span></div>
                  <div className={`signup-progress__step${step === 2 ? ' is-active' : ''}${step > 2 ? ' is-done' : ''}`}>
                    <span className="signup-progress__num">2</span>
                    <span className="signup-progress__label">{isAr ? 'الأكاديمي' : 'Academic'}</span>
                  </div>
                  <div className={`signup-progress__bar${step > 2 ? ' is-done' : ''}`}><span></span></div>
                  <div className={`signup-progress__step${step === 3 ? ' is-active' : ''}${step > 3 ? ' is-done' : ''}`}>
                    <span className="signup-progress__num">3</span>
                    <span className="signup-progress__label">{isAr ? 'المراجعة' : 'Review'}</span>
                  </div>
                </div>
              )}

              {/* Step 1 */}
              {step === 1 && (
                <div className="signup-step is-active">
                  <h1 className="auth-centered__title">{t('auth.signup.title')}</h1>
                  <p className="auth-centered__sub">{t('auth.signup.sub')}</p>

                  <div className="input-group">
                    <label className="input-label" htmlFor="su-name">{isAr ? 'الاسم الكامل' : 'Full Name'}</label>
                    <div className={`input${errors.name ? ' input--err' : ''}`}>
                      <svg width="14" height="14"><use href="#icon-user" /></svg>
                      <input id="su-name" type="text" placeholder={isAr ? 'مثال: يوسف حكيم' : 'e.g. Youssef Hakim'} value={suName}
                        onChange={(e) => { setSuName(e.target.value); if (errors.name) setErrors({ ...errors, name: undefined }); }} />
                    </div>
                    {errors.name && <div className="input-error">{errors.name}</div>}
                  </div>

                  <div className="input-group">
                    <label className="input-label" htmlFor="su-email">{isAr ? 'البريد الإلكتروني' : 'Email'}</label>
                    <div className={`input${errors.email ? ' input--err' : ''}`}>
                      <svg width="14" height="14"><use href="#icon-user" /></svg>
                      <input id="su-email" type="email" placeholder="ahlan@studybuddy.com" dir="ltr" value={suEmail}
                        onChange={(e) => { setSuEmail(e.target.value); if (errors.email) setErrors({ ...errors, email: undefined }); }} />
                    </div>
                    {errors.email && <div className="input-error">{errors.email}</div>}
                  </div>

                  <div className="input-group">
                    <label className="input-label" htmlFor="su-pw">{isAr ? 'كلمة المرور' : 'Password'}</label>
                    <div className={`input${errors.pw ? ' input--err' : ''}`}>
                      <svg width="14" height="14"><use href="#icon-lock" /></svg>
                      <input id="su-pw" type={showSuPw ? 'text' : 'password'} placeholder="••••••••••" dir="ltr" value={suPw}
                        onChange={(e) => { setSuPw(e.target.value); if (errors.pw) setErrors({ ...errors, pw: undefined }); }} />
                      <button className="icon-btn" type="button" onClick={() => setShowSuPw(s => !s)}>
                        <svg width="14" height="14"><use href={`#icon-${showSuPw ? 'eye-off' : 'eye'}`} /></svg>
                      </button>
                    </div>
                    {suPw && (
                      <div className={`pw-meter pw-meter--${strength < 0 ? 0 : strength}`} style={{ opacity: 1 }}>
                        <div className="pw-meter__bar"><span style={{ width: `${strengthPcts[strength < 0 ? 0 : strength]}%` }}></span></div>
                        <div className="pw-meter__label">{strengthLabels[strength < 0 ? 0 : strength]}</div>
                      </div>
                    )}
                    {errors.pw && <div className="input-error">{errors.pw}</div>}
                  </div>

                  <div className="input-group">
                    <label className="input-label" htmlFor="su-pw2">{isAr ? 'تأكيد كلمة المرور' : 'Confirm Password'}</label>
                    <div className={`input${errors.pw2 ? ' input--err' : ''}`}>
                      <svg width="14" height="14"><use href="#icon-lock" /></svg>
                      <input id="su-pw2" type="password" placeholder="••••••••••" dir="ltr" value={suPw2}
                        onChange={(e) => { setSuPw2(e.target.value); if (errors.pw2) setErrors({ ...errors, pw2: undefined }); }} />
                    </div>
                    {errors.pw2 && <div className="input-error">{errors.pw2}</div>}
                  </div>

                  <label className="auth__remember signup__terms">
                    <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} />
                    <span>
                      <span>{isAr ? 'أوافق على ' : 'I agree to the '}</span>
                      <button type="button" className="link-button" onClick={() => setLegalOpen('terms')}>{isAr ? 'الشروط والأحكام' : 'Terms & Conditions'}</button>
                      <span>{isAr ? ' و' : ' and '}</span>
                      <button type="button" className="link-button" onClick={() => setLegalOpen('privacy')}>{isAr ? 'سياسة الخصوصية' : 'Privacy Policy'}</button>
                    </span>
                  </label>

                  <button type="button" className="btn btn--primary btn--block" style={{ marginTop: 'var(--s-5)' }} onClick={() => goTo(2)}>
                    {isAr ? 'التالي' : 'Next'}
                  </button>

                  <p className="auth__switch" style={{ marginTop: 'var(--s-5)' }}>
                    <span>{t('auth.signup.switch')} </span>
                    <button type="button" className="link-button" onClick={() => { setMode('login'); resetSignup(); }}>{t('auth.signup.switchlink')}</button>
                  </p>
                </div>
              )}

              {/* Step 2 */}
              {step === 2 && (
                <div className="signup-step is-active">
                  <h1 className="auth-centered__title">{isAr ? 'المعلومات الأكاديمية' : 'Academic Info'}</h1>
                  <p className="auth-centered__sub">{isAr ? 'اختر جامعتك ثم تخصصك ومستواك الدراسي.' : 'Pick your university, then major and academic year.'}</p>

                  <div className="input-group">
                    <label className="input-label">{isAr ? 'الجامعة' : 'University'}</label>
                    <div className="signup-unis" role="radiogroup">
                      {UNIS.map(u => (
                        <button key={u.id} type="button" className={`signup-uni${suUni === u.id ? ' is-active' : ''}`}
                          role="radio" aria-checked={suUni === u.id} onClick={() => changeSignupUniversity(u.id)}>
                          <span className="signup-uni__icon"><svg width="16" height="16"><use href="#icon-graduation-cap" /></svg></span>
                          <span className="signup-uni__text">
                            <span className="signup-uni__name">{isAr ? u.nameAr : u.nameEn}</span>
                            <span className="signup-uni__sub">{isAr ? u.subAr : u.subEn}</span>
                          </span>
                          <span className="signup-uni__check"><svg width="11" height="11"><use href="#icon-check" /></svg></span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {suUni && (
                    <div className="signup-conditional">
                      <div className="input-group">
                        <label className="input-label">{isAr ? 'التخصص' : 'Major'}</label>

                        {signupHasHierarchy && (
                          <div className="hierarchy-filters signup-hierarchy-filters">
                            <label className="hierarchy-filter-field">
                              <span>{isAr ? 'الكلية' : 'College'}</span>
                              <select className="select" value={suCollege} onChange={(e) => changeSignupCollege(e.target.value)}>
                                <option value="">{isAr ? '— اختر الكلية —' : '— Select College —'}</option>
                                {signupCollegeOptions.map((option) => (
                                  <option key={option.value} value={option.value}>{isAr ? option.labelAr : option.labelEn}</option>
                                ))}
                              </select>
                            </label>
                            <label className="hierarchy-filter-field">
                              <span>{isAr ? 'القسم' : 'Department'}</span>
                              <select className="select" value={suDepartment} onChange={(e) => changeSignupDepartment(e.target.value)} disabled={!suCollege}>
                                <option value="">{isAr ? '— كل الأقسام —' : '— All Departments —'}</option>
                                {signupDepartmentOptions.map((option) => (
                                  <option key={option.value} value={option.value}>{isAr ? option.labelAr : option.labelEn}</option>
                                ))}
                              </select>
                            </label>
                          </div>
                        )}

                        {signupHasHierarchy && !suCollege ? (
                          <div className="empty-state hierarchy-help">
                            {isAr ? 'اختر الكلية أولاً لعرض التخصصات المتاحة.' : 'Select a college first to show available majors.'}
                          </div>
                        ) : (
                          <div className="signup-majors" role="radiogroup">
                            {filteredSignupMajors.length > 0 ? filteredSignupMajors.map(m => (
                              <button key={m.id} type="button" className={`signup-major${suMajor === m.id ? ' is-active' : ''}`}
                                role="radio" aria-checked={suMajor === m.id}
                                onClick={() => { setSuMajor(m.id); if (errors.major) setErrors({ ...errors, major: undefined }); }}>
                                <span className="signup-major__icon"><svg width="14" height="14"><use href={`#icon-${m.icon}`} /></svg></span>
                                <span className="signup-major__text">
                                  <span className="signup-major__name">{isAr ? m.nameAr : m.nameEn}</span>
                                  <span className="signup-major__desc">{isAr ? m.descAr : m.descEn}</span>
                                </span>
                                <span className="signup-major__check"><svg width="10" height="10"><use href="#icon-check" /></svg></span>
                              </button>
                            )) : (
                              <div className="input-error">
                                {availableMajors.length === 0
                                  ? (isAr ? 'لا توجد تخصصات متاحة حالياً. تأكد من تهيئة قاعدة البيانات.' : 'No majors are available right now. Make sure the database is initialized.')
                                  : (isAr ? 'لا توجد تخصصات مطابقة للفلاتر الحالية.' : 'No majors match the current filters.')}
                              </div>
                            )}
                          </div>
                        )}
                        {errors.major && <div className="input-error">{errors.major}</div>}
                      </div>

                      <div className="signup-row">
                        <div className="input-group">
                          <label className="input-label" htmlFor="su-year">{isAr ? 'السنة الدراسية' : 'Academic Year'}</label>
                          <select id="su-year" className="select" value={suYear}
                            onChange={(e) => { setSuYear(e.target.value); if (errors.year) setErrors({ ...errors, year: undefined }); }}>
                            <option value="">{isAr ? '— اختر السنة —' : '— Select Year —'}</option>
                            <option value="1">{isAr ? 'السنة الأولى' : '1st Year'}</option>
                            <option value="2">{isAr ? 'السنة الثانية' : '2nd Year'}</option>
                            <option value="3">{isAr ? 'السنة الثالثة' : '3rd Year'}</option>
                            <option value="4">{isAr ? 'السنة الرابعة' : '4th Year'}</option>
                            <option value="5">{isAr ? 'السنة الخامسة' : '5th Year'}</option>
                          </select>
                          {errors.year && <div className="input-error">{errors.year}</div>}
                        </div>

                        <div className="input-group">
                          <label className="input-label" htmlFor="su-gpa">
                            {isAr ? 'المعدل (اختياري)' : 'GPA (optional)'}
                          </label>
                          {/* Scale selector */}
                          <div className="gpa-scale-btns">
                            <button
                              type="button"
                              className={`gpa-scale-btn${suGpaScale === '4' ? ' is-active' : ''}`}
                              onClick={() => { setSuGpaScale('4'); if (parseFloat(suGpa) > 4) setSuGpa('4.0'); }}
                            >
                              {isAr ? 'من 4' : 'Out of 4'}
                            </button>
                            <button
                              type="button"
                              className={`gpa-scale-btn${suGpaScale === '5' ? ' is-active' : ''}`}
                              onClick={() => setSuGpaScale('5')}
                            >
                              {isAr ? 'من 5' : 'Out of 5'}
                            </button>
                          </div>
                          {/* Number input clamped to scale */}
                          <div className="input" style={{ marginTop: 'var(--s-2)' }}>
                            <input
                              id="su-gpa"
                              type="number"
                              placeholder={suGpaScale === '4' ? '3.85' : '4.75'}
                              dir="ltr"
                              min="0"
                              max={suGpaScale}
                              step="0.01"
                              value={suGpa}
                              onChange={(e) => {
                                const val = e.target.value;
                                const max = parseFloat(suGpaScale);
                                if (val === '' || val === '.') { setSuGpa(val); return; }
                                if (parseFloat(val) > max) setSuGpa(String(max));
                                else setSuGpa(val);
                              }}
                              onBlur={(e) => {
                                const val = parseFloat(e.target.value);
                                const max = parseFloat(suGpaScale);
                                if (!isNaN(val)) setSuGpa(Math.min(val, max).toFixed(2));
                              }}
                            />
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', whiteSpace: 'nowrap' }}
                            >/ {suGpaScale}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="signup-step__nav">
                    <button className="btn btn--ghost" type="button" onClick={() => setStep(1)}>{isAr ? 'رجوع' : 'Back'}</button>
                    <button className="btn btn--primary" type="button" onClick={() => goTo(3)}>{isAr ? 'التالي' : 'Next'}</button>
                  </div>
                </div>
              )}

              {/* Step 3 */}
              {step === 3 && (
                <div className="signup-step is-active">
                  <h1 className="auth-centered__title">{isAr ? 'المراجعة والتأكيد' : 'Review & Confirm'}</h1>
                  <p className="auth-centered__sub">{isAr ? 'راجع بياناتك قبل إنشاء الحساب.' : 'Review your details before creating your account.'}</p>

                  <div className="signup-review">
                    {reviewRows().map((r, i) => (
                      <div key={i} className="signup-review__row">
                        <span className="signup-review__lbl">{r.lbl}</span>
                        <span className={`signup-review__val${r.mono ? ' mono' : ''}`}>{r.val}</span>
                      </div>
                    ))}
                  </div>

                  <div className="signup-step__nav">
                    <button className="btn btn--ghost" type="button" onClick={() => setStep(2)}>{isAr ? 'رجوع' : 'Back'}</button>
                    <button className="btn btn--primary" type="button" onClick={createAccount}>{isAr ? 'إنشاء الحساب' : 'Create Account'}</button>
                  </div>
                </div>
              )}

              {/* Step 4: Done */}
              {step === 4 && (
                <div className="signup-step signup-step--done is-active">
                  <div className="signup-done__check"><svg width="28" height="28"><use href="#icon-check" /></svg></div>
                  <h1 className="auth-centered__title">{isAr ? 'تم إنشاء حسابك بنجاح' : 'Your account is ready'}</h1>
                  <p className="auth-centered__sub">
                    {isAr
                      ? `مرحباً بك يا ${suName.split(/\s+/)[0] || 'صديقي'}! حسابك جاهز.`
                      : `Welcome, ${suName.split(/\s+/)[0] || 'friend'}! Your account is ready.`}
                  </p>
                  <button className="btn btn--primary btn--block" type="button" onClick={goToDashboard}>
                    {isAr ? 'الانتقال إلى لوحة التحكم' : 'Go to Dashboard'}
                  </button>
                </div>
              )}
            </div>
          )}

        </div>{/* /auth-centered__card */}
      </div>{/* /auth-centered */}

      {resetOpen && (
        <div className="auth-legal-backdrop" role="dialog" aria-modal="true" onClick={closeResetModal}>
          <div className="auth-legal-modal" onClick={(e) => e.stopPropagation()}>
            <button className="auth-legal-modal__close" type="button" onClick={closeResetModal} aria-label="Close">×</button>
            <h2>{isAr ? 'استعادة كلمة المرور' : 'Reset password'}</h2>
            <p className="auth-centered__sub" style={{ marginTop: 0 }}>
              {resetStep === 1 && (isAr ? 'اكتب بريدك المسجل وسنرسل لك رمز تحقق.' : 'Enter your registered email and we will send you a verification code.')}
              {resetStep === 2 && (isAr ? 'اكتب رمز التحقق المرسل إلى بريدك.' : 'Enter the verification code sent to your email.')}
              {resetStep === 3 && (isAr ? 'اختر كلمة مرور جديدة لحسابك.' : 'Choose a new password for your account.')}
            </p>

            {resetStep === 1 && (
              <form onSubmit={requestResetCode} style={{ display: 'grid', gap: 'var(--s-3)' }}>
                <div className="input-group">
                  <label className="input-label" htmlFor="reset-email">{isAr ? 'البريد الإلكتروني' : 'Email'}</label>
                  <div className="input">
                    <svg width="14" height="14"><use href="#icon-user" /></svg>
                    <input id="reset-email" type="email" dir="ltr" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} placeholder="student@university.edu" required />
                  </div>
                </div>
                <button className="btn btn--primary btn--block" type="submit" disabled={resetBusy}>
                  {resetBusy ? (isAr ? 'جاري الإرسال...' : 'Sending...') : (isAr ? 'إرسال رمز التحقق' : 'Send verification code')}
                </button>
              </form>
            )}

            {resetStep === 2 && (
              <form onSubmit={verifyResetCode} style={{ display: 'grid', gap: 'var(--s-3)' }}>
                <div className="input-group">
                  <label className="input-label" htmlFor="reset-code">{isAr ? 'رمز التحقق' : 'Verification code'}</label>
                  <div className="input">
                    <svg width="14" height="14"><use href="#icon-lock" /></svg>
                    <input id="reset-code" inputMode="numeric" pattern="[0-9]{6}" maxLength="6" dir="ltr" value={resetCode} onChange={(e) => setResetCode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="123456" required />
                  </div>
                </div>
                <button className="btn btn--primary btn--block" type="submit" disabled={resetBusy}>
                  {resetBusy ? (isAr ? 'جاري التحقق...' : 'Verifying...') : (isAr ? 'تأكيد الرمز' : 'Verify code')}
                </button>
                <button className="btn btn--ghost btn--block" type="button" onClick={requestResetCode} disabled={resetBusy}>
                  {isAr ? 'إعادة إرسال الرمز' : 'Resend code'}
                </button>
              </form>
            )}

            {resetStep === 3 && (
              <form onSubmit={submitNewPassword} style={{ display: 'grid', gap: 'var(--s-3)' }}>
                <div className="input-group">
                  <label className="input-label" htmlFor="reset-pw">{isAr ? 'كلمة المرور الجديدة' : 'New password'}</label>
                  <div className="input">
                    <svg width="14" height="14"><use href="#icon-lock" /></svg>
                    <input id="reset-pw" type="password" dir="ltr" value={resetPw} onChange={(e) => setResetPw(e.target.value)} placeholder="••••••••" required />
                  </div>
                </div>
                <div className="input-group">
                  <label className="input-label" htmlFor="reset-pw2">{isAr ? 'تأكيد كلمة المرور' : 'Confirm password'}</label>
                  <div className="input">
                    <svg width="14" height="14"><use href="#icon-lock" /></svg>
                    <input id="reset-pw2" type="password" dir="ltr" value={resetPw2} onChange={(e) => setResetPw2(e.target.value)} placeholder="••••••••" required />
                  </div>
                </div>
                <button className="btn btn--primary btn--block" type="submit" disabled={resetBusy}>
                  {resetBusy ? (isAr ? 'جاري الحفظ...' : 'Saving...') : (isAr ? 'تغيير كلمة المرور' : 'Change password')}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {legalOpen && (
        <div className="auth-legal-backdrop" role="dialog" aria-modal="true" onClick={() => setLegalOpen(null)}>
          <div className="auth-legal-modal" onClick={(e) => e.stopPropagation()}>
            <button className="auth-legal-modal__close" type="button" onClick={() => setLegalOpen(null)} aria-label="Close">×</button>
            <h2>{legalOpen === 'privacy' ? (isAr ? 'سياسة الخصوصية' : 'Privacy Policy') : (isAr ? 'الشروط والأحكام' : 'Terms & Conditions')}</h2>
            {legalOpen === 'privacy' ? (
              <div className="auth-legal-modal__body">
                <p>{isAr ? 'نستخدم بيانات الحساب والبيانات الأكاديمية لتشغيل المنصة فقط: تسجيل الدخول، عرض المواد، حفظ الملاحظات، إدارة المواعيد، وتشغيل أدوات المراجعة.' : 'We use account and academic data only to operate the platform: authentication, course display, note saving, event management, and study tools.'}</p>
                <p>{isAr ? 'لا يتم بيع بيانات المستخدمين أو مشاركتها لأغراض إعلانية. يمكن للمستخدم تعديل بياناته من صفحة الملف الشخصي.' : 'User data is not sold or shared for advertising purposes. Users can update their information from the profile page.'}</p>
              </div>
            ) : (
              <div className="auth-legal-modal__body">
                <p>{isAr ? 'باستخدام Study Buddy، يوافق المستخدم على استخدام المنصة للأغراض التعليمية فقط، وعلى عدم مشاركة بيانات الدخول أو إساءة استخدام المحادثات والمجتمع.' : 'By using Study Buddy, the user agrees to use the platform for educational purposes only, not share login credentials, and not misuse chat or community tools.'}</p>
                <p>{isAr ? 'المواد والملاحظات التي يضيفها المستخدم تبقى مرتبطة بحسابه وتُستخدم داخل المنصة لتحسين تجربة الدراسة والمتابعة.' : 'Materials and notes added by the user remain linked to the user account and are used inside the platform to improve studying and progress tracking.'}</p>
              </div>
            )}
            <button className="btn btn--primary btn--block" type="button" onClick={() => setLegalOpen(null)}>{isAr ? 'موافق' : 'I understand'}</button>
          </div>
        </div>
      )}
    </section>
  );
}

