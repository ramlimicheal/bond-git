import React from 'react';

interface SkeletonProps {
    className?: string;
    variant?: 'card' | 'line' | 'circle' | 'rect';
    width?: string | number;
    height?: string | number;
    count?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
    className = '',
    variant = 'rect',
    width,
    height,
    count = 1,
}) => {
    const baseClasses = 'animate-pulse bg-gray-200 dark:bg-gray-700 rounded';

    const getVariantClasses = () => {
        switch (variant) {
            case 'circle':
                return 'rounded-full';
            case 'line':
                return 'h-4 rounded-md';
            case 'card':
                return 'rounded-xl';
            default:
                return '';
        }
    };

    const style: React.CSSProperties = {};
    if (width) style.width = typeof width === 'number' ? `${width}px` : width;
    if (height) style.height = typeof height === 'number' ? `${height}px` : height;

    const elements = Array.from({ length: count }, (_, i) => (
        <div
            key={i}
            className={`${baseClasses} ${getVariantClasses()} ${className}`}
            style={style}
        />
    ));

    return <>{elements}</>;
};

// Pre-built Skeleton Components
export const InvoiceCardSkeleton: React.FC = () => (
    <div className="border rounded-xl p-6 bg-white dark:bg-gray-850 border-gray-200 dark:border-gray-750 animate-pulse">
        <div className="flex justify-between items-start mb-4">
            <div className="flex gap-3">
                <Skeleton variant="circle" width={40} height={40} />
                <div className="space-y-2">
                    <Skeleton width={100} height={16} />
                    <Skeleton width={60} height={12} />
                </div>
            </div>
            <Skeleton width={80} height={24} className="rounded-full" />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="space-y-1">
                <Skeleton width={60} height={10} />
                <Skeleton width={80} height={14} />
            </div>
            <div className="space-y-1 text-right">
                <Skeleton width={60} height={10} className="ml-auto" />
                <Skeleton width={80} height={14} className="ml-auto" />
            </div>
        </div>

        <div className="flex gap-2">
            <Skeleton height={36} className="flex-1 rounded-md" />
            <Skeleton height={36} className="flex-1 rounded-md" />
        </div>
    </div>
);

export const InvoiceListItemSkeleton: React.FC = () => (
    <div className="border rounded-lg p-4 bg-white dark:bg-gray-850 border-gray-200 dark:border-gray-750 flex items-center gap-4 animate-pulse">
        <Skeleton variant="circle" width={20} height={20} />
        <div className="flex items-center gap-4 flex-1">
            <Skeleton variant="circle" width={40} height={40} />
            <div className="space-y-2">
                <Skeleton width={100} height={16} />
                <Skeleton width={80} height={12} />
            </div>
        </div>
        <Skeleton width={100} height={14} />
        <Skeleton width={80} height={14} />
        <Skeleton width={70} height={24} className="rounded-full" />
    </div>
);

export const StatCardSkeleton: React.FC = () => (
    <div className="bg-white dark:bg-gray-850 border border-gray-200 dark:border-gray-750 rounded-xl p-6 animate-pulse">
        <div className="flex justify-between items-start mb-4">
            <Skeleton width={100} height={14} />
            <Skeleton width={60} height={20} className="rounded-full" />
        </div>
        <Skeleton width={120} height={32} className="mb-2" />
        <Skeleton width={80} height={12} />
    </div>
);

export const TableRowSkeleton: React.FC<{ columns?: number }> = ({ columns = 5 }) => (
    <tr className="animate-pulse">
        {Array.from({ length: columns }, (_, i) => (
            <td key={i} className="px-4 py-4">
                <Skeleton width={i === 0 ? 150 : 80} height={16} />
            </td>
        ))}
    </tr>
);

// Loading state wrapper
export const LoadingState: React.FC<{
    loading: boolean;
    skeleton: React.ReactNode;
    children: React.ReactNode
}> = ({ loading, skeleton, children }) => {
    return loading ? <>{skeleton}</> : <>{children}</>;
};
