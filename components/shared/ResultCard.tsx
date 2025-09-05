
import React from 'react';
import { CopyButton } from './CopyButton.tsx';
import { ShareButton } from './ShareButton.tsx';

export const ResultCard: React.FC<{ title: React.ReactNode; children: React.ReactNode; copyText: string; }> = ({ title, children, copyText }) => (
    <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mt-4">
        <div className="absolute top-3 end-3 flex space-x-2 rtl:space-x-reverse">
            <ShareButton textToShare={copyText} title={typeof title === 'string' ? title : 'Marketing AI Content'} />
            <CopyButton textToCopy={copyText} />
        </div>
        <div className="pe-20">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">{title}</h3>
        </div>
        {children}
    </div>
);
