import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    ({ type = 'info', title, message, duration = 4000 }) => {
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newToast = { id, type, title, message };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }

      return id;
    },
    [removeToast]
  );

  const toast = {
    show: addToast,
    success: (message, title = 'Success') => addToast({ type: 'success', title, message }),
    error: (message, title = 'Error') => addToast({ type: 'error', title, message }),
    warning: (message, title = 'Warning') => addToast({ type: 'warning', title, message }),
    info: (message, title = 'Notice') => addToast({ type: 'info', title, message }),
    dismiss: removeToast,
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const ToastContainer = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  const typeConfig = {
    success: {
      icon: <CheckCircle2 className="h-5 w-5 text-emerald-600" />,
      border: 'border-emerald-200',
      bg: 'bg-white',
      accent: 'bg-emerald-500',
    },
    error: {
      icon: <AlertCircle className="h-5 w-5 text-danger-600" />,
      border: 'border-danger-200',
      bg: 'bg-white',
      accent: 'bg-danger-500',
    },
    warning: {
      icon: <AlertTriangle className="h-5 w-5 text-accent-600" />,
      border: 'border-amber-200',
      bg: 'bg-white',
      accent: 'bg-accent-500',
    },
    info: {
      icon: <Info className="h-5 w-5 text-info-600" />,
      border: 'border-blue-200',
      bg: 'bg-white',
      accent: 'bg-info-500',
    },
  };

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((t) => {
        const config = typeConfig[t.type] || typeConfig.info;
        return (
          <div
            key={t.id}
            role="alert"
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg ${config.border} ${config.bg} transition-all duration-300 animate-in fade-in slide-in-from-bottom-2`}
          >
            <div className="shrink-0 mt-0.5">{config.icon}</div>
            <div className="flex-1 min-w-0">
              {t.title && <h4 className="text-sm font-semibold text-slate-900">{t.title}</h4>}
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{t.message}</p>
            </div>
            <button
              onClick={() => onDismiss(t.id)}
              className="shrink-0 text-slate-400 hover:text-slate-600 rounded p-1 hover:bg-slate-100 transition-colors"
              aria-label="Dismiss toast"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default ToastProvider;
