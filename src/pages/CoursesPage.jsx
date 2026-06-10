import { useMemo } from 'react';
import { useApp } from '../context/AppContext';

export default function CoursesPage({ onAddCourse }) {
  const { state, setState, t, setView, courses: COURSES } = useApp();
  const isAr = state.lang === 'ar';

  const filtered = useMemo(() => {
    const f = state.filterProgress;
    if (!f || f === 'all') return COURSES;
    return COURSES.filter(c => c.status === f);
  }, [state.filterProgress, COURSES]);

  const openCourse = (course) => {
    setState(p => ({
      ...p,
      selectedCourseId: course.id,
      courseDetailFrom: 'courses',
      detailTab: 'overview',
    }));
    setView('course-detail');
  };

  const filters = ['all', 'inprogress', 'completed', 'upcoming'];

  const statusLabel = (status) => {
    const labels = {
      inprogress: isAr ? 'جارية' : 'In Progress',
      completed: isAr ? 'مكتملة' : 'Completed',
      upcoming: isAr ? 'قادمة' : 'Upcoming',
    };
    return labels[status] || status;
  };

  return (
    <>
      <div className="page__header">
        <div>
          <h2 className="page__title">{t('courses.title')}</h2>
          <p className="page__sub">{COURSES.length} {t('courses.enrolled')}</p>
        </div>
        <button className="btn btn--primary" onClick={onAddCourse}>
          <svg width="14" height="14"><use href="#icon-plus"/></svg> {t('courses.add')}
        </button>
      </div>

      <div className="course-toolbar">
        {filters.map(f => (
          <button
            key={f}
            className={`filter-chip${(state.filterProgress || 'all') === f ? ' is-active' : ''}`}
            onClick={() => setState(p => ({...p, filterProgress: f}))}
          >
            {t(`courses.filter.${f}`)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <svg><use href="#icon-inbox"/></svg>
          <p>{t('courses.empty')}</p>
        </div>
      ) : (
        <div className="course-grid">
          {filtered.map(c => (
            <button key={c.id} className="course-card" onClick={() => openCourse(c)}>
              <div className="course-card__head">
                <div>
                  <div className="course-card__code">{c.code}</div>
                  <h4 className="course-card__name">{isAr ? c.nameAr : c.nameEn}</h4>
                </div>
                <span className={`tag tag--${c.status || 'default'}`}>{statusLabel(c.status)}</span>
              </div>
              <div className="course-card__instr">
                <svg width="13" height="13"><use href="#icon-user"/></svg>
                {c.instructor}
              </div>
              <div className="course-card__meta-line">
                <span>{c.credits} {t('courses.credits')}</span>
                {c.level && <span>{isAr ? 'المستوى' : 'Level'} {c.level}</span>}
              </div>
              <div className="course-card__progress">
                <div className="course-card__progress-head">
                  <span>{t('courses.progress')}</span>
                  <span className="mono">{c.progress}%</span>
                </div>
                <div className="progress-bar"><span style={{width:`${c.progress}%`}}/></div>
              </div>
              <div className="course-card__foot">
                {c.grade && <span className="course-card__grade">{t('courses.grade')}: <b>{c.grade}</b></span>}
                {c.nextClass && <span className="course-card__next">{t('courses.next')}: {c.nextClass}</span>}
              </div>
            </button>
          ))}
        </div>
      )}
    </>
  );
}
