import React, { useState } from 'react';
import { useLocalization } from '../context/LocalizationContext.ts';
import { STRINGS } from '../constants.ts';
import { Language, AppView } from '../types.ts';
import { useAuth } from '../context/AuthContext.tsx';

interface HeaderProps {
  toggleTheme: () => void;
  isDarkMode: boolean;
  activeView: AppView;
  setActiveView: (view: AppView) => void;
}

const SunIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

const MoonIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const ProfileDropdown: React.FC<{ setActiveView: (view: AppView) => void }> = ({ setActiveView }) => {
    const { user, logout } = useAuth();
    const { language } = useLocalization();
    const s = STRINGS[language];
    const [isOpen, setIsOpen] = useState(false);
    
    if (!user) return null;

    const userInitial = user.name ? user.name.charAt(0).toUpperCase() : '?';
    
    const handleNavigation = (view: AppView) => {
        setActiveView(view);
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <button onClick={() => setIsOpen(!isOpen)} className="w-10 h-10 rounded-full bg-primary-500 text-white flex items-center justify-center text-xl font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-800">
                {userInitial}
            </button>
            {isOpen && (
                <div className="absolute end-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-20">
                    <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-700 dark:text-gray-200">{user.name}</p>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                    </div>
                     <a href="#" onClick={(e) => { e.preventDefault(); handleNavigation(AppView.SETTINGS); }} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                        {s.settings}
                    </a>
                    <a href="#" onClick={(e) => { e.preventDefault(); logout(); }} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                        {s.logout}
                    </a>
                </div>
            )}
        </div>
    );
};

export const Header: React.FC<HeaderProps> = ({ toggleTheme, isDarkMode, activeView, setActiveView }) => {
  const { language, setLanguage } = useLocalization();
  const s = STRINGS[language];
  const { user } = useAuth();

  const handleLanguageToggle = () => {
    const newLang = language === Language.EN ? Language.AR : Language.EN;
    setLanguage(newLang);
  };

  const getTitle = () => {
    if (!user) return s.appName;
    switch(activeView) {
        case AppView.DASHBOARD:
            return s.dashboardTitle;
        case AppView.SEO:
            return s.seoTitle;
        case AppView.ADS:
            return s.adsTitle;
        case AppView.CONTENT:
            return s.contentTitle;
        case AppView.SMM:
            return s.smmTitle;
        case AppView.INFLUENCERS:
            return s.influencersTitle;
        case AppView.OPTIMIZER:
            return s.optimizerTitle;
        case AppView.LANDING_PAGES:
            return s.landingPagesTitle;
        case AppView.EMAIL:
            return s.emailMarketingTitle;
        case AppView.AFFILIATE:
            return s.affiliateMarketingTitle;
        case AppView.CRM:
            return s.crmTitle;
        case AppView.ANALYTICS:
            return s.adAnalyticsTitle;
        case AppView.TESTING:
            return s.testingTitle;
        case AppView.MORE:
            return s.moreTitle;
        case AppView.SETTINGS:
            return s.settingsTitle;
        case AppView.CONNECTING:
            return s.settingsTitle; // Keep it simple
        case AppView.OAUTH_CALLBACK:
            return s.finalizingConnection;
        default:
            return s.appName;
    }
  }

  return (
    <header className="flex items-center justify-between px-4 sm:px-6 py-4 bg-white dark:bg-gray-800 border-b dark:border-gray-700 shadow-sm">
       <div className="flex items-center space-x-2 rtl:space-x-reverse">
         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24" fill="currentColor" className="w-7 h-7 text-primary-500">
            <path d="M12.378 1.602a.75.75 0 00-.756 0L3 6.632l9 5.25 9-5.25-8.622-5.03zM21.75 7.93l-9 5.25v9l8.628-5.032a.75.75 0 00.372-.648V7.93zM12 22.18v-9l-9-5.25v8.57a.75.75 0 00.372-.648l8.628 5.033z" />
        </svg>
        <h1 className="text-xl font-semibold text-gray-700 dark:text-gray-200">{getTitle()}</h1>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-4 rtl:space-x-reverse">
        <button
          onClick={handleLanguageToggle}
          className="flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          aria-label={s.changeLanguage}
        >
          {language === Language.EN ? 'AR' : 'EN'}
        </button>

        <button
          onClick={toggleTheme}
          className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          aria-label={s.toggleTheme}
        >
          {isDarkMode ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
        </button>
        {user && <ProfileDropdown setActiveView={setActiveView} />}
      </div>
    </header>
  );
};