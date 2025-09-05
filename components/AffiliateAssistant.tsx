
import React, { useState } from 'react';
import { useLocalization } from '../context/LocalizationContext.ts';
import { STRINGS } from '../constants.ts';
import { AffiliateResult } from '../types.ts';
import { generateAffiliateOutreach } from '../services/geminiService.ts';
import { Spinner } from './Spinner.tsx';
import { ResultCard } from './shared/ResultCard.tsx';
import { triggerHapticFeedback } from '../utils/haptics.ts';
import { SkeletonLoader } from './shared/SkeletonLoader.tsx';

const AffiliateAssistant: React.FC = () => {
    const { language } = useLocalization();
    const s = STRINGS[language];

    const [productDescription, setProductDescription] = useState('');
    const [offer, setOffer] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<AffiliateResult | null>(null);

    const handleGenerate = async () => {
        if (!productDescription || !offer) return;
        triggerHapticFeedback();
        setLoading(true);
        setError(null);
        setResult(null);
        try {
            const apiResult = await generateAffiliateOutreach(productDescription, offer, language);
            setResult(apiResult);
        } catch (err) {
            setError(s.error);
        } finally {
            setLoading(false);
        }
    };

    const formatResultForCopy = (res: AffiliateResult): string => {
        return `${s.subject}: ${res.subject}\n\n${res.body}`;
    };

    const isGenerateDisabled = !productDescription || !offer || loading;

    return (
        <div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <p className="text-gray-600 dark:text-gray-400 mb-6">{s.affiliateMarketingDescription}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    <div className="flex flex-col">
                        <label htmlFor="offer" className="mb-2 font-medium text-gray-700 dark:text-gray-300">{s.affiliateOffer}</label>
                        <input
                            id="offer"
                            type="text"
                            value={offer}
                            onChange={(e) => setOffer(e.target.value)}
                            placeholder={s.affiliateOfferPlaceholder}
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
                        {loading ? <Spinner/> : s.generateOutreach}
                    </button>
                </div>
            </div>

            {error && <div className="mt-4 text-center text-red-500 bg-red-100 dark:bg-red-900/30 p-3 rounded-md">{error}</div>}

            {loading && <SkeletonLoader />}

            {!loading && !error && !result && (
                <div className="mt-8 text-center text-gray-500 dark:text-gray-400">
                    <p>{s.noResults}</p>
                </div>
            )}
            
            {result && (
                <div className="mt-8">
                    <ResultCard title={`${s.subject}: ${result.subject}`} copyText={formatResultForCopy(result)}>
                        <div className="space-y-3 text-gray-700 dark:text-gray-300 whitespace-pre-line">
                            <p>{result.body}</p>
                        </div>
                    </ResultCard>
                </div>
            )}
        </div>
    );
};

export default AffiliateAssistant;
