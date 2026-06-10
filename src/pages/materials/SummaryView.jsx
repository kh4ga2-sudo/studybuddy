import { useApp } from '../../context/AppContext';
import PDFViewer from './PDFViewer';

export default function SummaryView({ item }) {
  const { state } = useApp();
  const isAr = state.lang === 'ar';

  return (
    <div>
      <div className="mat-modal__meta">
        <div className="mat-modal__meta-cell">
          <div className="lbl">{isAr ? 'عدد الصفحات' : 'Pages'}</div>
          <div className="val mono">{item.pages}</div>
        </div>
        <div className="mat-modal__meta-cell">
          <div className="lbl">{isAr ? 'الحجم' : 'Size'}</div>
          <div className="val mono">{item.size}</div>
        </div>
        <div className="mat-modal__meta-cell">
          <div className="lbl">{isAr ? 'التاريخ' : 'Date'}</div>
          <div className="val mono">{item.date}</div>
        </div>
      </div>
      <PDFViewer item={item} />
    </div>
  );
}
