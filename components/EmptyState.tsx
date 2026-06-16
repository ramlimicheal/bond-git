import React from 'react';
import { Icons } from './Icon';

interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
    };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    icon,
    title,
    description,
    action,
}) => {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-16 h-16 mb-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                {icon || <Icons.List size={32} className="text-gray-400 dark:text-gray-500" />}
            </div>

            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {title}
            </h3>

            {description && (
                <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-6">
                    {description}
                </p>
            )}

            {action && (
                <button
                    onClick={action.onClick}
                    className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                    <Icons.Plus size={18} />
                    {action.label}
                </button>
            )}
        </div>
    );
};

// Pre-built empty states
export const NoInvoicesEmpty: React.FC<{ onCreateInvoice: () => void }> = ({ onCreateInvoice }) => (
    <EmptyState
        icon={<Icons.List size={32} className="text-gray-400 dark:text-gray-500" />}
        title="No invoices yet"
        description="Create your first invoice to get started tracking payments."
        action={{
            label: 'Create Invoice',
            onClick: onCreateInvoice,
        }}
    />
);

export const NoSearchResultsEmpty: React.FC<{ query: string }> = ({ query }) => (
    <EmptyState
        icon={<Icons.Search size={32} className="text-gray-400 dark:text-gray-500" />}
        title="No results found"
        description={`We couldn't find any invoices matching "${query}". Try adjusting your search.`}
    />
);

export const NoUsersEmpty: React.FC<{ onCreateUser: () => void }> = ({ onCreateUser }) => (
    <EmptyState
        icon={<Icons.User size={32} className="text-gray-400 dark:text-gray-500" />}
        title="No users yet"
        description="Add team members to help manage your invoices."
        action={{
            label: 'Add User',
            onClick: onCreateUser,
        }}
    />
);

// Error state component
export const ErrorState: React.FC<{
    title?: string;
    description?: string;
    onRetry?: () => void;
}> = ({
    title = 'Something went wrong',
    description = 'We encountered an error loading data. Please try again.',
    onRetry
}) => (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-16 h-16 mb-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <Icons.X size={32} className="text-red-500" />
            </div>

            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {title}
            </h3>

            <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-6">
                {description}
            </p>

            {onRetry && (
                <button
                    onClick={onRetry}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                    Try Again
                </button>
            )}
        </div>
    );
