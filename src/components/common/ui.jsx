import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Folder, HardDrive, AlertTriangle, X, LogOut } from 'lucide-react';

export function LoadingSpinner({ label = 'Loading drive contents...' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-slate-500 dark:text-slate-400">
      <div className="relative flex h-10 w-10 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600 dark:border-slate-800 dark:border-t-blue-500" />
      </div>
      <p className="animate-pulse text-xs font-semibold text-slate-600 dark:text-slate-300">{label}</p>
    </div>
  );
}

export function EmptyState({ title, description, action, icon: Icon = Folder }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-dashed border-slate-200 bg-white/80 px-6 py-16 text-center shadow-2xs backdrop-blur-xs dark:border-slate-800 dark:bg-slate-900/80">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
        <Icon size={24} />
      </div>
      <h3 className="font-[family-name:var(--font-display)] text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
        {title}
      </h3>
      {description && (
        <p className="mx-auto mt-1.5 max-w-sm text-xs leading-relaxed text-slate-500 dark:text-slate-400">{description}</p>
      )}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}

export function Modal({ open, onClose, title, children, wide = false }) {
  useEffect(() => {
    if (open) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-hidden"
    >
      <div
        className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity animate-fade-up"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`relative z-10 flex max-h-[calc(100vh-32px)] w-[calc(100vw-32px)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl animate-scale-up dark:border-slate-800 dark:bg-slate-900 ${
          wide ? 'sm:w-full sm:max-w-[640px]' : 'sm:w-full sm:max-w-md'
        }`}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 bg-white px-5 py-3.5 sm:px-6 dark:border-slate-800/80 dark:bg-slate-900">
          <h2 id="modal-title" className="truncate pr-3 font-[family-name:var(--font-display)] text-base font-bold text-slate-900 sm:text-lg dark:text-slate-100">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  danger = false,
  icon: Icon = AlertTriangle,
}) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div
            className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
              danger
                ? 'bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-400'
                : 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400'
            }`}
          >
            <Icon size={18} />
          </div>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{message}</p>
        </div>
        <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`rounded-xl px-4 py-2 text-xs font-semibold text-white transition ${
              danger
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export function StorageIndicator({ used = 0, quota = 1 }) {
  const pct = Math.min(100, Math.max(0, quota ? (used / quota) * 100 : 0));
  const format = (n) => {
    if (n >= 1024 ** 3) return `${(n / 1024 ** 3).toFixed(1)} GB`;
    if (n >= 1024 ** 2) return `${(n / 1024 ** 2).toFixed(1)} MB`;
    return `${Math.round(n / 1024)} KB`;
  };

  const isHigh = pct > 85;

  return (
    <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
          <HardDrive size={14} className="text-blue-600 dark:text-blue-400" />
          <span>Storage</span>
        </div>
        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
          {format(used)} / {format(quota)}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            isHigh ? 'bg-red-500' : 'bg-blue-600 dark:bg-blue-500'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-2 flex items-center justify-between text-[10px] font-semibold text-slate-500 dark:text-slate-400">
        <span>{pct.toFixed(0)}% used</span>
        <a
          href="/pricing"
          className="font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
        >
          Upgrade Storage
        </a>
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 8 }) {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-3">
        <div className="h-3 w-20 rounded bg-slate-200 dark:bg-slate-800" />
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-white border border-slate-200/80 dark:bg-slate-900 dark:border-slate-800" />
          ))}
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-3 w-16 rounded bg-slate-200 dark:bg-slate-800" />
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: count - 3 }).map((_, i) => (
            <div key={i} className="h-40 rounded-xl bg-white border border-slate-200/80 dark:bg-slate-900 dark:border-slate-800" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default { LoadingSpinner, EmptyState, Modal, ConfirmModal, StorageIndicator, SkeletonGrid };
