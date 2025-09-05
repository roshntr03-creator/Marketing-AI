import React, { useEffect } from 'react';
import { useLocalization } from '../context/LocalizationContext.ts';
import { STRINGS } from '../constants.ts';
import { Spinner } from './Spinner.tsx';

interface ConnectingProps {
    platform: 'facebook' | 'instagram';
}

// In a real application, these should come from environment variables
// and you must configure them in your Facebook Developer App settings.
const FACEBOOK_CLIENT_ID = 'YOUR_FACEBOOK_CLIENT_ID'; 
// This must be one of the "Valid OAuth Redirect URIs" in your FB App settings.
const REDIRECT_URI = window.location.origin + window.location.pathname;

const Connecting: React.FC<ConnectingProps> = ({ platform }) => {
    const { language } = useLocalization();
    const s = STRINGS[language];
    
    const platformName = platform.charAt(0).toUpperCase() + platform.slice(1);

    useEffect(() => {
        const initiateOAuthFlow = () => {
            // The state parameter should be a random, unguessable string to prevent CSRF attacks.
            const state = `st=${Date.now()}`; // Simplified for this example
            
            let authUrl = '';
            
            if (platform === 'facebook') {
                const scope = 'read_insights,ads_read';
                authUrl = `https://www.facebook.com/v20.0/dialog/oauth?client_id=${FACEBOOK_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&state=${state}&scope=${scope}&response_type=code`;
            } else if (platform === 'instagram') {
                // NOTE: Instagram uses the Facebook login dialog for Business accounts.
                // The required permissions are different. This is a simplified example.
                const scope = 'instagram_basic,instagram_manage_insights,pages_show_list,ads_read';
                authUrl = `https://www.facebook.com/v20.0/dialog/oauth?client_id=${FACEBOOK_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&state=${state}&scope=${scope}&response_type=code`;
            }

            if (authUrl) {
                // Redirect the user to the actual authentication page
                window.location.href = authUrl;
            }
        };

        // Start the flow shortly after the component mounts to show the loading message
        const timer = setTimeout(initiateOAuthFlow, 1500);

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
