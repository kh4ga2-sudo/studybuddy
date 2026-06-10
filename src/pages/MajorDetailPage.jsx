import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';

export default function MajorDetailPage() {
  const { state, t, setView, setState, majors: MAJORS, catalog: CATALOG, courses: COURSES } = useApp();
  const isAr = state.lang === 'ar';
  const major = MAJORS.find(m => m.id === state.selectedMajorId) || MAJORS[0];

  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('all'); // 'all' | 100 | 200 | 300 | 400

  const majorCourses = useMemo(() => {
    return CATALOG.filter(c => c.majorId === major.id);
  }, [major.id]);

  const filtered = useMemo(() => {
    return majorCourses.filter(c => {
      if (levelFilter !== 'all' && c.level !== levelFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return c.code.toLowerCase().includes(q) || c.nameEn.toLowerCase().includes(q) || c.nameAr.includes(search);
      }
      return true;
    });
  }, [majorCourses, search, levelFilter]);

  const enrolledIds = new Set(COURSES.map(c => c.id));
  const grouped = useMemo(() => {
    const g = {};
    filtered.forEach(c => { (g[c.level] = g[c.level] || []).push(c); });
    return g;
  }, [filtered]);

  const openCourse = (catalogCourse) => {
    // If enrolled, navigate to course detail
    const enrolled = COURSES.find(c => c.code === catalogCourse.code);
    if (enrolled) {
      setState(p => ({ ...p, selectedCourseId: enrolled.id, courseDetailFrom: 'major', detailTab: 'overview' }));
      setView('course-detail');
    }
  };

  return (
    <div id="page-major">
      <div className="major-hero">
        <button className="major-hero__back" onClick={() => setView('majors')}>
          <svg><use href="#icon-arrow-left"/></svg>
          {t('course.back')}
        </button>
        <div className="major-hero__head">
          <div className="major-hero__icon"><svg><use href={`#icon-${major.icon}`}/></svg></div>
          <div className="major-hero__head-text">
            <h2 className="major-hero__name">{isAr ? major.nameAr : major.nameEn}</h2>
            <p className="major-hero__desc">{isAr ? major.descAr : major.descEn}</p>
          </div>
        </div>
        <div className="major-hero__stats">
          <div className="major-hero__stat">
            <div className="major-hero__stat-label">{t('majors.courses')}</div>
            <div className="major-hero__stat-value mono">{major.courses}</div>
          </div>
          <div className="major-hero__stat">
            <div className="major-hero__stat-label">{t('majors.credits')}</div>
            <div className="major-hero__stat-value mono">{major.credits}</div>
          </div>
          <div className="major-hero__stat">
            <div className="major-hero__stat-label">{t('majors.enrolled')}</div>
            <div className="major-hero__stat-value mono">{major.students}</div>
          </div>
          <div className="major-hero__stat">
            <div className="major-hero__stat-label">{isAr ? 'مسجّل أنت' : 'You Enrolled'}</div>
            <div className="major-hero__stat-value mono">{majorCourses.filter(c => enrolledIds.has(c.id) || COURSES.some(co => co.code === c.code)).length}</div>
          </div>
        </div>
      </div>

      <div className="major-toolbar">
        <div className="search" style={{flex:'1', maxWidth:280}}>
          <svg><use href="#icon-search"/></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={isAr ? 'ابحث عن مقرر...' : 'Search courses...'} />
        </div>
        {['all', 100, 200, 300, 400].map(l => (
          <button
            key={l}
            className={`filter-chip${levelFilter === l ? ' is-active' : ''}`}
            onClick={() => setLevelFilter(l)}
          >
            {l === 'all' ? t('catalog.filter.all') : `${l}${isAr ? '' : 's'}`}
          </button>
        ))}
      </div>

      <div className="major-courses">
        {[100, 200, 300, 400].map(level => {
          const items = grouped[level];
          if (!items || items.length === 0) return null;
          return (
            <div key={level} className="mj-level-group">
              <div className="mj-level-group__head">
                <div className="mj-level-group__title">
                  <svg width="14" height="14"><use href="#icon-layers"/></svg>
                  {isAr ? `المستوى ${level}` : `${level} Level`}
                </div>
                <div className="mj-level-group__count">{items.length} {isAr ? 'مقررات' : 'courses'}</div>
              </div>
              <div className="mj-course-grid">
                {items.map(c => {
                  const isEnrolled = COURSES.some(co => co.code === c.code);
                  return (
                    <button key={c.id} className="mj-course-card" onClick={() => openCourse(c)}>
                      <div className="mj-course-card__head">
                        <div>
                          <div className="mj-course-card__code">{c.code}</div>
                          <div className="mj-course-card__name">{isAr ? c.nameAr : c.nameEn}</div>
                        </div>
                        {isEnrolled && (
                          <div className="mj-course-card__pill"><svg><use href="#icon-check"/></svg> {isAr ? 'مسجّل' : 'Enrolled'}</div>
                        )}
                      </div>
                      <div className="mj-course-card__instr">
                        <div className="mj-course-card__avatar">{c.instructor.split(' ').map(w => w[0]).slice(-2).join('')}</div>
                        {c.instructor}
                      </div>
                      <div className="mj-course-card__foot">
                        <div className="mj-course-card__meta">
                          <span><svg><use href="#icon-clock"/></svg>{c.credits} {t('courses.credits')}</span>
                          <span><svg><use href="#icon-users"/></svg>{c.students}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
