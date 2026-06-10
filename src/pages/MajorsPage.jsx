import { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  buildAcademicRows,
  filterMajorRows,
  getCollegeOptions,
  getDepartmentOptions,
  hasAcademicHierarchy,
} from '../utils/academicHierarchy';

export default function MajorsPage() {
  const { state, t, setView, setState, majors: MAJORS, catalog: CATALOG } = useApp();
  const isAr = state.lang === 'ar';
  const [collegeFilter, setCollegeFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [search, setSearch] = useState('');

  const majorRows = useMemo(() => buildAcademicRows(MAJORS, CATALOG), [MAJORS, CATALOG]);
  const hasHierarchy = useMemo(() => hasAcademicHierarchy(majorRows), [majorRows]);
  const collegeOptions = useMemo(() => getCollegeOptions(majorRows), [majorRows]);
  const departmentOptions = useMemo(
    () => (collegeFilter ? getDepartmentOptions(majorRows, collegeFilter) : []),
    [majorRows, collegeFilter]
  );
  const canShowHierarchyResults = !hasHierarchy || Boolean(collegeFilter) || Boolean(search.trim());
  const filteredMajors = useMemo(() => {
    if (!canShowHierarchyResults) return [];
    return filterMajorRows(majorRows, {
      college: hasHierarchy ? collegeFilter : '',
      department: hasHierarchy ? departmentFilter : '',
      search,
      isAr,
    });
  }, [majorRows, hasHierarchy, collegeFilter, departmentFilter, search, isAr, canShowHierarchyResults]);

  const label = (option) => (isAr ? option.labelAr : option.labelEn);
  const copy = {
    college: isAr ? 'الكلية' : 'College',
    department: isAr ? 'القسم' : 'Department',
    allColleges: isAr ? '— اختر الكلية —' : '— Select College —',
    allDepartments: isAr ? '— كل الأقسام —' : '— All Departments —',
    search: isAr ? 'ابحث عن تخصص' : 'Search majors',
    chooseCollege: isAr ? 'اختر كلية أو ابحث باسم التخصص لعرض النتائج.' : 'Select a college or search by major name to show results.',
  };

  const openMajor = (id) => {
    setState(p => ({ ...p, selectedMajorId: id }));
    setView('major-detail');
  };

  const changeCollege = (value) => {
    setCollegeFilter(value);
    setDepartmentFilter('');
  };

  return (
    <>
      <div className="page__header">
        <div>
          <h2 className="page__title">{t('majors.title')}</h2>
          <p className="page__sub">{t('majors.explore')}</p>
        </div>
      </div>

      {hasHierarchy && (
        <div className="majors-toolbar">
          <div className="search majors-search">
            <svg width="14" height="14"><use href="#icon-search"/></svg>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={copy.search} />
          </div>
          <div className="hierarchy-filters majors-hierarchy-filters">
            <label className="hierarchy-filter-field">
              <span>{copy.college}</span>
              <select className="select" value={collegeFilter} onChange={(e) => changeCollege(e.target.value)}>
                <option value="">{copy.allColleges}</option>
                {collegeOptions.map((option) => (
                  <option key={option.value} value={option.value}>{label(option)}</option>
                ))}
              </select>
            </label>
            <label className="hierarchy-filter-field">
              <span>{copy.department}</span>
              <select className="select" value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)} disabled={!collegeFilter}>
                <option value="">{copy.allDepartments}</option>
                {departmentOptions.map((option) => (
                  <option key={option.value} value={option.value}>{label(option)}</option>
                ))}
              </select>
            </label>
          </div>
        </div>
      )}

      {!canShowHierarchyResults && (
        <div className="empty-state hierarchy-help">{copy.chooseCollege}</div>
      )}

      {canShowHierarchyResults && filteredMajors.length === 0 && (
        <div className="empty-state">{isAr ? 'لا توجد تخصصات مطابقة' : 'No matching majors'}</div>
      )}

      {filteredMajors.length > 0 && (
        <div className="majors-grid">
          {filteredMajors.map(m => {
            const courseCount = m.courseCount || CATALOG.filter(c => c.majorId === m.id).length;
            return (
              <button key={m.id} className="major-card" onClick={() => openMajor(m.id)}>
                <div className="major-card__icon"><svg width="24" height="24"><use href={`#icon-${m.icon}`}/></svg></div>
                <h3 className="major-card__name">{isAr ? m.nameAr : m.nameEn}</h3>
                <p className="major-card__desc">{isAr ? m.descAr : m.descEn}</p>
                <div className="major-card__stats">
                  <div className="major-card__stat"><span className="mono">{courseCount}</span> {t('majors.courses')}</div>
                  <div className="major-card__stat"><span className="mono">{m.credits}</span> {t('majors.credits')}</div>
                  <div className="major-card__stat"><span className="mono">{m.students}</span> {t('majors.enrolled')}</div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </>
  );
}
