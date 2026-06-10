import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import * as api from '../api';

export default function AdminPage() {
  const { state, t, toast, majors } = useApp();
  const isAr = state.lang === 'ar';
  
  const [activeTab, setActiveTab] = useState('courses'); // 'courses' | 'materials' | 'reports'
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState([]);
  const [reportStatus, setReportStatus] = useState('all');

  // Modals state
  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null); // null means adding
  const [courseForm, setCourseForm] = useState({
    id: '', code: '', nameEn: '', nameAr: '', majorId: 'hci', credits: 3, level: 100, instructor: ''
  });

  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [materials, setMaterials] = useState([]);
  const [materialModalOpen, setMaterialModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null); // null means adding
  const [materialForm, setMaterialForm] = useState({
    id: '', category: 'exams', title: '', titleAr: '', date: '', extra: {}
  });

  // Load Admin Catalog
  const loadAdminCatalog = async () => {
    setLoading(true);
    try {
      const data = await api.adminGetCatalog();
      setCatalog(data);
      if (data.length > 0 && !selectedCourseId) {
        setSelectedCourseId(data[0].id);
      }
    } catch (err) {
      toast(err.message || 'Failed to load catalog', 'warning');
    } finally {
      setLoading(false);
    }
  };

  // Load Course Materials
  const loadCourseMaterials = async (courseId) => {
    if (!courseId) return;
    try {
      const data = await api.adminGetMaterials(courseId);
      setMaterials(data);
    } catch (err) {
      toast(err.message || 'Failed to load materials', 'warning');
    }
  };

  useEffect(() => {
    loadAdminCatalog();
  }, []);

  useEffect(() => {
    if (selectedCourseId && activeTab === 'materials') {
      loadCourseMaterials(selectedCourseId);
    }
    if (activeTab === 'reports') {
      loadReports(reportStatus);
    }
  }, [selectedCourseId, activeTab, reportStatus]);

  const loadReports = async (status = reportStatus) => {
    try {
      const data = await api.adminGetReports(status);
      setReports(data);
    } catch (err) {
      toast(err.message || 'Failed to load reports', 'warning');
    }
  };

  const handleUpdateReport = async (id, data) => {
    try {
      await api.adminUpdateReport(id, data);
      toast(isAr ? 'تم تحديث البلاغ' : 'Report updated', 'success');
      loadReports(reportStatus);
    } catch (err) {
      toast(err.message || 'Failed to update report', 'warning');
    }
  };

  // Course Actions
  const handleOpenAddCourse = () => {
    setEditingCourse(null);
    setCourseForm({
      id: 'cat' + Date.now(),
      code: '',
      nameEn: '',
      nameAr: '',
      majorId: majors[0]?.id || 'hci',
      credits: 3,
      level: 100,
      instructor: ''
    });
    setCourseModalOpen(true);
  };

  const handleOpenEditCourse = (course) => {
    setEditingCourse(course);
    setCourseForm({
      id: course.id,
      code: course.code,
      nameEn: course.name_en,
      nameAr: course.name_ar,
      majorId: course.major_id,
      credits: course.credits,
      level: course.level,
      instructor: course.instructor || ''
    });
    setCourseModalOpen(true);
  };

  const handleSaveCourse = async (e) => {
    e.preventDefault();
    if (!courseForm.code || !courseForm.nameEn || !courseForm.nameAr) {
      toast(isAr ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields', 'warning');
      return;
    }
    try {
      if (editingCourse) {
        await api.adminUpdateCourse(editingCourse.id, {
          code: courseForm.code,
          name_en: courseForm.nameEn,
          name_ar: courseForm.nameAr,
          major_id: courseForm.majorId,
          credits: parseInt(courseForm.credits),
          level: parseInt(courseForm.level),
          instructor: courseForm.instructor
        });
        toast(isAr ? 'تم تعديل المقرر بنجاح' : 'Course updated successfully', 'success');
      } else {
        await api.adminCreateCourse({
          id: courseForm.id,
          code: courseForm.code,
          name_en: courseForm.nameEn,
          name_ar: courseForm.nameAr,
          major_id: courseForm.majorId,
          credits: parseInt(courseForm.credits),
          level: parseInt(courseForm.level),
          instructor: courseForm.instructor
        });
        toast(isAr ? 'تم إضافة المقرر بنجاح' : 'Course added successfully', 'success');
      }
      setCourseModalOpen(false);
      loadAdminCatalog();
    } catch (err) {
      toast(err.message || 'Failed to save course', 'warning');
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm(isAr ? 'هل أنت متأكد من حذف هذا المقرر وجميع مواده؟' : 'Are you sure you want to delete this course and all its materials?')) return;
    try {
      await api.adminDeleteCourse(courseId);
      toast(isAr ? 'تم حذف المقرر بنجاح' : 'Course deleted successfully', 'success');
      loadAdminCatalog();
    } catch (err) {
      toast(err.message || 'Failed to delete course', 'warning');
    }
  };

  // Material Actions
  const handleOpenAddMaterial = () => {
    setEditingMaterial(null);
    setMaterialForm({
      id: 'mat-' + Date.now(),
      category: 'exams',
      title: '',
      titleAr: '',
      date: new Date().toISOString().split('T')[0],
      extra: { score: null, maxScore: 100, pages: 10, slideCount: 30, size: '2 MB' }
    });
    setMaterialModalOpen(true);
  };

  const handleOpenEditMaterial = (material) => {
    setEditingMaterial(material);
    setMaterialForm({
      id: material.id,
      category: material.category,
      title: material.title,
      titleAr: material.title_ar || '',
      date: material.date || '',
      extra: material.extra || {}
    });
    setMaterialModalOpen(true);
  };

  const handleSaveMaterial = async (e) => {
    e.preventDefault();
    if (!materialForm.title || !materialForm.category) {
      toast(isAr ? 'يرجى إدخال عنوان للمحتوى' : 'Please input a material title', 'warning');
      return;
    }
    try {
      if (editingMaterial) {
        await api.adminUpdateMaterial(editingMaterial.id, {
          category: materialForm.category,
          title: materialForm.title,
          title_ar: materialForm.titleAr,
          date: materialForm.date,
          extra: materialForm.extra
        });
        toast(isAr ? 'تم تعديل المحتوى بنجاح' : 'Material updated successfully', 'success');
      } else {
        await api.adminCreateMaterial({
          id: materialForm.id,
          course_id: selectedCourseId,
          category: materialForm.category,
          title: materialForm.title,
          title_ar: materialForm.titleAr,
          date: materialForm.date,
          extra: materialForm.extra
        });
        toast(isAr ? 'تم إضافة المحتوى بنجاح' : 'Material added successfully', 'success');
      }
      setMaterialModalOpen(false);
      loadCourseMaterials(selectedCourseId);
    } catch (err) {
      toast(err.message || 'Failed to save material', 'warning');
    }
  };

  const handleDeleteMaterial = async (materialId) => {
    if (!window.confirm(isAr ? 'هل أنت متأكد من حذف هذا المحتوى؟' : 'Are you sure you want to delete this material?')) return;
    try {
      await api.adminDeleteMaterial(materialId);
      toast(isAr ? 'تم حذف المحتوى بنجاح' : 'Material deleted successfully', 'success');
      loadCourseMaterials(selectedCourseId);
    } catch (err) {
      toast(err.message || 'Failed to delete material', 'warning');
    }
  };

  return (
    <div className="admin-layout" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-3)' }}>
      {/* Page Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">{isAr ? 'لوحة التحكم للمدير' : 'Admin Control Panel'}</h1>
          <p className="page-subtitle" style={{ color: 'var(--text-muted)' }}>
            {isAr ? 'إدارة المقررات الدراسية، المواد الأكاديمية والشرائح لكل التخصصات.' : 'Manage course catalog, syllabus materials, and slides for all majors.'}
          </p>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="tabs-header" style={{ display: 'flex', gap: 'var(--s-1)', borderBottom: '1px solid var(--border)', paddingBottom: 'var(--s-1)' }}>
        <button
          className={`btn ${activeTab === 'courses' ? 'btn--primary' : 'btn--ghost'}`}
          onClick={() => setActiveTab('courses')}
        >
          {isAr ? 'المقررات الدراسية (الكتالوج)' : 'Courses (Catalog)'}
        </button>
        <button
          className={`btn ${activeTab === 'materials' ? 'btn--primary' : 'btn--ghost'}`}
          onClick={() => setActiveTab('materials')}
        >
          {isAr ? 'المواد الأكاديمية والامتحانات' : 'Course Materials & Exams'}
        </button>
        <button
          className={`btn ${activeTab === 'reports' ? 'btn--primary' : 'btn--ghost'}`}
          onClick={() => setActiveTab('reports')}
        >
          {isAr ? 'بلاغات المستخدمين' : 'User Reports'}
        </button>
      </div>

      {/* Loading state */}
      {loading && <div className="card text-center" style={{ padding: 'var(--s-4)' }}>{isAr ? 'جاري التحميل...' : 'Loading...'}</div>}

      {/* Tab: Courses (Catalog) */}
      {!loading && activeTab === 'courses' && (
        <section className="card">
          <header className="card__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="card__title">{isAr ? 'جميع المقررات في الكتالوج' : 'All Courses in Catalog'}</h3>
            <button className="btn btn--primary btn--sm" onClick={handleOpenAddCourse}>
              {isAr ? 'إضافة مقرر جديد' : 'Add New Course'}
            </button>
          </header>
          <div className="card__content" style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: isAr ? 'right' : 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)' }}>
                  <th style={{ padding: 'var(--s-1) 0' }}>{isAr ? 'الرمز' : 'Code'}</th>
                  <th style={{ padding: 'var(--s-1) 0' }}>{isAr ? 'الاسم (EN)' : 'Name (EN)'}</th>
                  <th style={{ padding: 'var(--s-1) 0' }}>{isAr ? 'الاسم (AR)' : 'Name (AR)'}</th>
                  <th style={{ padding: 'var(--s-1) 0' }}>{isAr ? 'التخصص' : 'Major'}</th>
                  <th style={{ padding: 'var(--s-1) 0' }}>{isAr ? 'الساعات' : 'Hours'}</th>
                  <th style={{ padding: 'var(--s-1) 0' }}>{isAr ? 'المستوى' : 'Level'}</th>
                  <th style={{ padding: 'var(--s-1) 0' }}>{isAr ? 'المحاضر' : 'Instructor'}</th>
                  <th style={{ padding: 'var(--s-1) 0', textAlign: 'center' }}>{isAr ? 'العمليات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {catalog.map((course) => (
                  <tr key={course.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: 'var(--s-1) 0', fontWeight: '600' }}>{course.code}</td>
                    <td style={{ padding: 'var(--s-1) 0' }}>{course.name_en}</td>
                    <td style={{ padding: 'var(--s-1) 0' }}>{course.name_ar}</td>
                    <td style={{ padding: 'var(--s-1) 0' }}>{isAr ? course.major_name_ar : course.major_name_en}</td>
                    <td style={{ padding: 'var(--s-1) 0' }}>{course.credits}</td>
                    <td style={{ padding: 'var(--s-1) 0' }}>{course.level}</td>
                    <td style={{ padding: 'var(--s-1) 0' }}>{course.instructor}</td>
                    <td style={{ padding: 'var(--s-1) 0', textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', gap: 'var(--s-1)' }}>
                        <button className="icon-btn" onClick={() => handleOpenEditCourse(course)}>
                          <svg width="14" height="14"><use href="#icon-edit-2"/></svg>
                        </button>
                        <button className="icon-btn text-danger" onClick={() => handleDeleteCourse(course.id)}>
                          <svg width="14" height="14"><use href="#icon-trash-2"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Tab: Course Materials */}
      {!loading && activeTab === 'materials' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-3)' }}>
          {/* Selector */}
          <section className="card" style={{ padding: 'var(--s-2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-2)', flexWrap: 'wrap' }}>
              <label style={{ fontWeight: '600' }}>{isAr ? 'اختر المقرر لتعديل محتواه:' : 'Select Course to Manage Materials:'}</label>
              <select
                className="select"
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                style={{ minWidth: '250px', padding: 'var(--s-1)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
              >
                {catalog.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.code} - {isAr ? c.name_ar : c.name_en}
                  </option>
                ))}
              </select>
            </div>
          </section>

          {/* Materials Listing */}
          {selectedCourseId && (
            <section className="card">
              <header className="card__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="card__title">{isAr ? 'المواد الأكاديمية للمقرر المحدد' : 'Materials for Selected Course'}</h3>
                <button className="btn btn--primary btn--sm" onClick={handleOpenAddMaterial}>
                  {isAr ? 'إضافة محتوى جديد' : 'Add New Material'}
                </button>
              </header>
              <div className="card__content" style={{ overflowX: 'auto' }}>
                <table className="table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: isAr ? 'right' : 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border)' }}>
                      <th style={{ padding: 'var(--s-1) 0' }}>{isAr ? 'التصنيف' : 'Category'}</th>
                      <th style={{ padding: 'var(--s-1) 0' }}>{isAr ? 'العنوان (EN)' : 'Title (EN)'}</th>
                      <th style={{ padding: 'var(--s-1) 0' }}>{isAr ? 'العنوان (AR)' : 'Title (AR)'}</th>
                      <th style={{ padding: 'var(--s-1) 0' }}>{isAr ? 'التاريخ' : 'Date'}</th>
                      <th style={{ padding: 'var(--s-1) 0' }}>{isAr ? 'خصائص إضافية' : 'Details'}</th>
                      <th style={{ padding: 'var(--s-1) 0', textAlign: 'center' }}>{isAr ? 'العمليات' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {materials.map((mat) => (
                      <tr key={mat.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <td style={{ padding: 'var(--s-1) 0' }}>
                          <span className="badge" style={{ textTransform: 'capitalize' }}>{mat.category}</span>
                        </td>
                        <td style={{ padding: 'var(--s-1) 0', fontWeight: '500' }}>{mat.title}</td>
                        <td style={{ padding: 'var(--s-1) 0' }}>{mat.title_ar || '—'}</td>
                        <td style={{ padding: 'var(--s-1) 0' }}>{mat.date}</td>
                        <td style={{ padding: 'var(--s-1) 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          {mat.category === 'exams' && `Status: ${mat.extra?.status || 'upcoming'}`}
                          {mat.category === 'slides' && `Slides: ${mat.extra?.slideCount || 0}`}
                          {mat.category === 'summaries' && `Pages: ${mat.extra?.pages || 0} (${mat.extra?.size || ''})`}
                          {mat.category === 'assignments' && `Status: ${mat.extra?.status || 'pending'}`}
                        </td>
                        <td style={{ padding: 'var(--s-1) 0', textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', gap: 'var(--s-1)' }}>
                            <button className="icon-btn" onClick={() => handleOpenEditMaterial(mat)}>
                              <svg width="14" height="14"><use href="#icon-edit-2"/></svg>
                            </button>
                            <button className="icon-btn text-danger" onClick={() => handleDeleteMaterial(mat.id)}>
                              <svg width="14" height="14"><use href="#icon-trash-2"/></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {materials.length === 0 && (
                      <tr>
                        <td colSpan="6" style={{ padding: 'var(--s-4) 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                          {isAr ? 'لا يوجد محتوى أكاديمي مضاف حالياً لهذا المقرر.' : 'No materials have been added to this course yet.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>
      )}

      {/* Tab: User Reports */}
      {!loading && activeTab === 'reports' && (
        <section className="card">
          <header className="card__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--s-2)', flexWrap: 'wrap' }}>
            <div>
              <h3 className="card__title">{isAr ? 'بلاغات المستخدمين' : 'User Reports'}</h3>
              <p style={{ color: 'var(--text-muted)', margin: 0 }}>
                {isAr ? 'البلاغات محفوظة في قاعدة البيانات ويمكن تغيير حالتها من هنا.' : 'Reports are stored in the database and can be reviewed here.'}
              </p>
            </div>
            <select
              className="select"
              value={reportStatus}
              onChange={(e) => setReportStatus(e.target.value)}
              style={{ minWidth: 160, padding: 'var(--s-1)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
            >
              <option value="all">{isAr ? 'كل البلاغات' : 'All reports'}</option>
              <option value="open">{isAr ? 'مفتوحة' : 'Open'}</option>
              <option value="reviewing">{isAr ? 'قيد المراجعة' : 'Reviewing'}</option>
              <option value="resolved">{isAr ? 'محلولة' : 'Resolved'}</option>
              <option value="closed">{isAr ? 'مغلقة' : 'Closed'}</option>
            </select>
          </header>
          <div className="card__content" style={{ display: 'grid', gap: 'var(--s-2)' }}>
            {reports.length === 0 && (
              <div style={{ padding: 'var(--s-4)', textAlign: 'center', color: 'var(--text-muted)' }}>
                {isAr ? 'لا توجد بلاغات حالياً.' : 'No reports found.'}
              </div>
            )}
            {reports.map(report => (
              <article key={report.id} className="card" style={{ border: '1px solid var(--border)', boxShadow: 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--s-2)', flexWrap: 'wrap' }}>
                  <div>
                    <h4 style={{ margin: '0 0 6px' }}>{report.subject}</h4>
                    <div style={{ color: 'var(--text-muted)', fontSize: '.9rem' }}>
                      {report.category} · {new Date(report.created_at).toLocaleString(isAr ? 'ar-SA' : 'en-US')}
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '.9rem', marginTop: 4 }}>
                      {report.user ? `${report.user.name} · ${report.user.email}` : `${report.name || 'Guest'}${report.email ? ' · ' + report.email : ''}`}
                    </div>
                  </div>
                  <select
                    className="select"
                    value={report.status}
                    onChange={(e) => handleUpdateReport(report.id, { status: e.target.value })}
                    style={{ height: 40, padding: '0 var(--s-1)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                  >
                    <option value="open">{isAr ? 'مفتوح' : 'Open'}</option>
                    <option value="reviewing">{isAr ? 'قيد المراجعة' : 'Reviewing'}</option>
                    <option value="resolved">{isAr ? 'محلول' : 'Resolved'}</option>
                    <option value="closed">{isAr ? 'مغلق' : 'Closed'}</option>
                  </select>
                </div>
                <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7, marginTop: 'var(--s-2)' }}>{report.message}</p>
                <label style={{ display: 'grid', gap: 6, marginTop: 'var(--s-2)', fontWeight: 600 }}>
                  {isAr ? 'ملاحظة الإدارة' : 'Admin note'}
                  <textarea
                    className="input"
                    defaultValue={report.admin_note || ''}
                    rows={2}
                    onBlur={(e) => {
                      if (e.target.value !== (report.admin_note || '')) handleUpdateReport(report.id, { admin_note: e.target.value });
                    }}
                    style={{ padding: 'var(--s-1)', resize: 'vertical' }}
                  />
                </label>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* ================= COURSE MODAL ================= */}
      {courseModalOpen && (
        <div className="modal-backdrop is-open" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="modal-content card" style={{ maxWidth: '600px', width: '90%', margin: '0 auto' }}>
            <header className="card__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="card__title">
                {editingCourse ? (isAr ? 'تعديل المقرر الدراسي' : 'Edit Catalog Course') : (isAr ? 'إضافة مقرر دراسي جديد' : 'Add New Course')}
              </h3>
              <button className="icon-btn" onClick={() => setCourseModalOpen(false)}>
                <svg width="14" height="14"><use href="#icon-x"/></svg>
              </button>
            </header>
            <form onSubmit={handleSaveCourse} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-2)', padding: 'var(--s-2)' }}>
              <div>
                <label className="field-row__label" style={{ marginBottom: '4px', display: 'block' }}>{isAr ? 'الرمز (مثال: CS 201)' : 'Course Code (e.g. CS 201)'}</label>
                <input
                  type="text"
                  className="input"
                  value={courseForm.code}
                  onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })}
                  style={{ width: '100%', padding: 'var(--s-1)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: 'var(--s-2)' }}>
                <div style={{ flex: 1 }}>
                  <label className="field-row__label" style={{ marginBottom: '4px', display: 'block' }}>{isAr ? 'الاسم بالإنجليزية' : 'Name (English)'}</label>
                  <input
                    type="text"
                    className="input"
                    value={courseForm.nameEn}
                    onChange={(e) => setCourseForm({ ...courseForm, nameEn: e.target.value })}
                    style={{ width: '100%', padding: 'var(--s-1)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
                    required
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="field-row__label" style={{ marginBottom: '4px', display: 'block' }}>{isAr ? 'الاسم بالعربية' : 'Name (Arabic)'}</label>
                  <input
                    type="text"
                    className="input"
                    value={courseForm.nameAr}
                    onChange={(e) => setCourseForm({ ...courseForm, nameAr: e.target.value })}
                    style={{ width: '100%', padding: 'var(--s-1)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 'var(--s-2)' }}>
                <div style={{ flex: 1 }}>
                  <label className="field-row__label" style={{ marginBottom: '4px', display: 'block' }}>{isAr ? 'التخصص الدراسي' : 'Assign to Major'}</label>
                  <select
                    className="select"
                    value={courseForm.majorId}
                    onChange={(e) => setCourseForm({ ...courseForm, majorId: e.target.value })}
                    style={{ width: '100%', padding: 'var(--s-1)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
                  >
                    {majors.map(m => (
                      <option key={m.id} value={m.id}>{isAr ? m.nameAr : m.nameEn}</option>
                    ))}
                  </select>
                </div>
                <div style={{ width: '100px' }}>
                  <label className="field-row__label" style={{ marginBottom: '4px', display: 'block' }}>{isAr ? 'الساعات' : 'Hours'}</label>
                  <input
                    type="number"
                    className="input"
                    value={courseForm.credits}
                    onChange={(e) => setCourseForm({ ...courseForm, credits: parseInt(e.target.value) })}
                    style={{ width: '100%', padding: 'var(--s-1)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
                    min="1"
                    max="5"
                  />
                </div>
                <div style={{ width: '100px' }}>
                  <label className="field-row__label" style={{ marginBottom: '4px', display: 'block' }}>{isAr ? 'المستوى' : 'Level'}</label>
                  <input
                    type="number"
                    className="input"
                    value={courseForm.level}
                    onChange={(e) => setCourseForm({ ...courseForm, level: parseInt(e.target.value) })}
                    style={{ width: '100%', padding: 'var(--s-1)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
                    min="100"
                    step="100"
                    max="500"
                  />
                </div>
              </div>

              <div>
                <label className="field-row__label" style={{ marginBottom: '4px', display: 'block' }}>{isAr ? 'المحاضر / الدكتور' : 'Instructor / Professor'}</label>
                <input
                  type="text"
                  className="input"
                  value={courseForm.instructor}
                  onChange={(e) => setCourseForm({ ...courseForm, instructor: e.target.value })}
                  style={{ width: '100%', padding: 'var(--s-1)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
                />
              </div>

              <footer style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--s-1)', marginTop: 'var(--s-2)' }}>
                <button type="button" className="btn btn--ghost" onClick={() => setCourseModalOpen(false)}>
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button type="submit" className="btn btn--primary">
                  {isAr ? 'حفظ المقرر' : 'Save Course'}
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}

      {/* ================= MATERIAL MODAL ================= */}
      {materialModalOpen && (
        <div className="modal-backdrop is-open" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="modal-content card" style={{ maxWidth: '500px', width: '90%', margin: '0 auto' }}>
            <header className="card__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="card__title">
                {editingMaterial ? (isAr ? 'تعديل المحتوى الأكاديمي' : 'Edit Syllabus Material') : (isAr ? 'إضافة محتوى أكاديمي جديد' : 'Add Course Material')}
              </h3>
              <button className="icon-btn" onClick={() => setMaterialModalOpen(false)}>
                <svg width="14" height="14"><use href="#icon-x"/></svg>
              </button>
            </header>
            <form onSubmit={handleSaveMaterial} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-2)', padding: 'var(--s-2)' }}>
              <div>
                <label className="field-row__label" style={{ marginBottom: '4px', display: 'block' }}>{isAr ? 'التصنيف الأكاديمي' : 'Material Category'}</label>
                <select
                  className="select"
                  value={materialForm.category}
                  onChange={(e) => setMaterialForm({ ...materialForm, category: e.target.value })}
                  style={{ width: '100%', padding: 'var(--s-1)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
                >
                  <option value="exams">{isAr ? 'الامتحانات والاختبارات' : 'Exams & Quizzes'}</option>
                  <option value="slides">{isAr ? 'شرائح المحاضرة (Slides)' : 'Lecture Slides'}</option>
                  <option value="summaries">{isAr ? 'الملخصات المنهجية' : 'Methodical Summaries'}</option>
                  <option value="assignments">{isAr ? 'الواجبات والتكليفات' : 'Assignments'}</option>
                </select>
              </div>

              <div>
                <label className="field-row__label" style={{ marginBottom: '4px', display: 'block' }}>{isAr ? 'العنوان بالإنجليزية' : 'Title (English)'}</label>
                <input
                  type="text"
                  className="input"
                  value={materialForm.title}
                  onChange={(e) => setMaterialForm({ ...materialForm, title: e.target.value })}
                  style={{ width: '100%', padding: 'var(--s-1)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
                  required
                />
              </div>

              <div>
                <label className="field-row__label" style={{ marginBottom: '4px', display: 'block' }}>{isAr ? 'العنوان بالعربية' : 'Title (Arabic)'}</label>
                <input
                  type="text"
                  className="input"
                  value={materialForm.titleAr}
                  onChange={(e) => setMaterialForm({ ...materialForm, titleAr: e.target.value })}
                  style={{ width: '100%', padding: 'var(--s-1)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
                />
              </div>

              <div>
                <label className="field-row__label" style={{ marginBottom: '4px', display: 'block' }}>{isAr ? 'تاريخ التحديث / التسليم' : 'Date (Release or Due)'}</label>
                <input
                  type="date"
                  className="input"
                  value={materialForm.date}
                  onChange={(e) => setMaterialForm({ ...materialForm, date: e.target.value })}
                  style={{ width: '100%', padding: 'var(--s-1)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
                />
              </div>

              {/* Extra Dynamic properties based on category */}
              {materialForm.category === 'slides' && (
                <div>
                  <label className="field-row__label" style={{ marginBottom: '4px', display: 'block' }}>{isAr ? 'عدد الشرائح' : 'Slide Count'}</label>
                  <input
                    type="number"
                    className="input"
                    value={materialForm.extra?.slideCount || 30}
                    onChange={(e) => setMaterialForm({
                      ...materialForm,
                      extra: { ...materialForm.extra, slideCount: parseInt(e.target.value) }
                    })}
                    style={{ width: '100%', padding: 'var(--s-1)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
                  />
                </div>
              )}

              {materialForm.category === 'summaries' && (
                <div style={{ display: 'flex', gap: 'var(--s-2)' }}>
                  <div style={{ flex: 1 }}>
                    <label className="field-row__label" style={{ marginBottom: '4px', display: 'block' }}>{isAr ? 'عدد الصفحات' : 'Page Count'}</label>
                    <input
                      type="number"
                      className="input"
                      value={materialForm.extra?.pages || 10}
                      onChange={(e) => setMaterialForm({
                        ...materialForm,
                        extra: { ...materialForm.extra, pages: parseInt(e.target.value) }
                      })}
                      style={{ width: '100%', padding: 'var(--s-1)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label className="field-row__label" style={{ marginBottom: '4px', display: 'block' }}>{isAr ? 'حجم الملف (مثال: 1.5 MB)' : 'File Size (e.g. 1.5 MB)'}</label>
                    <input
                      type="text"
                      className="input"
                      value={materialForm.extra?.size || '2 MB'}
                      onChange={(e) => setMaterialForm({
                        ...materialForm,
                        extra: { ...materialForm.extra, size: e.target.value }
                      })}
                      style={{ width: '100%', padding: 'var(--s-1)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
                    />
                  </div>
                </div>
              )}

              <footer style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--s-1)', marginTop: 'var(--s-2)' }}>
                <button type="button" className="btn btn--ghost" onClick={() => setMaterialModalOpen(false)}>
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button type="submit" className="btn btn--primary">
                  {isAr ? 'حفظ المحتوى' : 'Save Material'}
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
