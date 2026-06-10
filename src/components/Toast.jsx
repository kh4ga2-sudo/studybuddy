import { useEffect } from 'react';
import { useApp } from '../context/AppContext';

const KIND_ICON = {
  success: 'icon-check-circle',
  info: 'icon-info',
  warning: 'icon-alert-circle',
  error: 'icon-alert-circle',
};

function ToastItem({ toast, onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 3000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const iconId = KIND_ICON[toast.kind] || 'icon-info';

  return (
    <div className={`toast toast--${toast.kind}`} role="alert" aria-live="polite">
      <svg width="18" height="18" aria-hidden="true">
        <use href={`#${iconId}`} />
      </svg>
      <span>{toast.msg}</span>
      <button
        className="toast__close"
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
      >
        <svg width="14" height="14" aria-hidden="true">
          <use href="#icon-x" />
        </svg>
      </button>
    </div>
  );
}

export default function Toast() {
  const { toasts, dismissToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={dismissToast} />
      ))}
    </div>
  );
}
