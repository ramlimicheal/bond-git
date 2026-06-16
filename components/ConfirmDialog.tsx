import React from 'react';
import { Icons } from './Icon';

interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
    onCancel: () => void;
    loading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    isOpen,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'danger',
    onConfirm,
    onCancel,
    loading = false,
}) => {
    if (!isOpen) return null;

    const variantStyles = {
        danger: {
            icon: <Icons.Trash size={24} className="text-red-500" />,
            iconBg: 'bg-red-100 dark:bg-red-900/30',
            confirmBtn: 'bg-red-600 hover:bg-red-700 text-white',
        },
        warning: {
            icon: <Icons.Pending size={24} className="text-orange-500" />,
            iconBg: 'bg-orange-100 dark:bg-orange-900/30',
            confirmBtn: 'bg-orange-600 hover:bg-orange-700 text-white',
        },
        info: {
            icon: <Icons.View size={24} className="text-gray-500" />,
            iconBg: 'bg-blue-100 dark:bg-blue-900/30',
            confirmBtn: 'bg-gray-900 hover:bg-gray-800 text-white',
        },
    };

    const styles = variantStyles[variant];

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
            <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden animate-scaleIn">

                <div className="p-6">
                    <div className="flex items-start gap-4">
                        <div className={`flex-shrink-0 w-12 h-12 rounded-full ${styles.iconBg} flex items-center justify-center`}>
                            {styles.icon}
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                                {title}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {message}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 flex gap-3 justify-end">
                    <button
                        onClick={onCancel}
                        disabled={loading}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-white dark:hover:bg-gray-800 transition-colors font-medium disabled:opacity-50"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className={`px-4 py-2 rounded-lg transition-colors font-medium disabled:opacity-50 flex items-center gap-2 ${styles.confirmBtn}`}
                    >
                        {loading && (
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                        )}
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Hook for easier dialog management
export function useConfirmDialog() {
    const [dialogState, setDialogState] = React.useState<{
        isOpen: boolean;
        title: string;
        message: string;
        variant: 'danger' | 'warning' | 'info';
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: '',
        message: '',
        variant: 'danger',
        onConfirm: () => { },
    });

    const confirm = React.useCallback((options: {
        title: string;
        message: string;
        variant?: 'danger' | 'warning' | 'info';
        confirmLabel?: string;
        cancelLabel?: string;
    }): Promise<boolean> => {
        return new Promise((resolve) => {
            setDialogState({
                isOpen: true,
                title: options.title,
                message: options.message,
                variant: options.variant || 'danger',
                onConfirm: () => {
                    setDialogState(prev => ({ ...prev, isOpen: false }));
                    resolve(true);
                },
            });
        });
    }, []);

    const cancel = React.useCallback(() => {
        setDialogState(prev => ({ ...prev, isOpen: false }));
    }, []);

    const DialogComponent = (
        <ConfirmDialog
            isOpen={dialogState.isOpen}
            title={dialogState.title}
            message={dialogState.message}
            variant={dialogState.variant}
            onConfirm={dialogState.onConfirm}
            onCancel={cancel}
        />
    );

    return { confirm, cancel, DialogComponent };
}
