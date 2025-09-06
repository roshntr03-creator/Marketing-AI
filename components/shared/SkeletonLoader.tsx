import React from 'react';

export const SkeletonLoader: React.FC = () => (
    <div className="animate-pulse">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mt-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-6"></div>
            <div className="space-y-4">
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                 <div className="flex justify-end">
                    <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
                </div>
            </div>
        </div>

        <div className="mt-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
             <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
             <div className="space-y-3">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
             </div>
        </div>
    </div>
);
