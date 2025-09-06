import React, { useState, useEffect } from 'react';
import { useLocalization } from '../context/LocalizationContext.ts';
import { STRINGS } from '../constants.ts';
import { AppView } from '../types.ts';
import { handleOAuthCallback } from '../services/oauthService.ts';
import { Spinner } from './Spinner.tsx';
import { CheckIcon } from './icons/CheckIcon.tsx';
import { XCircleIcon } from './icons/XCircleIcon.tsx';

type Status = 'loading' | 'success' | 'error';

interface OAuthCallbackProps {
    platform: 'facebook' | 'instagram';
    code: string;
    onConnectionSuccess: (platform: 'facebook' | 'instagram', status: boolean) => void;
    setActiveView: (view: AppView) => void;
}

const OAuthCallback: React.FC<OAuthCallbackProps> = ({ platform, code, onConnectionSuccess, setActiveView }) => {
    const { language } = useLocalization();
    const s = STRINGS[language];
    const [status, setStatus] = useState<Status>('loading');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const processCallback = async () => {
            try {
                await handleOAuthCallback(code, platform);
                onConnectionSuccess(platform, true);
                setStatus('success');
                setTimeout(() => {
                    setActiveView(AppView.SETTINGS);
                }, 2000);
            } catch (err: any) {
                setErrorMessage(err.message || s.connectionErrorMessage);
                onConnectionSuccess(platform, false);
                setStatus('error');
            }
        };

        processCallback();
    }, [code, platform, onConnectionSuccess, setActiveView, s.connectionErrorMessage]);
    
    const renderContent = () => {
        switch (status) {
            case 'loading':
                return (
                    <>
                        <Spinner />
                        <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mt-4">{s.finalizingConnection}</h2>
                    </>
                );
            case 'success':
                return (
                    <>
                        <CheckIcon className="w-16 h-16 text-green-500" />
                        <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mt-4">{s.connectionSuccessful}</h2>
                        <p className="text-gray-600 dark:text-gray-400">{s.redirectingMessage}</p>
                    </>
                );
            case 'error':
                 return (
                    <>
                        <XCircleIcon className="w-16 h-16 text-red-500" />
                        <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mt-4">{s.connectionFailed}</h2>
                        <p className="text-gray-600 dark:text-gray-400">{errorMessage}</p>
                         <button
                            onClick={() => setActiveView(AppView.SETTINGS)}
                            className="mt-6 px-6 py-2 font-medium tracking-wide text-white capitalize transition-colors duration-200 transform bg-primary-600 rounded-md hover:bg-primary-500 focus:outline-none focus:ring focus:ring-primary-300"
                        >
                            {s.backToSettings}
                        </button>
                    </>
                );
        }
    }

    return (
        <div className="flex flex-col items-center justify-center text-center p-4 mt-20">
            <div className="bg-white dark:bg-gray-800 p-10 rounded-lg shadow-md flex flex-col items-center min-h-[250px] justify-center">
                {renderContent()}
            </div>
        </div>
    );
};

export default OAuthCallback;
