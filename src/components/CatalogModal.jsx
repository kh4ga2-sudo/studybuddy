import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  buildAcademicRows,
  filterCatalogCourses,
  getCollegeOptions,
  getDepartmentOptions,
  getMajorOptions,
  hasAcademicHierarchy,
} from '../utils/academicHierarchy';
import * as api from '../api';

export default function CatalogModal({ open, onClose }) {
  const { state, t, toast, catalog: CATALOG, courses: COURSES, majors: MAJORS, loadUserData } = useApp();
  const isAr = state.lang === 'ar';
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [collegeFilter, setCollegeFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [majorFilter, setMajorFilter] = useState('');

  const enrolledIds = useMemo(() => new Set(COURSES.map(c => c.id)), [COURSES]);
  const majorRows = useMemo(() => buildAcademicRows(MAJORS, CATALOG), [MAJORS, CATALOG]);
  const hasHierarchy = useMemo(() => hasAcademicHierarchy(majorRows), [majorRows]);
  const collegeOptions = useMemo(() => getCollegeOptions(majorRows), [majorRows]);
  const departmentOptions = useMemo(
    () => (collegeFilter ? getDepartmentOptions(majorRows, collegeFilter) : []),
    [majorRows, collegeFilter]
  );
  const majorOptions = useMemo(
    () => (collegeFilter && departmentFilter ? getMajorOptions(majorRows, { college: collegeFilter, department: departmentFilter }) : []),
    [majorRows, collegeFilter, departmentFilter]
  );

  const canShowHierarchyResults = !hasHierarchy || Boolean(collegeFilter) || Boolean(search.trim());

  const filtered = useMemo(() => {
    if (!canShowHierarchyResults) return [];
    return filterCatalogCourses(CATALOG, majorRows, {
      college: hasHierarchy ? collegeFilter : '',
      department: hasHierarchy ? departmentFilter : '',
      majorId: hasHierarchy ? majorFilter : '',
      level: levelFilter,
      search,
    });
  }, [CATALOG, majorRows, hasHierarchy, collegeFilter, departmentFilter, majorFilter, levelFilter, search, canShowHierarchyResults]);

  const label = (option) => (isAr ? option.labelAr : option.labelEn);
  const filterCopy = {
    college: isAr ? 'الكلية' : 'College',
    department: isAr ? 'القسم' : 'Department',
    major: isAr ? 'التخصص' : 'Major',
    allColleges: isAr ? '— اختر الكلية —' : '— Select College —',
    allDepartments: isAr ? '— اختر القسم —' : '— Select Department —',
    allMajors: isAr ? '— كل التخصصات —' : '— All Majors —',
    chooseCollege: isAr ? 'اختر كلية أو ابحث باسم/رمز المقرر لعرض النتائج.' : 'Select a college or search by course name/code to show results.',
  };

  const changeCollege = (value) => {
    setCollegeFilter(value);
    setDepartmentFilter('');
    setMajorFilter('');
  };

  const changeDepartment = (value) => {
    setDepartmentFilter(value);
    setMajorFilter('');
  };

  const handleAdd = async (course) => {
    try {
      await api.enrollCourse(course.id);
      await loadUserData();
      toast(t('toast.course.added') || (isAr ? 'تمت إضافة المقرر' : 'Course added successfully'), 'success');
    } catch (err) {
      toast(err.message || (isAr ? 'خطأ في إضافة المقرر' : 'Failed to add course'), 'warning');
    }
  };

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal modal--wide catalog-modal">
        <header className="modal__header">
          <h3 className="modal__title">{t('catalog.title')}</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <svg width="16" height="16"><use href="#icon-x"/></svg>
          </button>
        </header>
        <div className="modal__body">
          <div className="catalog-toolbar">
            <div className="search">
              <svg width="14" height="14"><use href="#icon-search"/></svg>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={t('catalog.search')}
              />
            </div>

            {hasHierarchy && (
              <div className="hierarchy-filters catalog-hierarchy-filters">
                <label className="hierarchy-filter-field">
                  <span>{filterCopy.college}</span>
                  <select className="select" value={collegeFilter} onChange={(e) => changeCollege(e.target.value)}>
                    <option value="">{filterCopy.allColleges}</option>
                    {collegeOptions.map((option) => (
                      <option key={option.value} value={option.value}>{label(option)}</option>
                    ))}
                  </select>
                </label>
                <label className="hierarchy-filter-field">
                  <span>{filterCopy.department}</span>
                  <select className="select" value={departmentFilter} onChange={(e) => changeDepartment(e.target.value)} disabled={!collegeFilter}>
                    <option value="">{filterCopy.allDepartments}</option>
                    {departmentOptions.map((option) => (
                      <option key={option.value} value={option.value}>{label(option)}</option>
                    ))}
                  </select>
                </label>
                <label className="hierarchy-filter-field">
                  <span>{filterCopy.major}</span>
                  <select className="select" value={majorFilter} onChange={(e) => setMajorFilter(e.target.value)} disabled={!departmentFilter}>
                    <option value="">{filterCopy.allMajors}</option>
                    {majorOptions.map((option) => (
                      <option key={option.value} value={option.value}>{label(option)}</option>
                    ))}
                  </select>
                </label>
              </div>
            )}

            <div className="filter-chips">
              {['all', 100, 200, 300, 400].map(l => (
                <button
                  key={l}
                  className={`filter-chip${levelFilter === l ? ' is-active' : ''}`}
                  onClick={() => setLevelFilter(l)}
                >
                  {l === 'all' ? t('catalog.filter.all') : t(`catalog.filter.${l}`)}
                </button>
              ))}
            </div>
          </div>

          <div className="catalog-list">
            {!canShowHierarchyResults && (
              <div className="empty-state hierarchy-help">{filterCopy.chooseCollege}</div>
            )}
            {filtered.map(c => {
              const added = enrolledIds.has(c.id);
              return (
                <div key={c.id} className="catalog-row">
                  <div className="catalog-row__main">
                    <div className="catalog-row__code">{c.code}</div>
                    <div className="catalog-row__name">{isAr ? c.nameAr : c.nameEn}</div>
                    <div className="catalog-row__meta">
                      {c.instructor} · {c.credits} {t('courses.credits')} · {c.students} {isAr ? 'طالب' : 'students'}
                    </div>
                  </div>
                  <button
                    className={`btn ${added ? 'btn--ghost' : 'btn--primary'} btn--sm`}
                    disabled={added}
                    onClick={() => handleAdd(c)}
                  >
                    {added ? (<>
                      <svg width="12" height="12"><use href="#icon-check"/></svg> {t('catalog.added')}
                    </>) : (<>
                      <svg width="12" height="12"><use href="#icon-plus"/></svg> {t('catalog.add')}
                    </>)}
                  </button>
                </div>
              );
            })}
            {canShowHierarchyResults && filtered.length === 0 && (
              <div className="empty-state">{isAr ? 'لا توجد نتائج' : 'No results'}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
