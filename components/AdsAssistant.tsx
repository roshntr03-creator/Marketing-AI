
import React, { useState } from 'react';
import { useLocalization } from '../context/LocalizationContext.ts';
import { STRINGS } from '../constants.ts';
import { AdIdeasResult } from '../types.ts';
import { generateAdIdeas } from '../services/geminiService.ts';
import { Spinner } from './Spinner.tsx';
import { ResultCard } from './shared/ResultCard.tsx';
import { triggerHapticFeedback } from '../utils/haptics.ts';
import { SkeletonLoader } from './shared/SkeletonLoader.tsx';

const AdsAssistant: React.FC = () => {
    const { language } = useLocalization();
    const s = STRINGS[language];

    const [product, setProduct] = useState('');
    const [audience, setAudience] = useState('');
    const [sellingPoints, setSellingPoints] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [results, setResults] = useState<AdIdeasResult | null>(null);

    const handleGenerate = async () => {
        if (!product || !audience || !sellingPoints) return;
        triggerHapticFeedback();
        setLoading(true);
        setError(null);
        setResults(null);
        try {
            const result = await generateAdIdeas(product, audience, sellingPoints, language);
            setResults(result);
        } catch (err) {
            setError(s.error);
        } finally {
            setLoading(false);
        }
    };

    const formatAdForCopy = (ad: AdIdeasResult[0]): string => {
        return `${s.adAngle}: ${ad.angle}\n${s.headline}: ${ad.headline}\n${s.bodyCopy}: ${ad.body}\n${s.callToAction}: ${ad.cta}`;
    };

    const isGenerateDisabled = !product || !audience || !sellingPoints || loading;

    return (
        <div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <p className="text-gray-600 dark:text-gray-400 mb-6">{s.adsDescription}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="flex flex-col">
                        <label htmlFor="productName" className="mb-2 font-medium text-gray-700 dark:text-gray-300">{s.productName}</label>
                        <input
                            id="productName"
                            type="text"
                            value={product}
                            onChange={(e) => setProduct(e.target.value)}
                            placeholder={s.productNamePlaceholder}
                            className="w-full px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 focus:border-primary-500 dark:focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                     <div className="flex flex-col">
                        <label htmlFor="targetAudience" className="mb-2 font-medium text-gray-700 dark:text-gray-300">{s.targetAudience}</label>
                        <input
                            id="targetAudience"
                            type="text"
                            value={audience}
                            onChange={(e) => setAudience(e.target.value)}
                            placeholder={s.targetAudiencePlaceholder}
                            className="w-full px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 focus:border-primary-500 dark:focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                     <div className="md:col-span-2 flex flex-col">
                        <label htmlFor="sellingPoints" className="mb-2 font-medium text-gray-700 dark:text-gray-300">{s.sellingPoints}</label>
                        <textarea
                            id="sellingPoints"
                            rows={4}
                            value={sellingPoints}
                            onChange={(e) => setSellingPoints(e.target.value)}
                            placeholder={s.sellingPointsPlaceholder}
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
                        {loading ? <Spinner/> : s.generateAdIdeas}
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
                     <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{s.adIdeas}</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {results.map((ad, index) => (
                            <ResultCard key={index} title={`${s.adAngle}: ${ad.angle}`} copyText={formatAdForCopy(ad)}>
                                <div className="space-y-3 text-gray-700 dark:text-gray-300">
                                    <p><strong className="text-gray-900 dark:text-white">{s.headline}:</strong> {ad.headline}</p>
                                    <p><strong className="text-gray-900 dark:text-white">{s.bodyCopy}:</strong> {ad.body}</p>
                                    <p><strong className="text-gray-900 dark:text-white">{s.callToAction}:</strong> <span className="font-semibold text-primary-600 dark:text-primary-400">{ad.cta}</span></p>
                                </div>
                            </ResultCard>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdsAssistant;
