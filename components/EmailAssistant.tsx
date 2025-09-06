import React, { useState } from 'react';
import { useLocalization } from '../context/LocalizationContext.ts';
import { STRINGS } from '../constants.ts';
import { EmailCampaignResult, EmailResult } from '../types.ts';
import { generateEmailCampaign } from '../services/geminiService.ts';
import { Spinner } from './Spinner.tsx';
import { ResultCard } from './shared/ResultCard.tsx';
import { triggerHapticFeedback } from '../utils/haptics.ts';
import { SkeletonLoader } from './shared/SkeletonLoader.tsx';

const EmailAssistant: React.FC = () => {
    const { language } = useLocalization();
    const s = STRINGS[language];

    const [campaignGoal, setCampaignGoal] = useState('');
    const [productDescription, setProductDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [results, setResults] = useState<EmailCampaignResult | null>(null);

    const handleGenerate = async () => {
        if (!campaignGoal || !productDescription) return;
        triggerHapticFeedback();
        setLoading(true);
        setError(null);
        setResults(null);
        try {
            const apiResult = await generateEmailCampaign(campaignGoal, productDescription, language);
            setResults(apiResult);
        } catch (err) {
            setError((err as Error).message || s.error);
        } finally {
            setLoading(false);
        }
    };

    const formatResultForCopy = (email: EmailResult): string => {
        return `${s.subject}: ${email.subject}\n\n${email.body}`;
    };

    const isGenerateDisabled = !campaignGoal || !productDescription || loading;

    return (
        <div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <p className="text-gray-600 dark:text-gray-400 mb-6">{s.emailMarketingDescription}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="flex flex-col">
                        <label htmlFor="campaignGoal" className="mb-2 font-medium text-gray-700 dark:text-gray-300">{s.campaignGoal}</label>
                        <input
                            id="campaignGoal"
                            type="text"
                            value={campaignGoal}
                            onChange={(e) => setCampaignGoal(e.target.value)}
                            placeholder={s.campaignGoalPlaceholder}
                            className="w-full px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 focus:border-primary-500 dark:focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                     <div className="flex flex-col">
                        <label htmlFor="productDescription" className="mb-2 font-medium text-gray-700 dark:text-gray-300">{s.productDescription}</label>
                        <input
                            id="productDescription"
                            type="text"
                            value={productDescription}
                            onChange={(e) => setProductDescription(e.target.value)}
                            placeholder={s.productDescriptionPlaceholder}
                            className="w-full px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 focus:border-primary-500 dark:focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                </div>

                 <div className="mt-6 flex justify-end">
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerateDisabled}
                        className="px-8 py-2.5 font-medium tracking-wide text-white capitalize transition-colors duration-200 transform bg-primary-600 rounded-md hover:bg-primary-500 focus:outline-none focus:ring focus:ring-primary-300 focus:ring-opacity-80 disabled:bg-primary-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                    >
                        {loading ? <Spinner/> : s.generateEmails}
                    </button>
                </div>
            </div>

            {error && <div className="mt-4 text-center text-red-500 bg-red-100 dark:bg-red-900/30 p-3 rounded-md">{error}</div>}
            {loading && <SkeletonLoader />}

            {!loading && !error && !results && (
                <div className="mt-8 text-center text-gray-500 dark:text-gray-400">
                    <p>{s.noResults}</p>
                </div>
            )}
            
            {results && (
                <div className="mt-8">
                     <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{s.emailCampaignIdeas}</h3>
                     <div className="space-y-6">
                        {results.map((email, index) => (
                            <ResultCard key={index} title={`${s.subject}: ${email.subject}`} copyText={formatResultForCopy(email)}>
                                <div className="space-y-3 text-gray-700 dark:text-gray-300 whitespace-pre-line">
                                    <p>{email.body}</p>
                                </div>
                            </ResultCard>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmailAssistant;
