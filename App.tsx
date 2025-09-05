
import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header.tsx';
import { BottomNavBar } from './components/BottomNavBar.tsx';
import { LocalizationProvider, useLocalization } from './context/LocalizationContext.ts';
import { Language, AppView, User } from './types.ts';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import Login from './components/auth/Login.tsx';
import SignUp from './components/auth/SignUp.tsx';

import Dashboard from './components/Dashboard.tsx';
import SeoAssistant from './components/SeoAssistant.tsx';
import AdsAssistant from './components/AdsAssistant.tsx';
import ContentAssistant from './components/ContentAssistant.tsx';
import SmmAssistant from './components/SmmAssistant.tsx';
import InfluencerAssistant from './components/InfluencerAssistant.tsx';
import OptimizerAssistant from './components/OptimizerAssistant.tsx';
import LandingPageAssistant from './components/LandingPageAssistant.tsx';
import EmailAssistant from './components/EmailAssistant.tsx';
import AffiliateAssistant from './components/AffiliateAssistant.tsx';
import CrmAssistant from './components/CrmAssistant.tsx';
import AnalyticsAssistant from './components/AnalyticsAssistant.tsx';
import TestingSuite from './components/TestingSuite.tsx';
import MoreView from './components/MoreView.tsx';
import Settings from './components/Settings.tsx';
import Connecting from './components/Connecting.tsx';
import OAuthCallback from './components/OAuthCallback.tsx';
import { FullScreenLoader } from './components/shared/FullScreenLoader.tsx';
import { STRINGS } from './constants.ts';

const LockIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
);

const SubscriptionWall: React.FC = () => {
    const { language } = useLocalization();
    const s = STRINGS[language];

    const handleSubscribe = () => {
        // Placeholder for subscription flow
        alert('Subscription flow is not implemented yet.');
    };

    return (
        <div className="flex flex-col items-center justify-center text-center p-8 mt-10">
            <div className="bg-white dark:bg-gray-800 p-10 rounded-lg shadow-md flex flex-col items-center max-w-lg">
                <LockIcon className="w-24 h-24 text-gray-300 dark:text-gray-600 mb-6" />
                <h2 className="text-3xl font-bold text-gray-700 dark:text-gray-300 mb-2">{s.subscriptionRequired}</h2>
                <p className="max-w-md text-gray-600 dark:text-gray-400 mb-8">{s.subscriptionMessage}</p>
                <button
                    onClick={handleSubscribe}
                    className="px-8 py-3 font-medium tracking-wide text-white capitalize transition-colors duration-200 transform bg-primary-600 rounded-md hover:bg-primary-500 focus:outline-none focus:ring focus:ring-primary-300 focus:ring-opacity-80"
                >
                    {s.subscribeNow}
                </button>
            </div>
        </div>
    );
};

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });
  
  const [language, setLanguage] = useState<Language>(Language.AR);
  const [activeView, setActiveView] = useState<AppView>(AppView.DASHBOARD);
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');
  
  const [connections, setConnections] = useState({
    facebook: false,
    instagram: false,
  });
  const [connectingPlatform, setConnectingPlatform] = useState<'facebook' | 'instagram' | null>(null);
  const [oauthParams, setOauthParams] = useState<{platform: string; code: string} | null>(null);

  useEffect(() => {
    // Check for OAuth callback parameters on initial load
    const params = new URLSearchParams(window.location.search);
    const platform = params.get('platform');
    const code = params.get('code');

    if (platform && code) {
        setOauthParams({ platform, code });
        setActiveView(AppView.OAUTH_CALLBACK);
        // Clean the URL to avoid re-triggering the callback flow on refresh
        window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const startConnectionFlow = (platform: 'facebook' | 'instagram') => {
      setConnectingPlatform(platform);
      setActiveView(AppView.CONNECTING);
  };

  const completeConnection = (platform: 'facebook' | 'instagram', status: boolean) => {
      setConnections(prev => ({ ...prev, [platform]: status }));
  };
  
  const handleConnectionChange = (platform: 'facebook' | 'instagram', status: boolean) => {
      if (status) { // User wants to connect, start the flow
          startConnectionFlow(platform);
      } else { // User wants to disconnect
          setConnections(prev => ({ ...prev, [platform]: false }));
      }
  };


  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === Language.AR ? 'rtl' : 'ltr';
  }, [language]);

  const hasAccess = useMemo(() => {
    if (!user) {
      return false;
    }
    // Admin has free access
    if (user.role === 'admin') {
      return true;
    }
    // Other users need an active subscription
    return user.subscription_status === 'active';
  }, [user]);


  const toggleTheme = () => setIsDarkMode(prev => !prev);
  const toggleLanguage = () => setLanguage(prev => prev === Language.EN ? Language.AR : Language.EN);

  const localizationContextValue = useMemo(() => ({ language, setLanguage: toggleLanguage }), [language]);

  const renderActiveView = () => {
    switch(activeView) {
      case AppView.DASHBOARD:
        return <Dashboard setActiveView={setActiveView} />;
      case AppView.SEO:
        return <SeoAssistant />;
      case AppView.ADS:
        return <AdsAssistant />;
      case AppView.CONTENT:
        return <ContentAssistant />;
      case AppView.SMM:
        return <SmmAssistant />;
      case AppView.INFLUENCERS:
        return <InfluencerAssistant />;
       case AppView.OPTIMIZER:
        return <OptimizerAssistant />;
      case AppView.LANDING_PAGES:
        return <LandingPageAssistant />;
      case AppView.EMAIL:
        return <EmailAssistant />;
      case AppView.AFFILIATE:
          return <AffiliateAssistant />;
      case AppView.CRM:
          return <CrmAssistant />;
      case AppView.ANALYTICS:
          return <AnalyticsAssistant connections={connections} setActiveView={setActiveView} />;
      case AppView.TESTING:
          return <TestingSuite />;
      case AppView.MORE:
          return <MoreView setActiveView={setActiveView} />;
      case AppView.SETTINGS:
          return <Settings connections={connections} onConnectionChange={handleConnectionChange} />;
      case AppView.CONNECTING:
// FIX: Removed unused `setActiveView` prop from Connecting component.
          return <Connecting platform={connectingPlatform!} />;
      case AppView.OAUTH_CALLBACK:
          return <OAuthCallback
                      platform={oauthParams!.platform as 'facebook' | 'instagram'}
                      code={oauthParams!.code}
                      onConnectionSuccess={completeConnection}
                      setActiveView={setActiveView}
                  />;
      default:
        return <Dashboard setActiveView={setActiveView} />;
    }
  }
  
  if (loading) {
    return <FullScreenLoader />;
  }

  if (!user) {
    return (
      <LocalizationProvider value={localizationContextValue}>
        <div className="bg-gray-100 dark:bg-gray-900">
           {authView === 'login' ? (
             <Login onSwitchToSignUp={() => setAuthView('signup')} />
           ) : (
             <SignUp onSwitchToLogin={() => setAuthView('login')} />
           )}
        </div>
      </LocalizationProvider>
    )
  }

  return (
    <LocalizationProvider value={localizationContextValue}>
      <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-[Tajawal]">
        <Header 
            toggleTheme={toggleTheme} 
            isDarkMode={isDarkMode} 
            activeView={activeView}
            setActiveView={setActiveView}
        />
        <main className="flex-1 overflow-y-auto pb-20">
          <div className="container mx-auto px-4 sm:px-6 py-8">
            {hasAccess ? renderActiveView() : <SubscriptionWall />}
          </div>
        </main>
        {hasAccess && <BottomNavBar activeView={activeView} setActiveView={setActiveView} />}
      </div>
    </LocalizationProvider>
  );
};


const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
