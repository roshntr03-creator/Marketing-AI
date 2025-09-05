import React from 'react';
import { Spinner } from '../Spinner.tsx';

export const FullScreenLoader: React.FC = () => (
    <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
        <Spinner />
    </div>
);
