import React from 'react';
import { useLocalization } from '../context/LocalizationContext.ts';
import { STRINGS } from '../constants.ts';
import { FacebookIcon } from './icons/FacebookIcon.tsx';
import { InstagramIcon } from './icons/InstagramIcon.tsx';

interface SettingsProps {
    connections: {
        facebook: boolean;
        instagram: boolean;
    };
    onConnectionChange: (platform: 'facebook' | 'instagram', status: boolean) => void;
}

const ConnectionCard: React.FC<{
    platform: 'facebook' | 'instagram';
    icon: React.ReactNode;
    isConnected: boolean;
    onToggle: (status: boolean) => void;
}> = ({ platform, icon, isConnected, onToggle }) => {
    const { language } = useLocalization();
    const s = STRINGS[language];
    
    const platformName = platform.charAt(0).toUpperCase() + platform.slice(1);

    return (
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border dark:border-gray-700">
            <div className="flex items-center">
                <div className="p-2 bg-white dark:bg-gray-800 rounded-lg mr-4 rtl:ml-4 rtl:mr-0">
                    {icon}
                </div>
                <div>
                    <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200">{platformName}</h3>
                    {isConnected && (
                        <span className="text-sm font-medium text-green-600 dark:text-green-400">{s.connected}</span>
                    )}
                </div>
            </div>
            <button
                onClick={() => onToggle(!isConnected)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    isConnected
                        ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/50 dark:text-red-400 dark:hover:bg-red-900'
                        : 'bg-primary-600 text-white hover:bg-primary-500'
                }`}
            >
                {isConnected ? s.disconnect : s.connect}
            </button>
        </div>
    );
};

const Settings: React.FC<SettingsProps> = ({ connections, onConnectionChange }) => {
    const { language } = useLocalization();
    const s = STRINGS[language];

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{s.settingsTitle}</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">{s.connectionsDescription}</p>

                <div className="space-y-4">
                    <ConnectionCard
                        platform="facebook"
                        icon={<FacebookIcon className="w-6 h-6" />}
                        isConnected={connections.facebook}
                        onToggle={(status) => onConnectionChange('facebook', status)}
                    />
                    <ConnectionCard
                        platform="instagram"
                        icon={<InstagramIcon className="w-6 h-6" />}
                        isConnected={connections.instagram}
                        onToggle={(status) => onConnectionChange('instagram', status)}
                    />
                </div>
            </div>
        </div>
    );
};

export default Settings;