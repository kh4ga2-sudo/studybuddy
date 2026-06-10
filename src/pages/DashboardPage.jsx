import { useApp } from '../context/AppContext';

/* helpers */
const fmtTime = d => {
  const h = d.getHours(), m = d.getMinutes();
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
};

const daysLeft = (d, now) => Math.ceil((d - now) / 86400000);

export default function DashboardPage({ onAddCourse }) {
  const { state, setView, courses: COURSES, events: EVENTS, profile: PROFILE } = useApp();
  const isAr = state.lang === 'ar';
  const NOW = new Date();

  /* data */
  const firstName = (isAr ? PROFILE.nameAr : PROFILE.nameEn)?.split(/\s+/)[0] || '';

  const todayLectures = EVENTS
    .filter(e => {
      const d = e.start;
      return d.getFullYear() === NOW.getFullYear() &&
             d.getMonth()    === NOW.getMonth()    &&
             d.getDate()     === NOW.getDate()     &&
             e.type !== 'deadline';
    })
    .sort((a, b) => a.start - b.start);

  const upcomingDeadlines = EVENTS
    .filter(e => e.type === 'deadline' && e.start >= NOW)
    .sort((a, b) => a.start - b.start)
    .slice(0, 4);

  const totalCredits  = COURSES.reduce((s, c) => s + (c.credits || 0), 0);
  // Estimated schedule load: each course = ~3 lecture hours/week
  const weeklyStudy   = COURSES.length * 3;
  const studyLoadBars = weeklyStudy > 0
    ? [3, 5, 2, 7, 6, 4, weeklyStudy]
    : [0, 0, 0, 0, 0, 0, 0];
  const miniBarBase = Math.max(...studyLoadBars, 1);
  const miniBarHeight = (value) => {
    if (value <= 0) return '4px';
    const percentage = Math.round((value / miniBarBase) * 100);
    return `${Math.min(100, Math.max(12, percentage))}%`;
  };
  // Total study credits = all enrolled course credits
  const earnedCredits = totalCredits;

  /* today date label */
  const todayLabel = (() => {
    const days   = isAr
      ? ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت']
      : ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const months = isAr
      ? ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر']
      : ['January','February','March','April','May','June','July','August','September','October','November','December'];
    return `${days[NOW.getDay()]}، ${NOW.getDate()} ${months[NOW.getMonth()]} ${NOW.getFullYear()}`;
  })();

  /* greeting */
  const hour = NOW.getHours();
  const greeting = isAr
    ? (hour < 12 ? 'صباح الخير' : hour < 18 ? 'مساء الخير' : 'مساء النور')
    : (hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening');

  /* deadline urgency color */
  const deadlineColor = (dl) => {
    const days = daysLeft(dl.start, NOW);
    if (days <= 2)  return '#ef4444';
    if (days <= 5)  return '#8b5cf6';
    return '#3b82f6';
  };

  /* type label */
  const typeLabel = (type) => {
    if (!isAr) return type;
    const map = { deadline:'واجب', quiz:'اختبار', meeting:'اجتماع', project:'مشروع', exam:'امتحان' };
    return map[type] || type;
  };

  /* lecture status */
  const lectureStatus = (e) => {
    const start = e.start.getTime(), end = e.end?.getTime() || start + 3600000, now = NOW.getTime();
    if (now >= start && now <= end) return isAr ? 'جارية' : 'Live';
    if (now < start)               return isAr ? 'قادمة'  : 'Upcoming';
    return isAr ? 'انتهت' : 'Done';
  };

  const lectureStatusClass = (e) => {
    const start = e.start.getTime(), end = e.end?.getTime() || start + 3600000, now = NOW.getTime();
    if (now >= start && now <= end) return 'tag--live';
    if (now < start)               return 'tag--upcoming';
    return 'tag--done';
  };

  return (
    <div className="dash-wrap">

      {/* ══ Greeting ══ */}
      <div className="dash-greeting">
        <div className="dash-greeting__main">
          <h2 className="dash-greeting__title">
            {greeting}، {firstName}
          </h2>
          <p className="dash-greeting__sub">
            {isAr
              ? `لديك ${todayLectures.length} محاضرات اليوم${upcomingDeadlines.length ? `، و${upcomingDeadlines.length} موعد قادم` : ''}.`
              : `You have ${todayLectures.length} lectures today${upcomingDeadlines.length ? `, and ${upcomingDeadlines.length} upcoming deadline${upcomingDeadlines.length > 1 ? 's' : ''}` : ''}.`}
          </p>
          <div className="dash-greeting__actions">
            <div className="dash-semester-badge">
              <span className="dash-semester-dot" />
              {isAr ? `الفصل الثاني 2025م · المستوى ${PROFILE.year}` : `Semester 2 2025 · Level ${PROFILE.year}`}
            </div>
            <button className="btn btn--primary" onClick={onAddCourse}>
              <svg width="14" height="14"><use href="#icon-plus"/></svg>
              {isAr ? 'إضافة مادة' : 'Add Course'}
            </button>
          </div>
        </div>
      </div>

      {/* ══ Stats strip ══ */}
      <div className="dash-stats">
        <div className="dash-stat">
          <div className="dash-stat__icon"><svg width="18" height="18"><use href="#icon-book-open"/></svg></div>
          <div className="dash-stat__body">
            <span className="dash-stat__label">{isAr ? 'المواد المسجلة' : 'Enrolled Courses'}</span>
            <span className="dash-stat__value">{COURSES.length}</span>
            <span className="dash-stat__sub">{totalCredits} {isAr ? 'ساعة هذا الفصل' : 'hours this term'}</span>
          </div>
        </div>
        <div className="dash-stat">
          <div className="dash-stat__icon"><svg width="18" height="18"><use href="#icon-award"/></svg></div>
          <div className="dash-stat__body">
            <span className="dash-stat__label">{isAr ? 'الساعات المسجلة' : 'Registered Hours'}</span>
            <span className="dash-stat__value">{earnedCredits}</span>
            <span className="dash-stat__sub dash-stat__sub--up">
              {isAr ? `${totalCredits} هذا الفصل · من أصل 132` : `${totalCredits} this term · of 132`}
            </span>
          </div>
        </div>
        <div className="dash-stat">
          <div className="dash-stat__icon"><svg width="18" height="18"><use href="#icon-trending-up"/></svg></div>
          <div className="dash-stat__body">
            <span className="dash-stat__label">{isAr ? 'المعدل التراكمي' : 'Cumulative GPA'}</span>
            <span className="dash-stat__value">{PROFILE.gpa || '0.00'}</span>
            <span className="dash-stat__sub dash-stat__sub--up">
              {isAr ? '↑ 0.12 مقارنة بالفصل السابق' : '↑ 0.12 vs last semester'}
            </span>
          </div>
        </div>
        <div className="dash-stat">
          <div className="dash-stat__icon"><svg width="18" height="18"><use href="#icon-clock"/></svg></div>
          <div className="dash-stat__body">
            <span className="dash-stat__label">{isAr ? 'وقت الدراسة التقديري' : 'Estimated Study Load'}</span>
            <span className="dash-stat__value">{weeklyStudy}h</span>
            <div className="dash-mini-bars">
              {studyLoadBars.map((v,i) => (
                <div
                  key={i}
                  className={`dash-mini-bar${i===6?' is-active':''}`}
                  style={{ height: miniBarHeight(v) }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══ Two-column grid ══ */}
      <div className="dash-grid">

        {/* ── LEFT column ── */}
        <div className="dash-col">

          {/* Upcoming deadlines */}
          <div className="card dash-card">
            <div className="card__header">
              <div>
                <h3 className="card__title">{isAr ? 'المواعيد القادمة' : 'Upcoming Deadlines'}</h3>
                <p className="card__sub">{upcomingDeadlines.length} {isAr ? 'مهام نشطة' : 'active tasks'}</p>
              </div>
              <button className="btn btn--ghost btn--sm" onClick={() => setView('calendar')}>
                {isAr ? 'عرض الكل' : 'View all'}
              </button>
            </div>
            <div className="dash-deadlines">
              {upcomingDeadlines.length === 0 ? (
                <p className="dash-empty">{isAr ? 'لا توجد مواعيد قادمة' : 'No upcoming deadlines'}</p>
              ) : upcomingDeadlines.map(dl => {
                const days = daysLeft(dl.start, NOW);
                const color = deadlineColor(dl);
                return (
                  <div key={dl.id} className="dash-dl" style={{ '--dl-color': color }}>
                    <div className="dash-dl__bar" />
                    <div className="dash-dl__body">
                      <span className="dash-dl__title">{isAr ? dl.titleAr : dl.titleEn}</span>
                      <div className="dash-dl__foot">
                        <span className={`tag ${days <= 2 ? 'tag--urgent' : 'tag--default'}`}>
                          {days <= 2 ? (isAr ? 'عاجل' : 'Urgent') : typeLabel(dl.type)}
                        </span>
                        <span className="dash-dl__days">
                          {days} {isAr ? 'أيام' : 'days'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent activity */}
          <div className="card dash-card">
            <div className="card__header">
              <h3 className="card__title">{isAr ? 'النشاط الأخير' : 'Recent Activity'}</h3>
            </div>
            <ul className="dash-activity">
              {[
                { icon: 'file-text', ar: 'رُفع اختبار جديد في نظم التشغيل', en: 'New quiz uploaded for OS', time: '2h ago' },
                { icon: 'book-open', ar: 'أُضيف ملخص لـ قواعد البيانات',    en: 'Summary added for Databases', time: '5h ago' },
                { icon: 'layers',   ar: 'تحديث سلايدات هندسة البرمجيات',    en: 'SE slides updated', time: '1d ago' },
              ].map((a, i) => (
                <li key={i} className="dash-activity__item">
                  <div className="dash-activity__icon">
                    <svg width="14" height="14"><use href={`#icon-${a.icon}`}/></svg>
                  </div>
                  <div className="dash-activity__body">
                    <span className="dash-activity__text">{isAr ? a.ar : a.en}</span>
                    <span className="dash-activity__time">{a.time}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* AI strip */}
          <div className="dash-ai-card">
            <div className="dash-ai-card__left">
              <div className="dash-ai-card__icon">
                <svg width="22" height="22"><use href="#icon-zap"/></svg>
              </div>
              <div>
                <div className="dash-ai-card__title">{isAr ? 'المساعد الذكي' : 'AI Assistant'}</div>
                <div className="dash-ai-card__desc">{isAr ? 'ملخصات، أسئلة، وإجابات لمواد.' : 'Summaries, quizzes, and answers.'}</div>
              </div>
            </div>
            <button className="dash-ai-card__btn" onClick={() => setView('ai')}>
              {isAr ? 'فتح' : 'Open'} →
            </button>
          </div>
        </div>

        {/* ── RIGHT column ── */}
        <div className="dash-col">

          {/* Today's lectures */}
          <div className="card dash-card">
            <div className="card__header">
              <div>
                <h3 className="card__title">{isAr ? 'محاضرات اليوم' : "Today's Lectures"}</h3>
                <p className="card__sub">{todayLabel}</p>
              </div>
              <button className="btn btn--ghost btn--sm" onClick={() => setView('calendar')}>
                {isAr ? 'عرض الكل' : 'View all'}
              </button>
            </div>
            <div className="dash-lectures">
              {todayLectures.length === 0 ? (
                <p className="dash-empty">{isAr ? 'لا توجد محاضرات اليوم' : 'No lectures today'}</p>
              ) : todayLectures.map(e => {
                return (
                  <div key={e.id} className="dash-lec">
                    <span className="dash-lec__time">{fmtTime(e.start)}</span>
                    <div className="dash-lec__body">
                      <span className="dash-lec__name">{isAr ? e.titleAr : e.titleEn}</span>
                      <span className="dash-lec__meta">{isAr ? e.host : e.hostEn}</span>
                    </div>
                    <span className={`tag ${lectureStatusClass(e)}`}>{lectureStatus(e)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick access */}
          <div className="card dash-card">
            <div className="card__header">
              <h3 className="card__title">{isAr ? 'وصول سريع' : 'Quick Access'}</h3>
            </div>
            <div className="dash-quick">
              <button className="dash-quick__tile" onClick={() => setView('courses')}>
                <svg width="22" height="22"><use href="#icon-book-open"/></svg>
                <span className="dash-quick__name">{isAr ? 'المواد' : 'Courses'}</span>
                <span className="dash-quick__desc">{isAr ? 'تصفح جميع موادك الدراسية' : 'Browse your courses'}</span>
              </button>
              <button className="dash-quick__tile" onClick={onAddCourse}>
                <svg width="22" height="22"><use href="#icon-plus"/></svg>
                <span className="dash-quick__name">{isAr ? 'إضافة مادة' : 'Add Course'}</span>
                <span className="dash-quick__desc">{isAr ? 'ابحث في فهرس المواد' : 'Browse the catalog'}</span>
              </button>
              <button className="dash-quick__tile" onClick={() => setView('calendar')}>
                <svg width="22" height="22"><use href="#icon-calendar"/></svg>
                <span className="dash-quick__name">{isAr ? 'التقويم' : 'Calendar'}</span>
                <span className="dash-quick__desc">{isAr ? 'المحاضرات والمواعيد' : 'Events & deadlines'}</span>
              </button>
              <button className="dash-quick__tile" onClick={() => setView('majors')}>
                <svg width="22" height="22"><use href="#icon-layers"/></svg>
                <span className="dash-quick__name">{isAr ? 'التخصصات' : 'Majors'}</span>
                <span className="dash-quick__desc">{isAr ? 'استكشف خطط التخصصات' : 'Explore majors'}</span>
              </button>
              <button className="dash-quick__tile" onClick={() => setView('ai')}>
                <svg width="22" height="22"><use href="#icon-zap"/></svg>
                <span className="dash-quick__name">{isAr ? 'المساعد الذكي' : 'AI Assistant'}</span>
                <span className="dash-quick__desc">{isAr ? 'ملخصات، أسئلة وإجابات' : 'Summaries & quizzes'}</span>
              </button>
            </div>
          </div>

          {/* Analytics */}
          <div className="card dash-card">
            <div className="card__header">
              <div>
                <h3 className="card__title">{isAr ? 'التحليلات' : 'Analytics'}</h3>
                <p className="card__sub">{isAr ? 'نظرة سريعة على أدائك' : 'A quick look at your performance'}</p>
              </div>
            </div>
            <div className="dash-analytics">
              <div className="dash-analytics__cell">
                <span className="dash-analytics__lbl">{isAr ? 'وقت الدراسة' : 'Study Time'}</span>
                <span className="dash-analytics__val">{weeklyStudy * 4}h</span>
                <span className="dash-analytics__sub">{isAr ? 'هذا الشهر' : 'this month'}</span>
                <div className="dash-mini-bars" style={{ marginTop: 8 }}>
                  {[1,2,1,3,2,1,weeklyStudy > 0 ? 3 : 0].map((v,i) => (
                    <div key={i} className={`dash-mini-bar${i===6?' is-active':''}`} style={{ height: weeklyStudy > 0 ? `${Math.round(v/3*100)}%` : '4px' }} />
                  ))}
                </div>
              </div>
              <div className="dash-analytics__cell">
                <span className="dash-analytics__lbl">{isAr ? 'الأداء' : 'Performance'}</span>
                <span className="dash-analytics__val">{PROFILE.gpa ? Math.round((parseFloat(PROFILE.gpa)/4)*100) : 0}%</span>
                <span className="dash-analytics__sub">{isAr ? `المستوى ${PROFILE.year}` : `Level ${PROFILE.year}`}</span>
                <div className="dash-progress" style={{ marginTop: 8 }}>
                  <div className="dash-progress__fill" style={{ width: `${PROFILE.gpa ? Math.round((parseFloat(PROFILE.gpa)/4)*100) : 0}%` }} />
                </div>
              </div>
              <div className="dash-analytics__cell">
                <span className="dash-analytics__lbl">{isAr ? 'المواعيد القادمة' : 'Upcoming'}</span>
                <span className="dash-analytics__val">{upcomingDeadlines.length}</span>
                <span className="dash-analytics__sub">{isAr ? 'خلال 14 يوم' : 'in 14 days'}</span>
                <div className="dash-day-chips">
                  {upcomingDeadlines.slice(0,3).map(dl => {
                    const d = daysLeft(dl.start, NOW);
                    return (
                      <span key={dl.id} className={`dash-day-chip${d <= 2 ? ' is-urgent' : ''}`}>
                        {d} {isAr ? 'أيام' : 'd'}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
