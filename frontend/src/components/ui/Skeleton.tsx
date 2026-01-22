// Skeleton Loading Components
// Reusable skeleton UI for loading states

interface SkeletonProps {
    className?: string;
}

// Basic skeleton box
export function Skeleton({ className = '' }: SkeletonProps) {
    return (
        <div className={`bg-gray-200 rounded animate-pulse ${className}`}></div>
    );
}

// Skeleton row for tables
export function SkeletonTableRow({ columns = 6 }: { columns?: number }) {
    return (
        <tr className="animate-pulse">
            {Array.from({ length: columns }).map((_, i) => (
                <td key={i} className="py-4 px-6">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </td>
            ))}
        </tr>
    );
}

// Dashboard specific skeleton
export function DashboardSkeleton() {
    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header Skeleton */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div>
                        <Skeleton className="h-6 w-64 mb-2" />
                        <Skeleton className="h-4 w-48" />
                    </div>
                    <Skeleton className="h-10 w-24 rounded-lg" />
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* Menu Cards Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    <Skeleton className="h-24 rounded-xl" />
                </div>

                {/* Table Skeleton */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                            <Skeleton className="h-8 w-48" />
                            <div className="flex gap-2">
                                <Skeleton className="h-10 w-64 rounded-lg" />
                                <Skeleton className="h-10 w-32 rounded-lg" />
                            </div>
                        </div>
                    </div>
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                {['w-12', 'w-8', 'w-16', 'w-12', 'w-12', 'w-16'].map((w, i) => (
                                    <th key={i} className="py-4 px-6 text-left">
                                        <Skeleton className={`h-4 ${w}`} />
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {[...Array(5)].map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-2">
                                            <Skeleton className="w-8 h-8 rounded-lg" />
                                            <Skeleton className="h-4 w-12" />
                                        </div>
                                    </td>
                                    <td className="py-4 px-6"><Skeleton className="h-4 w-16" /></td>
                                    <td className="py-4 px-6"><Skeleton className="h-4 w-24" /></td>
                                    <td className="py-4 px-6"><Skeleton className="h-4 w-12" /></td>
                                    <td className="py-4 px-6"><Skeleton className="h-6 w-20 rounded-full" /></td>
                                    <td className="py-4 px-6"><Skeleton className="h-8 w-20 rounded-lg" /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}

// Form page skeleton
export function FormSkeleton() {
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center py-8">
            <div className="w-[240mm] bg-white shadow-lg p-10">
                <Skeleton className="h-8 w-96 mx-auto mb-8" />
                <div className="space-y-4">
                    {[...Array(10)].map((_, i) => (
                        <div key={i} className="flex gap-4">
                            <Skeleton className="h-6 w-1/4" />
                            <Skeleton className="h-6 flex-1" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
