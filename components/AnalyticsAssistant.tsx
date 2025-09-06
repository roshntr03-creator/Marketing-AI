import React from 'react';
import { useLocalization } from '../context/LocalizationContext.ts';
import { STRINGS } from '../constants.ts';
import { AppView, KpiData, AdCampaign } from '../types.ts';
import { AnalyticsIcon } from './icons/AnalyticsIcon.tsx';

interface AnalyticsAssistantProps {
    connections: {
        facebook: boolean;
        instagram: boolean;
    };
    setActiveView: (view: AppView) => void;
}

const mockKpiData: KpiData[] = [
    { title: 'totalReach', value: '1.2M', change: '+15.2%', changeType: 'increase' },
    { title: 'adSpend', value: '$12,500', change: '+5.1%', changeType: 'increase' },
    { title: 'conversions', value: '8,210', change: '+22.8%', changeType: 'increase' },
    { title: 'engagementRate', value: '4.7%', change: '-0.5%', changeType: 'decrease' },
];

const mockCampaigns: AdCampaign[] = [
    { name: 'Ramadan 2024 - Flash Sale', status: 'Active', spend: '$4,200', results: '3,500 Conversions' },
    { name: 'Eid Collection Launch', status: 'Active', spend: '$3,100', results: '2,150 Conversions' },
    { name: 'Summer Styles Influencer Collab', status: 'Paused', spend: '$1,800', results: '890 Conversions' },
    { name: 'Q4 Brand Awareness', status: 'Completed', spend: '$8,500', results: '2.5M Reach' },
]

const KPICard: React.FC<{ data: KpiData }> = ({ data }) => {
    const { language } = useLocalization();
    const s = STRINGS[language];
    const isIncrease = data.changeType === 'increase';
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{s[data.title as keyof typeof s]}</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{data.value}</p>
            <p className={`mt-1 text-sm font-semibold ${isIncrease ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {data.change}
            </p>
        </div>
    );
};

const AnalyticsAssistant: React.FC<AnalyticsAssistantProps> = ({ connections, setActiveView }) => {
    const { language } = useLocalization();
    const s = STRINGS[language];
    
    const isConnected = connections.facebook || connections.instagram;

    if (!isConnected) {
        return (
            <div className="flex flex-col items-center justify-center text-center p-8 mt-10">
                <div className="bg-white dark:bg-gray-800 p-10 rounded-lg shadow-md flex flex-col items-center max-w-lg">
                    <AnalyticsIcon className="w-24 h-24 text-gray-300 dark:text-gray-600 mb-6" />
                    <h2 className="text-3xl font-bold text-gray-700 dark:text-gray-300 mb-2">{s.connectAccountsPrompt}</h2>
                    <p className="max-w-md text-gray-600 dark:text-gray-400 mb-8">{s.connectAccountsDescription}</p>
                     <button
                        onClick={() => setActiveView(AppView.SETTINGS)}
                        className="px-8 py-3 font-medium tracking-wide text-white capitalize transition-colors duration-200 transform bg-primary-600 rounded-md hover:bg-primary-500 focus:outline-none focus:ring focus:ring-primary-300 focus:ring-opacity-80"
                    >
                        {s.goToSettings}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">{s.keyMetrics}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {mockKpiData.map(kpi => <KPICard key={kpi.title} data={kpi} />)}
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                     <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{s.performanceOverTime}</h3>
                     <div className="h-64 flex items-end justify-around p-4 border border-gray-200 dark:border-gray-700 rounded-md">
                        {/* Mock chart */}
                        <div className="w-8 bg-primary-500 rounded-t-sm" style={{height: '60%'}}></div>
                        <div className="w-8 bg-primary-500 rounded-t-sm" style={{height: '75%'}}></div>
                        <div className="w-8 bg-primary-500 rounded-t-sm" style={{height: '50%'}}></div>
                        <div className="w-8 bg-primary-500 rounded-t-sm" style={{height: '85%'}}></div>
                        <div className="w-8 bg-primary-500 rounded-t-sm" style={{height: '90%'}}></div>
                        <div className="w-8 bg-primary-300 dark:bg-primary-800 rounded-t-sm" style={{height: '95%'}}></div>
                     </div>
                </div>
                 <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{s.channelPerformance}</h3>
                    <div className="flex justify-center items-center h-64">
                         <div className="w-40 h-40 rounded-full" style={{background: 'conic-gradient(#3b82f6 0% 60%, #1d4ed8 60% 90%, #60a5fa 90% 100%)'}}></div>
                    </div>
                     <div className="mt-4 space-y-2 text-sm">
                        <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-[#3b82f6] me-2"></span> Facebook (60%)</div>
                        <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-[#1d4ed8] me-2"></span> Instagram (30%)</div>
                        <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-[#60a5fa] me-2"></span> Audience Network (10%)</div>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{s.topPerformingCampaigns}</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">{s.campaign}</th>
                                <th scope="col" className="px-6 py-3">{s.status}</th>
                                <th scope="col" className="px-6 py-3">{s.spend}</th>
                                <th scope="col" className="px-6 py-3">{s.results}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mockCampaigns.map(campaign => (
                                <tr key={campaign.name} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{campaign.name}</th>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${campaign.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : campaign.status === 'Paused' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'}`}>
                                            {campaign.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">{campaign.spend}</td>
                                    <td className="px-6 py-4">{campaign.results}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsAssistant;
