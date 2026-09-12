import React from 'react';
import { CheckCircle2, AlertCircle, Loader2, X } from 'lucide-react';

interface AlertBannerProps {
  type: 'success' | 'error' | 'loading' | null;
  message: string | null;
  onClose?: () => void;
  action?: {
    label: string;
    onClick: () => void;
    id?: string;
  };
  id?: string;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({ type, message, onClose, action, id = 'alert-banner' }) => {
  if (!type || !message) return null;

  return (
    <div
      id={id}
      className={`w-full p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all duration-200 shadow-xs ${
        type === 'success'
          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
          : type === 'error'
          ? 'bg-rose-500/10 border-rose-500/30 text-rose-800 dark:text-rose-300'
          : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-800 dark:text-indigo-300'
      }`}
      role="alert"
    >
      <div className="flex items-start gap-3 flex-1">
        <div className="shrink-0 mt-0.5">
          {type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
          {type === 'error' && <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />}
          {type === 'loading' && <Loader2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400 animate-spin" />}
        </div>
        
        <div className="flex-1 text-sm font-medium leading-relaxed break-words">
          {message}
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
        {action && (
          <button
            type="button"
            id={action.id || `${id}-action-btn`}
            onClick={action.onClick}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer ${
              type === 'error'
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            {action.label}
          </button>
        )}

        {onClose && type !== 'loading' && (
          <button
            type="button"
            onClick={onClose}
            id={`${id}-close-btn`}
            className="shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg transition-colors cursor-pointer"
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
