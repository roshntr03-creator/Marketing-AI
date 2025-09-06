import React from 'react';
import { useLocalization } from '../context/LocalizationContext.ts';
import { STRINGS } from '../constants.ts';
import { AppView } from '../types.ts';
import { AdIcon } from './icons/AdIcon.tsx';
import { ContentIcon } from './icons/ContentIcon.tsx';
import { DashboardIcon } from './icons/DashboardIcon.tsx';
import { AnalyticsIcon } from './icons/AnalyticsIcon.tsx';
import { MoreIcon } from './icons/MoreIcon.tsx';
import { triggerHapticFeedback } from '../utils/haptics.ts';

interface BottomNavBarProps {
  activeView: AppView;
  setActiveView: (view: AppView) => void;
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, isActive, onClick }) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    triggerHapticFeedback();
    onClick();
  }
  return (
    <a
      href="#"
      onClick={handleClick}
      className={`flex flex-col items-center justify-center w-full pt-2 pb-1 text-xs sm:text-sm transition-colors duration-200 ${
        isActive
          ? 'text-primary-600 dark:text-primary-400'
          : 'text-gray-500 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400'
      }`}
    >
      {icon}
      <span className="mt-1 font-medium">{label}</span>
    </a>
  );
};

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeView, setActiveView }) => {
  const { language } = useLocalization();
  const s = STRINGS[language];
  
  const mainViews = [
    { view: AppView.DASHBOARD, label: s.dashboard, icon: <DashboardIcon className="w-6 h-6" /> },
    { view: AppView.ADS, label: s.adsAi, icon: <AdIcon className="w-6 h-6" /> },
    { view: AppView.CONTENT, label: s.shortForm, icon: <ContentIcon className="w-6 h-6" /> },
    { view: AppView.ANALYTICS, label: s.analytics, icon: <AnalyticsIcon className="w-6 h-6" /> },
    { view: AppView.MORE, label: s.more, icon: <MoreIcon className="w-6 h-6" /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t dark:border-gray-700 shadow-t-lg z-50">
      <div className="flex justify-around max-w-screen-md mx-auto">
        {mainViews.map((item) => (
          <NavItem
            key={item.view}
            icon={item.icon}
            label={item.label}
            isActive={activeView === item.view}
            onClick={() => setActiveView(item.view)}
          />
        ))}
      </div>
    </nav>
  );
};
