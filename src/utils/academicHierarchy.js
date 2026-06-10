const GENERAL_EN = 'General';
const GENERAL_AR = 'عام';

const clean = (value) => String(value || '').trim();
const keyFor = (...values) => values.map(clean).find(Boolean)?.toLowerCase() || GENERAL_EN.toLowerCase();

function splitDepartmentCollege(desc) {
  const value = clean(desc);
  if (!value) return null;
  const parts = value.split(/\s+[–—-]\s+/).map(clean).filter(Boolean);
  if (parts.length < 2) return null;
  return {
    department: parts[0],
    college: parts.slice(1).join(' - '),
  };
}

export function getMajorHierarchy(major) {
  const en = splitDepartmentCollege(major?.descEn);
  const ar = splitDepartmentCollege(major?.descAr);
  const departmentEn = clean(en?.department) || clean(ar?.department) || GENERAL_EN;
  const collegeEn = clean(en?.college) || clean(ar?.college) || GENERAL_EN;
  const departmentAr = clean(ar?.department) || clean(en?.department) || GENERAL_AR;
  const collegeAr = clean(ar?.college) || clean(en?.college) || GENERAL_AR;
  const isFallback = !en && !ar;

  return {
    departmentEn,
    departmentAr,
    departmentKey: isFallback ? 'general' : keyFor(departmentEn, departmentAr),
    collegeEn,
    collegeAr,
    collegeKey: isFallback ? 'general' : keyFor(collegeEn, collegeAr),
    isFallback,
  };
}

export function buildAcademicRows(majors = [], catalog = []) {
  const coursesByMajorId = new Map();
  for (const course of Array.isArray(catalog) ? catalog : []) {
    if (!course?.majorId) continue;
    const rows = coursesByMajorId.get(course.majorId) || [];
    rows.push(course);
    coursesByMajorId.set(course.majorId, rows);
  }

  return (Array.isArray(majors) ? majors : []).map((major) => {
    const catalogCourses = coursesByMajorId.get(major.id) || [];
    return {
      ...major,
      hierarchy: getMajorHierarchy(major),
      catalogCourses,
      courseCount: catalogCourses.length,
    };
  });
}

export function hasAcademicHierarchy(rows = []) {
  return rows.some((row) => !row.hierarchy?.isFallback);
}

function uniqueOptions(rows, type) {
  const map = new Map();
  for (const row of rows) {
    const hierarchy = row.hierarchy || getMajorHierarchy(row);
    const key = hierarchy[`${type}Key`];
    if (!key || map.has(key)) continue;
    map.set(key, {
      value: key,
      labelEn: hierarchy[`${type}En`],
      labelAr: hierarchy[`${type}Ar`],
    });
  }
  return Array.from(map.values()).sort((a, b) => a.labelEn.localeCompare(b.labelEn, 'ar'));
}

export function getCollegeOptions(rows = []) {
  return uniqueOptions(rows, 'college');
}

export function getDepartmentOptions(rows = [], selectedCollege = '') {
  const scopedRows = selectedCollege
    ? rows.filter((row) => row.hierarchy?.collegeKey === selectedCollege)
    : rows;
  return uniqueOptions(scopedRows, 'department');
}

export function getMajorOptions(rows = [], { college = '', department = '' } = {}) {
  return filterMajorRows(rows, { college, department }).map((row) => ({
    value: row.id,
    labelEn: row.nameEn,
    labelAr: row.nameAr,
  }));
}

export function filterMajorRows(rows = [], { college = '', department = '', search = '', isAr = false } = {}) {
  const query = clean(search).toLowerCase();
  return rows.filter((row) => {
    if (college && row.hierarchy?.collegeKey !== college) return false;
    if (department && row.hierarchy?.departmentKey !== department) return false;
    if (!query) return true;
    const fields = [row.nameEn, row.nameAr, row.descEn, row.descAr];
    return fields.some((field) => clean(field).toLowerCase().includes(query)) ||
      clean(isAr ? row.nameAr : row.nameEn).toLowerCase().includes(query);
  });
}

export function filterCatalogCourses(catalog = [], majorRows = [], filters = {}) {
  const {
    college = '',
    department = '',
    majorId = '',
    level = 'all',
    search = '',
  } = filters;
  const query = clean(search).toLowerCase();
  const majorById = new Map(majorRows.map((row) => [row.id, row]));

  return (Array.isArray(catalog) ? catalog : []).filter((course) => {
    const major = majorById.get(course.majorId);
    if (college && major?.hierarchy?.collegeKey !== college) return false;
    if (department && major?.hierarchy?.departmentKey !== department) return false;
    if (majorId && course.majorId !== majorId) return false;
    if (level !== 'all' && Number(course.level) !== Number(level)) return false;
    if (!query) return true;
    const fields = [course.code, course.nameEn, course.nameAr, course.instructor, major?.nameEn, major?.nameAr];
    return fields.some((field) => clean(field).toLowerCase().includes(query));
  });
}
