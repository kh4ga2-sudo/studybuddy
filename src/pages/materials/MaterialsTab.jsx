import { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { genMaterials } from '../../data/materials';
import MaterialModal from './MaterialModal';
import * as api from '../../api';

const CATEGORIES = [
  { key: 'exams', icon: 'edit-2', labelEn: 'Exams', labelAr: 'الاختبارات' },
  { key: 'summaries', icon: 'file-text', labelEn: 'Summaries', labelAr: 'الملخصات' },
  { key: 'slides', icon: 'layers', labelEn: 'Slides', labelAr: 'الشرائح' },
  { key: 'assignments', icon: 'upload', labelEn: 'Assignments', labelAr: 'الواجبات' },
];

export default function MaterialsTab({ course }) {
  const { state } = useApp();
  const isAr = state.lang === 'ar';
  const fallbackMaterials = genMaterials(course.id);
  const [materials, setMaterials] = useState(fallbackMaterials);
  const [activeCat, setActiveCat] = useState('exams');
  const [openItem, setOpenItem] = useState(null);

  useEffect(() => {
    let ignore = false;
    api.getMaterials(course.id)
      .then((rows) => {
        if (ignore || !Array.isArray(rows)) return;
        const grouped = { exams: [], summaries: [], slides: [], assignments: [] };
        rows.forEach((row) => {
          const item = {
            id: row.id,
            title: row.title,
            titleAr: row.title_ar || row.title,
            date: row.date,
            ...(row.extra || {}),
          };
          if (!grouped[row.category]) grouped[row.category] = [];
          grouped[row.category].push(item);
        });
        setMaterials(grouped);
      })
      .catch(() => setMaterials(fallbackMaterials));
    return () => { ignore = true; };
  }, [course.id]);

  const items = materials[activeCat] || [];
  const activeMeta = CATEGORIES.find((c) => c.key === activeCat);

  return (
    <div>
      <div className="materials-grid">
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            className={`material-tile${activeCat === c.key ? ' is-active' : ''}`}
            onClick={() => setActiveCat(c.key)}
          >
            <div className="material-tile__icon"><svg width="20" height="20"><use href={`#icon-${c.icon}`}/></svg></div>
            <div className="material-tile__title">{isAr ? c.labelAr : c.labelEn}</div>
            <div className="material-tile__count">{materials[c.key]?.length || 0}</div>
          </button>
        ))}
      </div>

      <div className="card mat-list-card" style={{ marginTop: 'var(--s-4)' }}>
        <header className="card__header">
          <h3 className="card__title">{isAr ? activeMeta.labelAr : activeMeta.labelEn}</h3>
        </header>
        <div className="mat-list">
          {items.map((it) => (
            <div key={it.id} className="mat-row" onClick={() => setOpenItem(it)}>
              <div className="mat-row__icon"><svg width="14" height="14"><use href={`#icon-${activeMeta.icon}`}/></svg></div>
              <div className="mat-row__main">
                <div className="mat-row__title">{isAr ? it.titleAr : it.title}</div>
                <div className="mat-row__meta">
                  {it.date && (
                    <span className="mat-meta__chip mono">
                      <svg width="11" height="11"><use href="#icon-calendar"/></svg>{it.date}
                    </span>
                  )}
                  {it.pages && <span className="mat-meta__chip">{it.pages} {isAr ? 'صفحات' : 'pages'}</span>}
                  {it.size && <span className="mat-meta__chip mono">{it.size}</span>}
                  {it.slideCount && <span className="mat-meta__chip">{it.slideCount} {isAr ? 'شريحة' : 'slides'}</span>}
                  {it.dueDate && (
                    <span className="mat-meta__chip mono">
                      <svg width="11" height="11"><use href="#icon-clock"/></svg>{it.dueDate}
                    </span>
                  )}
                  {it.score != null && (
                    <span className="mat-meta__chip mat-meta__chip--score">{it.score}/{it.maxScore}</span>
                  )}
                  {it.grade && (
                    <span className="mat-meta__chip mat-meta__chip--score">{it.grade}</span>
                  )}
                  {it.status === 'pending' && (
                    <span className="mat-meta__chip" style={{ color: 'var(--warning)' }}>{isAr ? 'معلّق' : 'Pending'}</span>
                  )}
                  {it.status === 'submitted' && (
                    <span className="mat-meta__chip" style={{ color: 'var(--success)' }}>{isAr ? 'تم التسليم' : 'Submitted'}</span>
                  )}
                  {it.status === 'upcoming' && (
                    <span className="mat-meta__chip" style={{ color: 'var(--info)' }}>{isAr ? 'قادم' : 'Upcoming'}</span>
                  )}
                </div>
              </div>
              <button className="mat-row__btn" onClick={(e) => { e.stopPropagation(); setOpenItem(it); }}>
                <svg width="11" height="11"><use href="#icon-eye"/></svg> {isAr ? 'عرض' : 'View'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {openItem && (
        <MaterialModal
          category={activeCat}
          item={openItem}
          onClose={() => setOpenItem(null)}
        />
      )}
    </div>
  );
}
