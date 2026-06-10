import { useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import QuizViewer from './QuizViewer';
import SummaryView from './SummaryView';
import SlideViewer from './SlideViewer';
import AssignmentView from './AssignmentView';

export default function MaterialModal({ category, item, onClose }) {
  const { state } = useApp();
  const isAr = state.lang === 'ar';

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!item) return null;

  const title = isAr ? item.titleAr : item.title;

  const renderBody = () => {
    switch (category) {
      case 'exams': return <QuizViewer item={item} />;
      case 'summaries': return <SummaryView item={item} />;
      case 'slides': return <SlideViewer item={item} />;
      case 'assignments': return <AssignmentView item={item} />;
      default: return null;
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal mat-modal" role="dialog" aria-modal="true">
        <header className="modal__header">
          <h3 className="modal__title">{title}</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <svg width="16" height="16"><use href="#icon-x"/></svg>
          </button>
        </header>
        <div className="mat-modal__body">{renderBody()}</div>
      </div>
    </div>
  );
}
