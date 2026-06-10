import { useState } from 'react';
import { useApp } from '../../context/AppContext';

export default function SlideViewer({ item }) {
  const { state } = useApp();
  const isAr = state.lang === 'ar';
  const total = item.slideCount || 24;
  const [idx, setIdx] = useState(1);

  const slides = Array.from({ length: total }, (_, i) => ({
    n: i + 1,
    title: i === 0
      ? (isAr ? item.titleAr : item.title)
      : (isAr ? `الشريحة ${i + 1}` : `Slide ${i + 1}`),
  }));

  const current = slides[idx - 1];

  return (
    <div className="mat-slide-viewer">
      <div className="mat-slide-stage">
        <div className="mat-slide-stage__counter">{idx} / {total}</div>
        <div className="mat-slide-stage__inner">
          <div className="mat-slide-stage__num">{isAr ? `شريحة ${idx}` : `SLIDE ${idx}`}</div>
          <div className="mat-slide-stage__title">{current.title}</div>
          <div className="mat-slide-stage__placeholder">
            {isAr ? 'بيانات الشريحة محفوظة داخل النظام' : 'Slide metadata saved in the system'}
          </div>
        </div>
        <button
          className="mat-slide-stage__nav mat-slide-stage__nav--prev"
          onClick={() => setIdx(Math.max(1, idx - 1))}
          disabled={idx === 1}
        >
          <svg><use href="#icon-chevron-left"/></svg>
        </button>
        <button
          className="mat-slide-stage__nav mat-slide-stage__nav--next"
          onClick={() => setIdx(Math.min(total, idx + 1))}
          disabled={idx === total}
        >
          <svg><use href="#icon-chevron-right"/></svg>
        </button>
      </div>
      <div className="mat-slide-strip">
        {slides.map((s) => (
          <button
            key={s.n}
            className={`mat-slide-thumb${idx === s.n ? ' is-active' : ''}`}
            onClick={() => setIdx(s.n)}
          >
            <span className="mat-slide-thumb__n">{s.n}</span>
            <span className="mat-slide-thumb__band" />
          </button>
        ))}
      </div>
    </div>
  );
}
