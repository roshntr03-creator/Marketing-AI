import React, { useState } from 'react';
import { useLocalization } from '../context/LocalizationContext.ts';
import { STRINGS } from '../constants.ts';
import { LandingPageResult } from '../types.ts';
import { generateLandingPageCopy } from '../services/geminiService.ts';
import { Spinner } from './Spinner.tsx';
import { ResultCard } from './shared/ResultCard.tsx';
import { triggerHapticFeedback } from '../utils/haptics.ts';
import { SkeletonLoader } from './shared/SkeletonLoader.tsx';

const LandingPageAssistant: React.FC = () => {
    const { language } = useLocalization();
    const s = STRINGS[language];

    const [productDescription, setProductDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<LandingPageResult | null>(null);

    const handleGenerate = async () => {
        if (!productDescription) return;
        triggerHapticFeedback();
        setLoading(true);
        setError(null);
        setResult(null);
        try {
            const apiResult = await generateLandingPageCopy(productDescription, language);
            setResult(apiResult);
        } catch (err) {
            setError((err as Error).message || s.error);
        } finally {
            setLoading(false);
        }
    };

    const formatResultForCopy = (res: LandingPageResult): string => {
        return `${s.headline}: ${res.headline}\n${s.subheadline}: ${res.subheadline}\n${s.bodyCopy}: ${res.body}\n${s.callToAction}: ${res.cta}`;
    };

    const isGenerateDisabled = !productDescription || loading;

    return (
        <div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <p className="text-gray-600 dark:text-gray-400 mb-6">{s.landingPagesDescription}</p>

                <div className="flex flex-col">
                    <label htmlFor="productDescription" className="mb-2 font-medium text-gray-700 dark:text-gray-300">{s.productDescription}</label>
                    <textarea
                        id="productDescription"
                        rows={5}
                        value={productDescription}
                        onChange={(e) => setProductDescription(e.target.value)}
                        placeholder={s.productDescriptionPlaceholder}
                        className="w-full px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 focus:border-primary-500 dark:focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                </div>

                 <div className="mt-6 flex justify-end">
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerateDisabled}
                        className="px-8 py-2.5 font-medium tracking-wide text-white capitalize transition-colors duration-200 transform bg-primary-600 rounded-md hover:bg-primary-500 focus:outline-none focus:ring focus:ring-primary-300 focus:ring-opacity-80 disabled:bg-primary-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                    >
                        {loading ? <Spinner/> : s.generateCopy}
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
                    <ResultCard title={s.landingPageCopy} copyText={formatResultForCopy(result)}>
                        <div className="space-y-4 text-gray-700 dark:text-gray-300">
                            <div>
                                <strong className="block text-lg text-gray-900 dark:text-white">{s.headline}</strong>
                                <p className="mt-1 text-xl">{result.headline}</p>
                            </div>
                             <div>
                                <strong className="block text-lg text-gray-900 dark:text-white">{s.subheadline}</strong>
                                <p className="mt-1">{result.subheadline}</p>
                            </div>
                             <div>
                                <strong className="block text-lg text-gray-900 dark:text-white">{s.bodyCopy}</strong>
                                <p className="mt-1">{result.body}</p>
                            </div>
                             <div>
                                <strong className="block text-lg text-gray-900 dark:text-white">{s.callToAction}</strong>
                                <p className="mt-1 font-semibold text-primary-600 dark:text-primary-400">{result.cta}</p>
                            </div>
                        </div>
                    </ResultCard>
                </div>
            )}
        </div>
    );
};

export default LandingPageAssistant;
