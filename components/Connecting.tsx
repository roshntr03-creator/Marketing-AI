
import React, { useEffect } from 'react';
import { useLocalization } from '../context/LocalizationContext.ts';
import { STRINGS } from '../constants.ts';
import { Spinner } from './Spinner.tsx';
import { FACEBOOK_APP_ID } from '../config.ts';

interface ConnectingProps {
    platform: 'facebook' | 'instagram';
}

const Connecting: React.FC<ConnectingProps> = ({ platform }) => {
    const { language } = useLocalization();
    const s = STRINGS[language];
    
    const platformName = platform.charAt(0).toUpperCase() + platform.slice(1);

    useEffect(() => {
        // FIX: Removed check for placeholder App ID.
        // A valid ID is now provided in config.ts, and the previous check
        // `FACEBOOK_APP_ID === 'YOUR_FACEBOOK_APP_ID_HERE'` caused a TypeScript error
        // because the two literal types had no overlap. The configuration warning
        // logic is no longer needed.
        const initiateRealOAuthRedirect = () => {
            const redirectUri = window.location.origin + window.location.pathname;
            const state = `st=${Date.now()}`; // Basic CSRF protection
            const scope = 'public_profile,email,ads_read,instagram_basic';
            
            // Construct the real Facebook OAuth URL
            const facebookAuthUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${FACEBOOK_APP_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${encodeURIComponent(scope)}`;

            // Redirect the user to Facebook to authorize the app
            window.location.href = facebookAuthUrl;
        };

        const timer = setTimeout(initiateRealOAuthRedirect, 1500);

        return () => clearTimeout(timer);
    }, [platform]);

    return (
        <div className="flex flex-col items-center justify-center text-center p-4 mt-20">
            <div className="bg-white dark:bg-gray-800 p-10 rounded-lg shadow-md flex flex-col items-center min-h-[250px] justify-center">
                <Spinner />
                <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mt-4">
                    {s.redirectingToPlatform.replace('{platform}', platformName)}
                </h2>
            </div>
        </div>
    );
};

export default Connecting;
