import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Icons } from './Icon';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
}

interface ToastContextValue {
    toasts: Toast[];
    addToast: (message: string, type?: ToastType, duration?: number) => void;
    removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

// Convenience functions
export const toast = {
    success: (message: string, duration?: number) => {
        // Get the context - this will be set by ToastProvider
        if ((window as any).__toastAdd) {
            (window as any).__toastAdd(message, 'success', duration);
        }
    },
    error: (message: string, duration?: number) => {
        if ((window as any).__toastAdd) {
            (window as any).__toastAdd(message, 'error', duration);
        }
    },
    warning: (message: string, duration?: number) => {
        if ((window as any).__toastAdd) {
            (window as any).__toastAdd(message, 'warning', duration);
        }
    },
    info: (message: string, duration?: number) => {
        if ((window as any).__toastAdd) {
            (window as any).__toastAdd(message, 'info', duration);
        }
    },
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((message: string, type: ToastType = 'info', duration: number = 4000) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        setToasts(prev => [...prev, { id, message, type, duration }]);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    // Expose addToast globally for convenience toast() function
    useEffect(() => {
        (window as any).__toastAdd = addToast;
        return () => {
            delete (window as any).__toastAdd;
        };
    }, [addToast]);

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
            {children}
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </ToastContext.Provider>
    );
};

// Individual Toast Component
const ToastItem: React.FC<{ toast: Toast; onRemove: (id: string) => void }> = ({ toast, onRemove }) => {
    useEffect(() => {
        if (toast.duration) {
            const timer = setTimeout(() => {
                onRemove(toast.id);
            }, toast.duration);
            return () => clearTimeout(timer);
        }
    }, [toast, onRemove]);

    const typeStyles = {
        success: {
            bg: 'bg-green-50 dark:bg-green-900/20',
            border: 'border-green-200 dark:border-green-800',
            text: 'text-green-800 dark:text-green-200',
            icon: <Icons.CheckCircle className="text-green-500" size={20} />,
        },
        error: {
            bg: 'bg-red-50 dark:bg-red-900/20',
            border: 'border-red-200 dark:border-red-800',
            text: 'text-red-800 dark:text-red-200',
            icon: <Icons.X className="text-red-500" size={20} />,
        },
        warning: {
            bg: 'bg-orange-50 dark:bg-orange-900/20',
            border: 'border-orange-200 dark:border-orange-800',
            text: 'text-orange-800 dark:text-orange-200',
            icon: <Icons.Pending className="text-orange-500" size={20} />,
        },
        info: {
            bg: 'bg-blue-50 dark:bg-blue-900/20',
            border: 'border-blue-200 dark:border-blue-800',
            text: 'text-blue-800 dark:text-blue-200',
            icon: <Icons.View className="text-blue-500" size={20} />,
        },
    };

    const styles = typeStyles[toast.type];

    return (
        <div
            className={`
        flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg backdrop-blur-sm
        ${styles.bg} ${styles.border}
        animate-slideIn
        max-w-sm w-full
      `}
            role="alert"
        >
            {styles.icon}
            <p className={`flex-1 text-sm font-medium ${styles.text}`}>{toast.message}</p>
            <button
                onClick={() => onRemove(toast.id)}
                className={`${styles.text} opacity-60 hover:opacity-100 transition-opacity`}
            >
                <Icons.X size={16} />
            </button>
        </div>
    );
};

// Toast Container
const ToastContainer: React.FC<{ toasts: Toast[]; onRemove: (id: string) => void }> = ({ toasts, onRemove }) => {
    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
            {toasts.map(t => (
                <div key={t.id} className="pointer-events-auto">
                    <ToastItem toast={t} onRemove={onRemove} />
                </div>
            ))}
        </div>
    );
};

// Add animation to index.html or add this style tag
export const ToastStyles = () => (
    <style>{`
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    .animate-slideIn {
      animation: slideIn 0.3s ease-out;
    }
  `}</style>
);
