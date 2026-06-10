import { useState } from 'react';
import { useApp } from '../../context/AppContext';

export default function AssignmentView({ item }) {
  const { state, toast } = useApp();
  const isAr = state.lang === 'ar';
  const [submitted, setSubmitted] = useState(item.status === 'submitted');
  const [notes, setNotes] = useState('');
  const [fileName, setFileName] = useState('');

  const submit = () => {
    setSubmitted(true);
    toast(isAr ? 'تم تسليم الواجب' : 'Assignment submitted', 'success');
  };
  const withdraw = () => {
    setSubmitted(false);
    setNotes('');
    setFileName('');
    toast(isAr ? 'تم السحب' : 'Submission withdrawn', 'info');
  };

  return (
    <div>
      <div className="mat-modal__meta">
        <div className="mat-modal__meta-cell">
          <div className="lbl">{isAr ? 'الموعد النهائي' : 'Due date'}</div>
          <div className="val mono">{item.dueDate}</div>
        </div>
        <div className="mat-modal__meta-cell">
          <div className="lbl">{isAr ? 'الحالة' : 'Status'}</div>
          <div className="val">
            {submitted ? (isAr ? 'تم التسليم' : 'Submitted') : (isAr ? 'معلّق' : 'Pending')}
          </div>
        </div>
        {item.grade && (
          <div className="mat-modal__meta-cell">
            <div className="lbl">{isAr ? 'الدرجة' : 'Grade'}</div>
            <div className="val mono">{item.grade}</div>
          </div>
        )}
      </div>

      <div className="mat-modal__section">
        <div className="mat-modal__section-title">{isAr ? 'الوصف' : 'Description'}</div>
        <p className="mat-modal__p">
          {isAr
            ? 'سلّم الواجب قبل الموعد النهائي. تأكد من قراءة المتطلبات بعناية وتضمين كل العناصر المطلوبة.'
            : 'Submit your assignment before the deadline. Make sure to read the requirements carefully and include all required deliverables.'}
        </p>
      </div>

      {submitted ? (
        <div>
          <div className="mat-modal__inline-status">
            <svg><use href="#icon-check-circle"/></svg>
            {isAr ? 'تم استلام تسليمك.' : 'Your submission has been received.'}
          </div>
          <div style={{ marginTop: 'var(--s-3)' }}>
            <button className="btn btn--ghost" onClick={withdraw}>
              {isAr ? 'سحب التسليم' : 'Withdraw submission'}
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="mat-modal__section">
            <div className="mat-modal__section-title">{isAr ? 'الملاحظات' : 'Notes'}</div>
            <textarea
              className="mat-modal__textarea"
              placeholder={isAr ? 'أضف ملاحظات لمحاضرك (اختياري)…' : 'Add notes for your instructor (optional)…'}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <div className="mat-modal__section">
            <div className="mat-modal__section-title">{isAr ? 'إرفاق ملف' : 'Attach File'}</div>
            <label className="mat-modal__file">
              <svg><use href="#icon-upload"/></svg>
              <span>{fileName || (isAr ? 'اختر ملفاً للرفع' : 'Choose a file to upload')}</span>
              {fileName && <span className="mat-modal__file-name">{fileName}</span>}
              <input
                type="file"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setFileName(f.name);
                }}
              />
            </label>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn btn--primary" onClick={submit} disabled={!fileName}>
              <svg width="14" height="14"><use href="#icon-upload"/></svg>
              {isAr ? 'تسليم الواجب' : 'Submit Assignment'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
