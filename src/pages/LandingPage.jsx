import { useState, useEffect, useRef } from 'react';
import '../styles-landing.css';
import * as api from '../api';

const I18N = {
  ar: {
    'brand.name': 'Study Buddy', 'brand.sub': 'المنصة الأكاديمية',
    'land.nav.features': 'المميزات', 'land.nav.how': 'كيف يعمل',
    'land.nav.majors': 'التخصصات', 'land.nav.faq': 'الأسئلة الشائعة',
    'land.nav.login': 'تسجيل الدخول', 'land.nav.signup': 'ابدأ مجاناً',
    'land.hero.eyebrow': 'منصة الطالب الجامعي · 2026',
    'land.hero.title': 'كل دراستك الجامعية', 'land.hero.titleEm': 'في مكان واحد',
    'land.hero.sub': 'نظّم موادك، تابع معدّلك التراكمي، ولخّص محاضراتك بمساعد ذكي مصمَّم لطلاب الجامعة. كل شيء في تطبيق واحد، مرتّب وسريع.',
    'land.hero.cta1': 'ابدأ الآن مجاناً', 'land.hero.cta2': 'تسجيل الدخول',
    'land.hero.proof.students': 'طالب نشط', 'land.hero.proof.majors': 'تخصصات جامعية', 'land.hero.proof.rating': 'تقييم الطلاب',
    'land.mock.welcome': 'مرحباً يوسف 👋', 'land.mock.welcomeSub': 'لديك 3 محاضرات اليوم وموعدان قريبان',
    'land.mock.term': 'الفصل الأول', 'land.mock.stat1': 'المواد', 'land.mock.stat1Sub': '18 ساعة معتمدة',
    'land.mock.stat2': 'المعدل', 'land.mock.stat2Sub': 'من الفصل الماضي', 'land.mock.stat3': 'الساعات', 'land.mock.stat3Sub': 'من أصل 132',
    'land.mock.classes': 'محاضرات اليوم', 'land.mock.viewAll': 'عرض الكل',
    'land.mock.class1': 'تصميم تجربة المستخدم', 'land.mock.class2': 'قواعد البيانات', 'land.mock.class3': 'هندسة البرمجيات',
    'land.mock.ai': 'المساعد الذكي', 'land.mock.aiSub': 'لخّص محاضرة، ولّد أسئلة تدريبية، أو اشرح مفهوم صعب — مباشرة من موادك.',
    'land.proof.l1': 'طالب وطالبة', 'land.proof.l2': 'مادة جامعية', 'land.proof.l3': 'معدل المتابعة', 'land.proof.l4': 'رضى الطلاب',
    'land.feat.eyebrow': 'ما يقدّمه Study Buddy', 'land.feat.title': 'كل ما تحتاجه في فصلك الدراسي',
    'land.feat.sub': 'أدوات مصممة خصيصاً للطالب الجامعي — من تنظيم المواد إلى المراجعة الذكية.',
    'land.feat.1.t': 'إدارة المواد', 'land.feat.1.d': 'تابع كل موادك المسجّلة وتقدّمك في كل مادة بنسبة مئوية واضحة، مع كل ملف ومحاضرة وواجب في مكان واحد.',
    'land.feat.2.t': 'المساعد الذكي', 'land.feat.2.d': 'لخّص المحاضرات، ولّد اختبارات تدريبية، واشرح المفاهيم الصعبة — كل ذلك مرتبط بموادك الفعلية.',
    'land.feat.3.t': 'التقويم الموحّد', 'land.feat.3.d': 'المحاضرات والاختبارات والتسليمات في تقويم واحد ذكي، مع تنبيهات مبكرة قبل كل موعد.',
    'land.feat.4.t': 'مجموعات الدراسة', 'land.feat.4.d': 'انضم إلى محادثة جماعية مع زملاء كل مادة، شارك الملخصات، ونظّم جلسات مراجعة قبل الاختبارات.',
    'land.feat.5.t': 'تتبّع الأداء', 'land.feat.5.d': 'راقب معدّلك التراكمي، ساعاتك المعتمدة، ومسارك حتى التخرّج، بإحصاءات بصرية واضحة.',
    'land.feat.6.t': 'استكشاف التخصصات', 'land.feat.6.d': 'تصفّح الخطط الدراسية لكل التخصصات، قارن المسارات، واكتشف المواد قبل أن تسجّل فيها.',
    'land.how.eyebrow': 'كيف يعمل', 'land.how.title': 'ابدأ في أقل من دقيقتين',
    'land.how.sub': 'ثلاث خطوات بسيطة لتنظيم حياتك الدراسية بالكامل.',
    'land.how.1.t': 'أنشئ حسابك', 'land.how.1.d': 'سجّل ببريدك الجامعي، اختر تخصصك ومستواك الدراسي — يستغرق أقل من دقيقة.',
    'land.how.2.t': 'أضف موادك', 'land.how.2.d': 'اختر مواد فصلك من دليل جامعتك بنقرة واحدة، وستجد كل التفاصيل جاهزة.',
    'land.how.3.t': 'ادرس بذكاء', 'land.how.3.d': 'استخدم المساعد الذكي، تابع تقدّمك، وتواصل مع زملائك — كل ذلك في مكان واحد.',
    'land.maj.eyebrow': 'التخصصات المتاحة', 'land.maj.title': 'من علوم الحاسب إلى الذكاء الاصطناعي',
    'land.maj.sub': 'خطط دراسية كاملة لـ 8 تخصصات جامعية، مع مواد محدّثة وفقاً لخطط الجامعات السعودية.',
    'land.maj.courses': 'مقرر',
    'land.maj.1.n': 'علوم الحاسب', 'land.maj.2.n': 'هندسة البرمجيات', 'land.maj.3.n': 'الأمن السيبراني',
    'land.maj.4.n': 'الذكاء الاصطناعي', 'land.maj.5.n': 'علم البيانات', 'land.maj.6.n': 'نظم المعلومات',
    'land.maj.7.n': 'هندسة الحاسب', 'land.maj.8.n': 'تفاعل الإنسان مع الحاسب',
    'land.test.eyebrow': 'نظرة على المنصة', 'land.test.title': 'مكوّنات تعمل داخل التطبيق',
    'land.test.sub': 'عرض لأقسام Study Buddy المتصلة بواجهة التطبيق وقاعدة البيانات.',
    'land.test.1.q': 'إدارة مواد كاملة مرتبطة بقاعدة البيانات، مع مواد، ملفات، تقدم، وملاحظات لكل طالب.',
    'land.test.1.n': 'Courses Module', 'land.test.1.r': 'PostgreSQL + Prisma',
    'land.test.2.q': 'تقويم واجتماعات ودعوات قابلة للإضافة والقبول والرفض من داخل التطبيق.',
    'land.test.2.n': 'Calendar & Meetings', 'land.test.2.r': 'Events API',
    'land.test.3.q': 'محادثات المواد، المجتمع، والموارد تعمل كأقسام منفصلة بدل أزرار شكلية.',
    'land.test.3.n': 'Community Tools', 'land.test.3.r': 'Routes + Controllers',
    'land.faq.eyebrow': 'الأسئلة الشائعة', 'land.faq.title': 'كل ما تريد معرفته',
    'land.faq.sub': 'إجابات سريعة على الأسئلة الأكثر شيوعاً.',
    'land.faq.1.q': 'هل المنصة مجانية للطلاب؟', 'land.faq.1.a': 'نعم، Study Buddy مجانية بالكامل لجميع الطلاب الجامعيين. كل المميزات الأساسية متاحة بدون أي اشتراك أو رسوم خفية.',
    'land.faq.2.q': 'كيف يعمل المساعد الذكي؟', 'land.faq.2.a': 'المساعد الذكي يستخدم نماذج لغوية متقدمة لقراءة موادك الفعلية (ملخصات، سلايدات، محاضرات) ويولّد إجابات وملخصات وأسئلة بناءً عليها مباشرة.',
    'land.faq.3.q': 'هل تدعم المنصة جامعتي؟', 'land.faq.3.a': 'النسخة الحالية مركّزة على بيانات جامعة أم القرى مع إمكانية اختيار التخصص وإضافة المواد من الكتالوج المتاح داخل التطبيق.',
    'land.faq.4.q': 'هل بياناتي وملاحظاتي آمنة؟', 'land.faq.4.a': 'نأخذ خصوصيتك على محمل الجدّ. كل بياناتك مشفّرة وتخزَّن في خوادم آمنة. لا نشارك ملاحظاتك أو ملفاتك مع أي طرف ثالث أبداً.',
    'land.faq.5.q': 'هل أستطيع استخدامها على الجوال؟', 'land.faq.5.a': 'نعم، المنصة متجاوبة بالكامل مع الجوال، اللوحي، والحاسوب — مع نفس تجربة المستخدم على كل الأجهزة.',
    'land.faq.6.q': 'كيف أبدأ؟', 'land.faq.6.a': 'اضغط على "ابدأ مجاناً" في الأعلى، أنشئ حساباً ببريدك الجامعي، واختر تخصصك. خلال دقيقتين ستكون جاهزاً للبدء.',
    'land.cta.title': 'ابدأ رحلتك الدراسية بذكاء — اليوم',
    'land.cta.sub': 'أنشئ حسابك وابدأ بإضافة موادك، متابعة مواعيدك، حفظ ملاحظاتك، واستخدام أدوات المراجعة داخل منصة واحدة.',
    'land.cta.btn': 'إنشاء حساب مجاني',
    'land.foot.about': 'منصة الطالب الجامعي الموحّدة — تنظيم، متابعة، ومراجعة ذكية في مكان واحد.',
    'land.foot.product': 'المنتج', 'land.foot.support': 'الدعم', 'land.foot.company': 'الشركة',
    'land.foot.features': 'المميزات', 'land.foot.how': 'كيف يعمل', 'land.foot.majors': 'التخصصات', 'land.foot.signup': 'إنشاء حساب',
    'land.foot.faq': 'الأسئلة الشائعة', 'land.foot.help': 'مركز المساعدة', 'land.foot.contact': 'تواصل معنا', 'land.foot.report': 'الإبلاغ عن مشكلة',
    'land.foot.about2': 'من نحن', 'land.foot.privacy': 'سياسة الخصوصية', 'land.foot.terms': 'شروط الاستخدام', 'land.foot.careers': 'انضم إلينا',
    'land.foot.rights': 'جميع الحقوق محفوظة',
  },
  en: {
    'brand.name': 'Study Buddy', 'brand.sub': 'Academic platform',
    'land.nav.features': 'Features', 'land.nav.how': 'How it works',
    'land.nav.majors': 'Majors', 'land.nav.faq': 'FAQ',
    'land.nav.login': 'Log in', 'land.nav.signup': 'Start free',
    'land.hero.eyebrow': 'University student platform · 2026',
    'land.hero.title': 'Your entire college life,', 'land.hero.titleEm': 'all in one place',
    'land.hero.sub': 'Organize courses, track your GPA, and summarize lectures with an AI built for university students. Everything in one fast, beautifully organized app.',
    'land.hero.cta1': 'Start free now', 'land.hero.cta2': 'Log in',
    'land.hero.proof.students': 'Active students', 'land.hero.proof.majors': 'University majors', 'land.hero.proof.rating': 'Student rating',
    'land.mock.welcome': 'Welcome, Yousef 👋', 'land.mock.welcomeSub': 'You have 3 classes today and 2 upcoming deadlines',
    'land.mock.term': 'Term 1', 'land.mock.stat1': 'Courses', 'land.mock.stat1Sub': '18 credit hours',
    'land.mock.stat2': 'GPA', 'land.mock.stat2Sub': 'from last term', 'land.mock.stat3': 'Hours', 'land.mock.stat3Sub': 'of 132 total',
    'land.mock.classes': "Today's classes", 'land.mock.viewAll': 'View all',
    'land.mock.class1': 'UX Design', 'land.mock.class2': 'Databases', 'land.mock.class3': 'Software Engineering',
    'land.mock.ai': 'AI Assistant', 'land.mock.aiSub': 'Summarize a lecture, generate quizzes, or explain a hard concept — straight from your own materials.',
    'land.proof.l1': 'Students', 'land.proof.l2': 'University courses', 'land.proof.l3': 'Retention rate', 'land.proof.l4': 'Student satisfaction',
    'land.feat.eyebrow': 'What Study Buddy offers', 'land.feat.title': 'Everything you need for your semester',
    'land.feat.sub': 'Tools designed specifically for university students — from course organization to smart review.',
    'land.feat.1.t': 'Course management', 'land.feat.1.d': 'Track all your enrolled courses with a clear progress percentage — every file, lecture, and assignment in one place.',
    'land.feat.2.t': 'AI Assistant', 'land.feat.2.d': 'Summarize lectures, generate practice quizzes, and explain hard concepts — all tied directly to your real coursework.',
    'land.feat.3.t': 'Unified calendar', 'land.feat.3.d': 'Lectures, exams, and deadlines in one smart calendar, with early reminders before every event.',
    'land.feat.4.t': 'Study groups', 'land.feat.4.d': 'Join a group chat with classmates from each course, share summaries, and organize review sessions before exams.',
    'land.feat.5.t': 'Performance tracking', 'land.feat.5.d': 'Monitor your GPA, credit hours, and degree path with clear visual analytics.',
    'land.feat.6.t': 'Explore majors', 'land.feat.6.d': 'Browse degree plans for every major, compare paths, and discover courses before you enroll.',
    'land.how.eyebrow': 'How it works', 'land.how.title': 'Get started in under 2 minutes',
    'land.how.sub': 'Three simple steps to organize your entire academic life.',
    'land.how.1.t': 'Create your account', 'land.how.1.d': 'Sign up with your university email, pick your major and level — takes less than a minute.',
    'land.how.2.t': 'Add your courses', 'land.how.2.d': 'Pick your term courses from your university catalog in one click — all details are ready.',
    'land.how.3.t': 'Study smart', 'land.how.3.d': 'Use the AI assistant, track your progress, and chat with classmates — all in one place.',
    'land.maj.eyebrow': 'Available majors', 'land.maj.title': 'From Computer Science to AI',
    'land.maj.sub': 'Complete degree plans for 8 university majors, with courses updated to match Saudi university curricula.',
    'land.maj.courses': 'courses',
    'land.maj.1.n': 'Computer Science', 'land.maj.2.n': 'Software Engineering', 'land.maj.3.n': 'Cybersecurity',
    'land.maj.4.n': 'Artificial Intelligence', 'land.maj.5.n': 'Data Science', 'land.maj.6.n': 'Information Systems',
    'land.maj.7.n': 'Computer Engineering', 'land.maj.8.n': 'Human-Computer Interaction',
    'land.test.eyebrow': 'Platform overview', 'land.test.title': 'Working modules inside the app',
    'land.test.sub': 'A clear view of Study Buddy sections connected to the interface and database.',
    'land.test.1.q': '"The AI assistant saved me hours of summarizing. I can review an entire lecture in minutes and get practice questions ready for the exam."',
    'land.test.1.n': 'Yousef Al-Harbi', 'land.test.1.r': 'CS · Level 5',
    'land.test.2.q': '"I love the unified calendar. I know exactly when I have classes, deadlines, and exams — all in one place. I never forget an event anymore."',
    'land.test.2.n': 'Sarah Al-Otaibi', 'land.test.2.r': 'Software Eng · Level 4',
    'land.test.3.q': '"The study group helped me connect with classmates easily. We share summaries and prep for exams together — a completely different experience."',
    'land.test.3.n': 'Majed Al-Qarni', 'land.test.3.r': 'AI · Level 6',
    'land.faq.eyebrow': 'Frequently asked', 'land.faq.title': 'Everything you want to know',
    'land.faq.sub': 'Quick answers to the most common questions.',
    'land.faq.1.q': 'Is the platform free for students?', 'land.faq.1.a': 'Yes — Study Buddy is completely free for all university students. All core features are available with no subscription or hidden fees.',
    'land.faq.2.q': 'How does the AI assistant work?', 'land.faq.2.a': 'The AI uses advanced language models to read your actual coursework (summaries, slides, lectures) and generate answers, summaries, and quizzes based directly on them.',
    'land.faq.3.q': 'Does the platform support my university?', 'land.faq.3.a': "The current version focuses on Umm Al-Qura University data, with major selection and course enrollment from the available catalog inside the app.",
    'land.faq.4.q': 'Are my data and notes safe?', 'land.faq.4.a': 'We take your privacy seriously. All your data is encrypted and stored on secure servers. We never share your notes or files with any third party.',
    'land.faq.5.q': 'Can I use it on mobile?', 'land.faq.5.a': 'Yes — the platform is fully responsive across mobile, tablet, and desktop, with the same user experience on every device.',
    'land.faq.6.q': 'How do I get started?', 'land.faq.6.a': "Click \"Start free\" at the top, create an account with your university email, and pick your major. In two minutes you'll be ready to go.",
    'land.hero.cta1': 'Start free now', 'land.hero.cta2': 'Log in',
    'land.cta.title': 'Start studying smarter — today',
    'land.cta.sub': 'Create your account, add courses, track events, save notes, and use study tools from one platform.',
    'land.cta.btn': 'Create free account',
    'land.foot.about': 'The unified university-student platform — organize, track, and review smartly, all in one place.',
    'land.foot.product': 'Product', 'land.foot.support': 'Support', 'land.foot.company': 'Company',
    'land.foot.features': 'Features', 'land.foot.how': 'How it works', 'land.foot.majors': 'Majors', 'land.foot.signup': 'Sign up',
    'land.foot.faq': 'FAQ', 'land.foot.help': 'Help center', 'land.foot.contact': 'Contact us', 'land.foot.report': 'Report an issue',
    'land.foot.about2': 'About', 'land.foot.privacy': 'Privacy policy', 'land.foot.terms': 'Terms of use', 'land.foot.careers': 'Careers',
    'land.foot.rights': 'All rights reserved',
  }
};

const FEATURES = [
  { icon: 'i-book', t: 'land.feat.1.t', d: 'land.feat.1.d' },
  { icon: 'i-spark', t: 'land.feat.2.t', d: 'land.feat.2.d' },
  { icon: 'i-cal', t: 'land.feat.3.t', d: 'land.feat.3.d' },
  { icon: 'i-users', t: 'land.feat.4.t', d: 'land.feat.4.d' },
  { icon: 'i-trend', t: 'land.feat.5.t', d: 'land.feat.5.d' },
  { icon: 'i-cap', t: 'land.feat.6.t', d: 'land.feat.6.d' },
];

const MAJORS = [
  { icon: 'i-code', n: 'land.maj.1.n', courses: 42, students: '3.2K' },
  { icon: 'i-file', n: 'land.maj.2.n', courses: 38, students: '2.1K' },
  { icon: 'i-shield', n: 'land.maj.3.n', courses: 36, students: '1.8K' },
  { icon: 'i-brain', n: 'land.maj.4.n', courses: 40, students: '2.4K' },
  { icon: 'i-database', n: 'land.maj.5.n', courses: 35, students: '1.4K' },
  { icon: 'i-grid', n: 'land.maj.6.n', courses: 39, students: '1.1K' },
  { icon: 'i-cap', n: 'land.maj.7.n', courses: 44, students: '980' },
  { icon: 'i-spark', n: 'land.maj.8.n', courses: 32, students: '1.6K' },
];

const TESTIMONIALS = [
  { q: 'land.test.1.q', n: 'land.test.1.n', r: 'land.test.1.r', init: 'YH', color: '' },
  { q: 'land.test.2.q', n: 'land.test.2.n', r: 'land.test.2.r', init: 'SA', color: '#7C3AED' },
  { q: 'land.test.3.q', n: 'land.test.3.n', r: 'land.test.3.r', init: 'MQ', color: '#0EA5E9' },
];

const FAQS = [1,2,3,4,5,6].map(i => ({ q: `land.faq.${i}.q`, a: `land.faq.${i}.a` }));

export default function LandingPage({ onEnter }) {
  const [lang, setLang] = useState(() => localStorage.getItem('sb_lang') || 'ar');
  const [theme, setTheme] = useState(() => localStorage.getItem('sb_theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  const [footerInfo, setFooterInfo] = useState(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportBusy, setReportBusy] = useState(false);
  const [reportForm, setReportForm] = useState({ name: '', email: '', category: 'bug', subject: '', message: '' });
  const isAr = lang === 'ar';
  const d = I18N[lang];
  const t = k => d[k] || k;

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = isAr ? 'rtl' : 'ltr';
    localStorage.setItem('sb_lang', lang);
  }, [lang, isAr]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('sb_theme', theme);
  }, [theme]);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) { const y = el.getBoundingClientRect().top + window.pageYOffset - 60; window.scrollTo({ top: y, behavior: 'smooth' }); }
    setMobileOpen(false);
  };

  const footerPanels = {
    features: { title: isAr ? 'المميزات' : 'Features', body: isAr ? 'المميزات الأساسية تشمل إدارة المواد، المساعد الذكي، التقويم، مجموعات الدراسة، تتبع الأداء، واستكشاف التخصصات.' : 'Core features include course management, AI assistant, calendar, study groups, progress tracking, and major exploration.' },
    how: { title: isAr ? 'كيف يعمل' : 'How it works', body: isAr ? 'أنشئ حسابك، اختر تخصصك، أضف موادك، ثم ابدأ بمتابعة ملفاتك ومواعيدك ومحادثاتك من لوحة واحدة.' : 'Create an account, choose your major, add your courses, then manage files, events, and chats from one dashboard.' },
    majors: { title: isAr ? 'التخصصات' : 'Majors', body: isAr ? 'يدعم التطبيق تخصصات تقنية متعددة مع كتالوج مواد واسع مبني على بيانات أم القرى داخل قاعدة البيانات.' : 'The app supports multiple computing majors with a large UQU-based course catalog stored in the database.' },
    faq: { title: isAr ? 'الأسئلة الشائعة' : 'FAQ', body: isAr ? 'المنصة مجانية للطلاب وتحتوي على وظائف المواد، المواعيد، الملاحظات، المجتمع، والمساعد الذكي.' : 'The platform is free for students and includes courses, events, notes, community, and AI assistant features.' },
    help: { title: isAr ? 'مركز المساعدة' : 'Help Center', body: isAr ? 'هنا يجد الطالب خطوات تشغيل المنصة، إضافة المواد، استخدام المساعد الذكي، ومتابعة المواعيد.' : 'This area explains how students use the platform, add courses, use the AI assistant, and track deadlines.' },
    contact: { title: isAr ? 'تواصل معنا' : 'Contact', body: isAr ? 'للدعم الأكاديمي أو الفني: support@studybuddy.app' : 'For academic or technical support: support@studybuddy.app' },
    about: { title: isAr ? 'عن Study Buddy' : 'About Study Buddy', body: isAr ? 'منصة جامعية تساعد الطالب على تنظيم المواد، الملفات، المحادثات، المواعيد، والتقدم الدراسي في مكان واحد.' : 'A university platform that helps students manage courses, files, chats, events, and academic progress in one place.' },
    privacy: { title: isAr ? 'سياسة الخصوصية' : 'Privacy Policy', body: isAr ? 'تعتمد المنصة على تسجيل دخول آمن وتخزين بيانات الطالب الدراسية لاستخدامها داخل التطبيق فقط.' : 'The platform uses secure login and stores academic data only for use inside the application.' },
    terms: { title: isAr ? 'الشروط والأحكام' : 'Terms', body: isAr ? 'استخدام المنصة مخصص للأغراض التعليمية، ويجب عدم مشاركة بيانات الدخول أو إساءة استخدام أدوات المجتمع.' : 'The platform is for educational use. Users should not share login data or misuse community tools.' },
    };

  const showFooterInfo = (key) => setFooterInfo(footerPanels[key]);

  const updateReportField = (field, value) => setReportForm(prev => ({ ...prev, [field]: value }));

  const submitReport = async (e) => {
    e?.preventDefault();
    if (reportForm.subject.trim().length < 3) {
      alert(isAr ? 'اكتب عنوان المشكلة' : 'Please add a report subject');
      return;
    }
    if (reportForm.message.trim().length < 10) {
      alert(isAr ? 'اكتب تفاصيل أوضح للمشكلة' : 'Please describe the issue with more details');
      return;
    }
    setReportBusy(true);
    try {
      await api.createReport(reportForm);
      setReportOpen(false);
      setReportForm({ name: '', email: '', category: 'bug', subject: '', message: '' });
      alert(isAr ? 'تم إرسال البلاغ للإدارة بنجاح.' : 'Your report was sent to the admin team.');
    } catch (err) {
      alert(err.message || (isAr ? 'تعذر إرسال البلاغ' : 'Could not send report'));
    } finally {
      setReportBusy(false);
    }
  };

  return (
    <div className="landing">
      {/* SVG Defs */}
      <svg width="0" height="0" style={{position:'absolute'}} aria-hidden="true">
        <defs>
          <symbol id="i-book" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h11a3 3 0 0 1 3 3v13H7a3 3 0 0 1-3-3V4z"/><path d="M4 4v13a3 3 0 0 0 3 3"/></symbol>
          <symbol id="i-cap" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M2 10l10-5 10 5-10 5L2 10z"/><path d="M6 12v5a6 6 0 0 0 12 0v-5"/></symbol>
          <symbol id="i-cal" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></symbol>
          <symbol id="i-spark" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"/></symbol>
          <symbol id="i-users" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3.5"/><path d="M2 21a7 7 0 0 1 14 0"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14a5 5 0 0 1 6 5"/></symbol>
          <symbol id="i-trend" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/></symbol>
          <symbol id="i-brain" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M9 4a3 3 0 0 0-3 3v1a3 3 0 0 0-2 2.8 3 3 0 0 0 1.2 2.4A3 3 0 0 0 7 17a3 3 0 0 0 5 1 3 3 0 0 0 5-1 3 3 0 0 0 1.8-3.8 3 3 0 0 0 1.2-2.4 3 3 0 0 0-2-2.8V7a3 3 0 0 0-3-3 3 3 0 0 0-3 1 3 3 0 0 0-3-1z"/></symbol>
          <symbol id="i-shield" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6l8-3z"/></symbol>
          <symbol id="i-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></symbol>
          <symbol id="i-chev-r" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6"/></symbol>
          <symbol id="i-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4l1.4-1.4M17 7l1.4-1.4"/></symbol>
          <symbol id="i-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M21 13A9 9 0 0 1 11 3a7 7 0 1 0 10 10z"/></symbol>
          <symbol id="i-star" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z"/></symbol>
          <symbol id="i-menu" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></symbol>
          <symbol id="i-file" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 14h6M9 18h4"/></symbol>
          <symbol id="i-code" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M8 6l-6 6 6 6M16 6l6 6-6 6M14 4l-4 16"/></symbol>
          <symbol id="i-database" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/></symbol>
          <symbol id="i-grid" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="8" rx="1"/><rect x="3" y="13" width="8" height="8" rx="1"/><rect x="13" y="13" width="8" height="8" rx="1"/></symbol>
        </defs>
      </svg>

      {/* Header */}
      <header className="land-header">
        <div className="container">
          <nav className="land-nav">
            <button className="land-brand" onClick={() => window.scrollTo({top:0,behavior:'smooth'})} style={{background:'none',border:'none',cursor:'pointer',padding:0,display:'flex',alignItems:'center'}}>
              <img src="/logo.svg" alt="Study Buddy Logo" style={{ height: '54px', width: 'auto', objectFit: 'contain' }} />
            </button>
            <div className="land-nav__links">
              <button className="land-nav__link" onClick={() => scrollTo('features')}>{t('land.nav.features')}</button>
              <button className="land-nav__link" onClick={() => scrollTo('how')}>{t('land.nav.how')}</button>
              <button className="land-nav__link" onClick={() => scrollTo('majors')}>{t('land.nav.majors')}</button>
              <button className="land-nav__link" onClick={() => scrollTo('faq')}>{t('land.nav.faq')}</button>
            </div>
            <div className="land-nav__actions">
              <div className="land-lang-switch" role="group">
                <button className={lang==='ar'?'is-active':''} onClick={() => setLang('ar')}>العربية</button>
                <button className={lang==='en'?'is-active':''} onClick={() => setLang('en')}>EN</button>
              </div>
              <button className="land-icon-btn" onClick={() => setTheme(t => t==='dark'?'light':'dark')} aria-label="toggle theme">
                <svg width="16" height="16"><use href={theme==='dark'?'#i-sun':'#i-moon'}/></svg>
              </button>
              <button className="btn btn--ghost btn--sm land-nav__login" onClick={onEnter}>{t('land.nav.login')}</button>
              <button className="btn btn--accent btn--sm" onClick={onEnter}>{t('land.nav.signup')}</button>
              <button className="land-icon-btn land-nav__mobile-btn" onClick={() => setMobileOpen(o => !o)} aria-label="menu">
                <svg width="18" height="18"><use href="#i-menu"/></svg>
              </button>
            </div>
          </nav>
        </div>
        {mobileOpen && (
          <div className="land-mobile-menu is-open">
            <button onClick={() => scrollTo('features')}>{t('land.nav.features')}</button>
            <button onClick={() => scrollTo('how')}>{t('land.nav.how')}</button>
            <button onClick={() => scrollTo('majors')}>{t('land.nav.majors')}</button>
            <button onClick={() => scrollTo('faq')}>{t('land.nav.faq')}</button>
            <div className="land-lang-switch land-lang-switch--mobile" role="group">
              <button className={lang==='ar'?'is-active':''} onClick={() => setLang('ar')}>العربية</button>
              <button className={lang==='en'?'is-active':''} onClick={() => setLang('en')}>English</button>
            </div>
            <button className="btn btn--ghost" onClick={onEnter}>{t('land.nav.login')}</button>
            <button className="btn btn--accent" onClick={onEnter}>{t('land.nav.signup')}</button>
          </div>
        )}
      </header>

      <main id="top">
        {/* Hero */}
        <section className="hero">
          <div className="container hero__inner">
            <div className="hero__content reveal is-in">
              <div className="hero__eyebrow">
                <span className="dot"></span>
                <span className="tag tag--accent">{t('land.hero.eyebrow')}</span>
              </div>
              <h1 className="hero__title">
                {t('land.hero.title')} <em>{t('land.hero.titleEm')}</em>
              </h1>
              <p className="hero__sub">{t('land.hero.sub')}</p>
              <div className="hero__actions">
                <button className="btn btn--accent" onClick={onEnter}>
                  <span>{t('land.hero.cta1')}</span>
                  <svg style={{width:14,height:14}}><use href="#i-arrow"/></svg>
                </button>
                <button className="btn btn--secondary" onClick={onEnter}>{t('land.hero.cta2')}</button>
              </div>
              <div className="hero__proof">
                <div className="hero__proof-item"><span className="hero__proof-num">836</span><span className="hero__proof-label">{t('land.hero.proof.students')}</span></div>
                <div className="hero__proof-item"><span className="hero__proof-num">8</span><span className="hero__proof-label">{t('land.hero.proof.majors')}</span></div>
                <div className="hero__proof-item"><span className="hero__proof-num">4.9★</span><span className="hero__proof-label">{t('land.hero.proof.rating')}</span></div>
              </div>
            </div>

            {/* Mock dashboard */}
            <div className="hero__visual reveal is-in" aria-hidden="true">
              <div className="mock-window">
                <div className="mock-window__chrome">
                  <span className="mock-window__dot mock-window__dot--r"></span>
                  <span className="mock-window__dot mock-window__dot--y"></span>
                  <span className="mock-window__dot mock-window__dot--g"></span>
                  <span className="mock-window__url">studybuddy.app/dashboard</span>
                </div>
                <div className="mock-window__body">
                  <div className="mock-welcome">
                    <div><h3>{t('land.mock.welcome')}</h3><p>{t('land.mock.welcomeSub')}</p></div>
                    <span className="mock-tag">{t('land.mock.term')}</span>
                  </div>
                  <div className="mock-stats">
                    <div className="mock-stat">
                      <div className="mock-stat__lbl"><svg width="14" height="14"><use href="#i-book"/></svg><span>{t('land.mock.stat1')}</span></div>
                      <div className="mock-stat__val">6</div>
                      <div className="mock-stat__sub">{t('land.mock.stat1Sub')}</div>
                    </div>
                    <div className="mock-stat">
                      <div className="mock-stat__lbl"><svg width="14" height="14"><use href="#i-trend"/></svg><span>{t('land.mock.stat2')}</span></div>
                      <div className="mock-stat__val">3.85</div>
                      <div className="mock-stat__sub"><b>↑ 0.12</b> <span>{t('land.mock.stat2Sub')}</span></div>
                    </div>
                    <div className="mock-stat">
                      <div className="mock-stat__lbl"><svg width="14" height="14"><use href="#i-cap"/></svg><span>{t('land.mock.stat3')}</span></div>
                      <div className="mock-stat__val">87</div>
                      <div className="mock-stat__sub">{t('land.mock.stat3Sub')}</div>
                    </div>
                  </div>
                  <div className="mock-row">
                    <div className="mock-card">
                      <div className="mock-card__hdr"><span className="mock-card__title">{t('land.mock.classes')}</span><span className="mock-card__hdr-link">{t('land.mock.viewAll')}</span></div>
                      {[['09:00','land.mock.class1','CS401 · A3','L4'],['11:00','land.mock.class2','CS302 · B1','L3'],['14:00','land.mock.class3','CS303 · C2','L3']].map(([time,nameKey,meta,pill]) => (
                        <div key={time} className="mock-class">
                          <div className="mock-class__time">{time}</div>
                          <div><div className="mock-class__name">{t(nameKey)}</div><div className="mock-class__meta">{meta}</div></div>
                          <span className="mock-class__pill">{pill}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mock-card mock-ai">
                      <div className="mock-ai__icon"><svg width="20" height="20"><use href="#i-spark"/></svg></div>
                      <div className="mock-ai__title">{t('land.mock.ai')}</div>
                      <div className="mock-ai__sub">{t('land.mock.aiSub')}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Proof bar */}
        <section className="proof-bar">
          <div className="container">
            <div className="proof-bar__inner">
              {[['836','land.proof.l1'],['2,835','land.proof.l2'],['91%','land.proof.l3'],['4.7 / 5','land.proof.l4']].map(([num,lk]) => (
                <div key={lk} className="proof-item">
                  <div className="proof-item__num">{num}</div>
                  <div className="proof-item__lbl">{t(lk)}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="section" id="features">
          <div className="container">
            <div className="section__header reveal is-in">
              <div className="section__eyebrow">{t('land.feat.eyebrow')}</div>
              <h2 className="section__title">{t('land.feat.title')}</h2>
              <p className="section__sub">{t('land.feat.sub')}</p>
            </div>
            <div className="features">
              {FEATURES.map(f => (
                <div key={f.t} className="card feature reveal is-in">
                  <div className="feature__icon"><svg width="22" height="22"><use href={`#${f.icon}`}/></svg></div>
                  <h3 className="feature__title">{t(f.t)}</h3>
                  <p className="feature__desc">{t(f.d)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="section" id="how" style={{background:'var(--bg-subtle)'}}>
          <div className="container">
            <div className="section__header reveal is-in">
              <div className="section__eyebrow">{t('land.how.eyebrow')}</div>
              <h2 className="section__title">{t('land.how.title')}</h2>
              <p className="section__sub">{t('land.how.sub')}</p>
            </div>
            <div className="steps">
              {[1,2,3].map(i => (
                <div key={i} className="step reveal is-in">
                  <div className="step__num">{i}</div>
                  <h3 className="step__title">{t(`land.how.${i}.t`)}</h3>
                  <p className="step__desc">{t(`land.how.${i}.d`)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Majors */}
        <section className="section" id="majors">
          <div className="container">
            <div className="section__header reveal is-in">
              <div className="section__eyebrow">{t('land.maj.eyebrow')}</div>
              <h2 className="section__title">{t('land.maj.title')}</h2>
              <p className="section__sub">{t('land.maj.sub')}</p>
            </div>
            <div className="majors">
              {MAJORS.map(m => (
                <div key={m.n} className="card major-card reveal is-in">
                  <div className="major-card__icon"><svg width="20" height="20"><use href={`#${m.icon}`}/></svg></div>
                  <div className="major-card__name">{t(m.n)}</div>
                  <div className="major-card__meta">
                    <span><svg width="12" height="12"><use href="#i-book"/></svg> {m.courses} {t('land.maj.courses')}</span>
                    <span><svg width="12" height="12"><use href="#i-users"/></svg> {m.students}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="section" style={{background:'var(--bg-subtle)'}}>
          <div className="container">
            <div className="section__header reveal is-in">
              <div className="section__eyebrow">{t('land.test.eyebrow')}</div>
              <h2 className="section__title">{t('land.test.title')}</h2>
              <p className="section__sub">{t('land.test.sub')}</p>
            </div>
            <div className="testimonials">
              {TESTIMONIALS.map((tm, i) => (
                <div key={i} className="card testimonial reveal is-in">
                  <div className="testimonial__stars" aria-label="5 stars">
                    {[1,2,3,4,5].map(s => <svg key={s} width="14" height="14"><use href="#i-star"/></svg>)}
                  </div>
                  <p className="testimonial__quote">{t(tm.q)}</p>
                  <div className="testimonial__person">
                    <div className="testimonial__avatar" style={tm.color?{background:tm.color}:{}}>{tm.init}</div>
                    <div>
                      <div className="testimonial__name">{t(tm.n)}</div>
                      <div className="testimonial__role">{t(tm.r)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="section" id="faq">
          <div className="container">
            <div className="section__header reveal is-in">
              <div className="section__eyebrow">{t('land.faq.eyebrow')}</div>
              <h2 className="section__title">{t('land.faq.title')}</h2>
              <p className="section__sub">{t('land.faq.sub')}</p>
            </div>
            <div className="faq reveal is-in">
              {FAQS.map((fq, i) => (
                <div key={i} className={`faq-item${openFaq===i?' is-open':''}`} onClick={() => setOpenFaq(openFaq===i?-1:i)}>
                  <div className="faq-item__summary">
                    <span>{t(fq.q)}</span>
                    <span className="faq-item__chev"><svg width="16" height="16"><use href="#i-chev-r"/></svg></span>
                  </div>
                  {openFaq===i && <div className="faq-item__body">{t(fq.a)}</div>}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section">
          <div className="container reveal is-in">
            <div className="cta">
              <h2 className="cta__title">{t('land.cta.title')}</h2>
              <p className="cta__sub">{t('land.cta.sub')}</p>
              <button className="btn" onClick={onEnter}>
                <span>{t('land.cta.btn')}</span>
                <svg style={{width:14,height:14}}><use href="#i-arrow"/></svg>
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="land-footer">
        <div className="container">
          <div className="land-footer__grid">
            <div className="land-footer__brand">
              <div className="land-brand" style={{display:'flex',alignItems:'center',gap:'var(--s-3)'}}>
                <img src="/logo.svg" alt="Study Buddy Logo" style={{ height: '54px', width: 'auto', objectFit: 'contain' }} />
                <span className="land-brand__text" style={{ textAlign: 'start' }}>
                  <span className="land-brand__name">{t('brand.name')}</span>
                  <span className="land-brand__sub">{t('brand.sub')}</span>
                </span>
              </div>
              <p className="land-footer__about">{t('land.foot.about')}</p>
            </div>
            <div>
              <div className="land-footer__col-title">{t('land.foot.product')}</div>
              <div className="land-footer__links">
                <button type="button" onClick={() => showFooterInfo('features')}>{t('land.foot.features')}</button>
                <button type="button" onClick={() => showFooterInfo('how')}>{t('land.foot.how')}</button>
                <button type="button" onClick={() => showFooterInfo('majors')}>{t('land.foot.majors')}</button>
                <button type="button" onClick={onEnter}>{t('land.foot.signup')}</button>
              </div>
            </div>
            <div>
              <div className="land-footer__col-title">{t('land.foot.support')}</div>
              <div className="land-footer__links">
                <button type="button" onClick={() => showFooterInfo('faq')}>{t('land.foot.faq')}</button>
                <button type="button" onClick={() => showFooterInfo('help')}>{t('land.foot.help')}</button>
                <button type="button" onClick={() => showFooterInfo('contact')}>{t('land.foot.contact')}</button>
                <button type="button" onClick={() => setReportOpen(true)}>{t('land.foot.report')}</button>
              </div>
            </div>
            <div>
              <div className="land-footer__col-title">{t('land.foot.company')}</div>
              <div className="land-footer__links">
                <button type="button" onClick={() => showFooterInfo('about')}>{t('land.foot.about2')}</button>
                <button type="button" onClick={() => showFooterInfo('privacy')}>{t('land.foot.privacy')}</button>
                <button type="button" onClick={() => showFooterInfo('terms')}>{t('land.foot.terms')}</button>
              </div>
            </div>
          </div>
          <div className="land-footer__bottom">
            <div className="land-footer__copy">© 2026 Study Buddy · {t('land.foot.rights')}</div>
          </div>
        </div>
      </footer>

      {reportOpen && (
        <div className="land-modal-backdrop" onClick={() => !reportBusy && setReportOpen(false)}>
          <div className="land-info-modal land-report-modal" onClick={(e) => e.stopPropagation()}>
            <button className="land-info-modal__close" type="button" onClick={() => setReportOpen(false)} aria-label="Close" disabled={reportBusy}>×</button>
            <h3>{isAr ? 'الإبلاغ عن مشكلة' : 'Report an issue'}</h3>
            <p>{isAr ? 'اكتب المشكلة وسيتم حفظ البلاغ في قاعدة البيانات ليظهر للمدير في لوحة التحكم.' : 'Submit the issue and it will be saved in the database for admins to review.'}</p>
            <form className="report-form" onSubmit={submitReport}>
              <div className="report-form__grid">
                <label className="report-form__field">
                  <span>{isAr ? 'الاسم' : 'Name'}</span>
                  <input className="report-form__control" value={reportForm.name} onChange={(e) => updateReportField('name', e.target.value)} placeholder={isAr ? 'اختياري' : 'Optional'} />
                </label>
                <label className="report-form__field">
                  <span>{isAr ? 'البريد الإلكتروني' : 'Email'}</span>
                  <input className="report-form__control" type="email" dir="ltr" value={reportForm.email} onChange={(e) => updateReportField('email', e.target.value)} placeholder="student@university.edu" />
                </label>
              </div>
              <label className="report-form__field">
                <span>{isAr ? 'نوع البلاغ' : 'Category'}</span>
                <select className="report-form__control" value={reportForm.category} onChange={(e) => updateReportField('category', e.target.value)}>
                  <option value="bug">{isAr ? 'خلل تقني' : 'Bug'}</option>
                  <option value="content">{isAr ? 'مشكلة في المحتوى' : 'Content issue'}</option>
                  <option value="account">{isAr ? 'مشكلة في الحساب' : 'Account issue'}</option>
                  <option value="suggestion">{isAr ? 'اقتراح تحسين' : 'Suggestion'}</option>
                </select>
              </label>
              <label className="report-form__field">
                <span>{isAr ? 'عنوان المشكلة' : 'Subject'}</span>
                <input className="report-form__control" value={reportForm.subject} onChange={(e) => updateReportField('subject', e.target.value)} required minLength={3} />
              </label>
              <label className="report-form__field">
                <span>{isAr ? 'التفاصيل' : 'Details'}</span>
                <textarea className="report-form__control report-form__textarea" value={reportForm.message} onChange={(e) => updateReportField('message', e.target.value)} required minLength={10} rows={5} />
              </label>
              <button className="btn btn--primary btn--block" type="submit" disabled={reportBusy}>
                {reportBusy ? (isAr ? 'جاري الإرسال...' : 'Sending...') : (isAr ? 'إرسال البلاغ' : 'Submit report')}
              </button>
            </form>
          </div>
        </div>
      )}

      {footerInfo && (
        <div className="land-modal-backdrop" onClick={() => setFooterInfo(null)}>
          <div className="land-info-modal" onClick={(e) => e.stopPropagation()}>
            <button className="land-info-modal__close" type="button" onClick={() => setFooterInfo(null)} aria-label="Close">×</button>
            <h3>{footerInfo.title}</h3>
            <p>{footerInfo.body}</p>
            <button className="btn btn--accent" type="button" onClick={() => setFooterInfo(null)}>
              {isAr ? 'تم' : 'Done'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
