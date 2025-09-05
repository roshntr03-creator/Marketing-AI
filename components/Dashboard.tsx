
import React from 'react';
import { useLocalization } from '../context/LocalizationContext.ts';
import { STRINGS } from '../constants.ts';
import { AppView, Language } from '../types.ts';
import { AdIcon } from './icons/AdIcon.tsx';
import { ContentIcon } from './icons/ContentIcon.tsx';
import { SmmIcon } from './icons/SmmIcon.tsx';
import { LandingPageIcon } from './icons/LandingPageIcon.tsx';
import { EmailIcon } from './icons/EmailIcon.tsx';
import { AffiliateIcon } from './icons/AffiliateIcon.tsx';
import { CrmIcon } from './icons/CrmIcon.tsx';
import { AnalyticsIcon } from './icons/AnalyticsIcon.tsx';
import { InfluencerIcon } from './icons/InfluencerIcon.tsx';
import { SeoIcon } from './icons/SeoIcon.tsx';
import { OptimizerIcon } from './icons/OptimizerIcon.tsx';

interface DashboardProps {
  setActiveView: (view: AppView) => void;
}

interface ToolCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}

const ToolCard: React.FC<ToolCardProps> = ({ icon, title, description, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="text-start w-full bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500 h-full flex flex-col"
    >
      <div className="flex items-center justify-center w-12 h-12 mb-4 bg-primary-100 dark:bg-primary-900/50 rounded-full text-primary-600 dark:text-primary-300 flex-shrink-0">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400 flex-grow">{description}</p>
    </button>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ setActiveView }) => {
  const { language } = useLocalization();
  const s = STRINGS[language];

  const toolGroups = [
      {
          title: language === Language.AR ? "نمو الجمهور" : "Audience Growth",
          tools: [
            { view: AppView.SEO, title: s.seoTitle, description: s.seoDescription, icon: <SeoIcon className="w-6 h-6" /> },
            { view: AppView.INFLUENCERS, title: s.influencers, description: s.influencersCardDescription, icon: <InfluencerIcon className="w-6 h-6" /> },
            { view: AppView.OPTIMIZER, title: s.optimizerTitle, description: s.optimizerDescription, icon: <OptimizerIcon className="w-6 h-6" /> },
          ]
      },
      {
          title: language === Language.AR ? "إنشاء المحتوى" : "Content Creation",
          tools: [
            { view: AppView.CONTENT, title: s.shortForm, description: s.contentCardDescription, icon: <ContentIcon className="w-6 h-6" /> },
            { view: AppView.SMM, title: s.smm, description: s.smmCardDescription, icon: <SmmIcon className="w-6 h-6" /> },
            { view: AppView.LANDING_PAGES, title: s.landingPages, description: s.landingPagesCardDescription, icon: <LandingPageIcon className="w-6 h-6" /> },
          ]
      },
      {
          title: language === Language.AR ? "إدارة الحملات" : "Campaign Management",
          tools: [
            { view: AppView.ADS, title: s.adsAi, description: s.adsCardDescription, icon: <AdIcon className="w-6 h-6" /> },
            { view: AppView.EMAIL, title: s.emailMarketing, description: s.emailCardDescription, icon: <EmailIcon className="w-6 h-6" /> },
            { view: AppView.AFFILIATE, title: s.affiliateMarketing, description: s.affiliateCardDescription, icon: <AffiliateIcon className="w-6 h-6" /> },
            { view: AppView.CRM, title: s.crm, description: s.crmCardDescription, icon: <CrmIcon className="w-6 h-6" /> },
            { view: AppView.ANALYTICS, title: s.analytics, description: s.analyticsCardDescription, icon: <AnalyticsIcon className="w-6 h-6" /> },
          ]
      }
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{s.welcome}</h1>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">{s.dashboardDescription}</p>
      </div>
      <div className="space-y-12">
        {toolGroups.map((group) => (
            <div key={group.title}>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 pb-2 border-b-2 border-gray-200 dark:border-gray-700">{group.title}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
                    {group.tools.map(tool => (
                      <ToolCard
                        key={tool.view}
                        title={tool.title}
                        description={tool.description}
                        icon={tool.icon}
                        onClick={() => setActiveView(tool.view)}
                      />
                    ))}
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
