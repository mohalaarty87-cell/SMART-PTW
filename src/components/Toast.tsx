import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { ToastMessage } from '../types';

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none max-w-md w-full px-4">
      {toasts.map((t) => {
        const isSuccess = t.type === 'success';
        const isError = t.type === 'error';

        const borderClass = isSuccess
          ? 'border-emerald-500/50 bg-emerald-950/90 text-emerald-200'
          : isError
          ? 'border-rose-500/50 bg-rose-950/90 text-rose-200'
          : 'border-cyan-500/50 bg-[#0b1324]/95 text-cyan-200';

        const Icon = isSuccess ? CheckCircle2 : isError ? AlertCircle : Info;

        return (
          <div
            key={t.id}
            className={`p-3.5 rounded-xl border ${borderClass} shadow-2xl flex items-center justify-between gap-3 text-xs font-semibold backdrop-blur-md pointer-events-auto transition-all duration-300 animate-in slide-in-from-bottom-3`}
          >
            <div className="flex items-center gap-2.5">
              <Icon className="w-4 h-4 shrink-0" />
              <span className="leading-snug">{t.message}</span>
            </div>
            <button
              onClick={() => onDismiss(t.id)}
              className="text-slate-400 hover:text-white p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
