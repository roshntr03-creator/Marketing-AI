import React from 'react';
import { useLocalization } from '../context/LocalizationContext.ts';
import { STRINGS } from '../constants.ts';
import { AppView } from '../types.ts';
import { SmmIcon } from './icons/SmmIcon.tsx';
import { InfluencerIcon } from './icons/InfluencerIcon.tsx';
import { LandingPageIcon } from './icons/LandingPageIcon.tsx';
import { EmailIcon } from './icons/EmailIcon.tsx';
import { AffiliateIcon } from './icons/AffiliateIcon.tsx';
import { CrmIcon } from './icons/CrmIcon.tsx';
import { TestTubeIcon } from './icons/TestTubeIcon.tsx';
import { OptimizerIcon } from './icons/OptimizerIcon.tsx';
import { SettingsIcon } from './icons/SettingsIcon.tsx';

interface MoreViewProps {
  setActiveView: (view: AppView) => void;
}

interface ToolListItemProps {
  icon: React.ReactNode;
  title: string;
  onClick: () => void;
}

const ArrowIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
);
const ArrowIconRTL: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
);


const ToolListItem: React.FC<ToolListItemProps> = ({ icon, title, onClick }) => {
    const { language } = useLocalization();
    return (
        <button
            onClick={onClick}
            className="flex items-center w-full px-4 py-4 text-start bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
        >
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300">
                {icon}
            </div>
            <span className="flex-1 mx-4 font-medium text-gray-800 dark:text-gray-200">{title}</span>
            {language === 'ar' ? <ArrowIconRTL /> : <ArrowIcon />}
        </button>
    );
};


const MoreView: React.FC<MoreViewProps> = ({ setActiveView }) => {
  const { language } = useLocalization();
  const s = STRINGS[language];

  const tools = [
    { view: AppView.SMM, title: s.smm, icon: <SmmIcon className="w-6 h-6" /> },
    { view: AppView.INFLUENCERS, title: s.influencers, icon: <InfluencerIcon className="w-6 h-6" /> },
    { view: AppView.OPTIMIZER, title: s.optimizerTitle, icon: <OptimizerIcon className="w-6 h-6" /> },
    { view: AppView.LANDING_PAGES, title: s.landingPages, icon: <LandingPageIcon className="w-6 h-6" /> },
    { view: AppView.EMAIL, title: s.emailMarketing, icon: <EmailIcon className="w-6 h-6" /> },
    { view: AppView.AFFILIATE, title: s.affiliateMarketing, icon: <AffiliateIcon className="w-6 h-6" /> },
    { view: AppView.CRM, title: s.crm, icon: <CrmIcon className="w-6 h-6" /> },
    { view: AppView.TESTING, title: s.testingTitle, icon: <TestTubeIcon className="w-6 h-6" /> },
    { view: AppView.SETTINGS, title: s.settings, icon: <SettingsIcon className="w-6 h-6" /> },
  ];

  return (
    <div className="max-w-2xl mx-auto">
        <div className="overflow-hidden rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {tools.map(tool => (
                <ToolListItem
                    key={tool.view}
                    title={tool.title}
                    icon={tool.icon}
                    onClick={() => setActiveView(tool.view)}
                />
                ))}
            </div>
        </div>
    </div>
  );
};

export default MoreView;