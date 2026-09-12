import React from 'react';
import { Loader2, Sparkles, Activity } from 'lucide-react';

interface LoadingOverlayProps {
  message: string;
  subtext?: string;
  id?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  message,
  subtext,
  id = 'loading-overlay',
}) => {
  return (
    <div
      id={id}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-md transition-all duration-300"
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-200">
        <div className="relative mb-6">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center border border-indigo-100 dark:border-indigo-800/50">
            <Activity className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-pulse" />
          </div>
          <div className="absolute -top-1.5 -right-1.5 bg-indigo-600 text-white p-1.5 rounded-full shadow-md animate-spin">
            <Loader2 className="w-3.5 h-3.5" />
          </div>
        </div>

        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
          {message}
        </h3>

        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
          {subtext || 'Connecting with the AI automation workflow. Please hold on...'}
        </p>

        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-6 overflow-hidden">
          <div className="bg-indigo-600 h-full w-2/3 rounded-full animate-indeterminate" />
        </div>
      </div>
    </div>
  );
};
