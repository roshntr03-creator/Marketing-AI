import React, { useState } from 'react';
import { useLocalization } from '../context/LocalizationContext.ts';
import { STRINGS } from '../constants.ts';
import { OptimizerResult, GroundedResult } from '../types.ts';
import { getOptimizerSuggestions } from '../services/geminiService.ts';
import { Spinner } from './Spinner.tsx';
import { ResultCard } from './shared/ResultCard.tsx';
import { SkeletonLoader } from './shared/SkeletonLoader.tsx';

const OptimizerAssistant: React.FC = () => {
    const { language } = useLocalization();
    const s = STRINGS[language];

    const [platform, setPlatform] = useState('Instagram');
    const [industry, setIndustry] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [results, setResults] = useState<GroundedResult<OptimizerResult> | null>(null);

    const handleGenerate = async () => {
        if (!industry) return;
        setLoading(true);
        setError(null);
        setResults(null);
        try {
            const result = await getOptimizerSuggestions(platform, industry, language);
            setResults(result);
        } catch (err) {
            setError((err as Error).message || s.error);
        } finally {
            setLoading(false);
        }
    };
    
    const formatResultsForCopy = (result: OptimizerResult): string => {
        let text = `${s.postingTimes}:\n`;
        result.postingTimes.forEach(pt => {
            text += `- ${pt.day}: ${pt.times}\n`;
        });
        text += `\n${s.contentIdeas}:\n`;
        result.contentIdeas.forEach(idea => {
            text += `- ${idea}\n`;
        });
        return text;
    };


    const isGenerateDisabled = !industry || loading;

    return (
        <div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <p className="text-gray-600 dark:text-gray-400 mb-2">{s.optimizerDescription}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mb-6">{s.searchDisclaimer}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col">
                        <label htmlFor="platform" className="mb-2 font-medium text-gray-700 dark:text-gray-300">{s.platform}</label>
                        <select id="platform" value={platform} onChange={(e) => setPlatform(e.target.value)} className="w-full px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 focus:border-primary-500 dark:focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500">
                            <option value="Instagram">Instagram</option>
                            <option value="TikTok">TikTok</option>
                        </select>
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="industry" className="mb-2 font-medium text-gray-700 dark:text-gray-300">{s.industry}</label>
                        <input id="industry" type="text" value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder={s.industryPlaceholder} className="w-full px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 focus:border-primary-500 dark:focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500" />
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <button onClick={handleGenerate} disabled={isGenerateDisabled} className="px-8 py-2.5 font-medium tracking-wide text-white capitalize transition-colors duration-200 transform bg-primary-600 rounded-md hover:bg-primary-500 focus:outline-none focus:ring focus:ring-primary-300 focus:ring-opacity-80 disabled:bg-primary-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed">
                        {loading ? <Spinner /> : s.getRecommendations}
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
            
            {results?.data && (
                <div className="mt-8">
                     <ResultCard title={s.optimizerResults} copyText={formatResultsForCopy(results.data)}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">{s.postingTimes}</h4>
                                <ul className="space-y-2">
                                    {results.data.postingTimes.map((item, index) => (
                                        <li key={index} className="flex items-start">
                                            <span className="font-bold w-32 rtl:w-40 text-gray-900 dark:text-white">{item.day}:</span>
                                            <span className="text-gray-700 dark:text-gray-300">{item.times}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                             <div>
                                <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">{s.contentIdeas}</h4>
                                <ul className="space-y-2 list-disc list-inside text-gray-700 dark:text-gray-300">
                                    {results.data.contentIdeas.map((idea, index) => (
                                        <li key={index}>{idea}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        {results.sources && results.sources.length > 0 && (
                            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
                                <h4 className="font-semibold mb-2 text-gray-700 dark:text-gray-300">{s.sources}:</h4>
                                <ul className="list-disc list-inside space-y-1">
                                    {results.sources.map((source, index) => (
                                        source.web?.uri && (
                                            <li key={index}>
                                                <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline dark:text-primary-400">
                                                    {source.web.title || source.web.uri}
                                                </a>
                                            </li>
                                        )
                                    ))}
                                </ul>
                            </div>
                        )}
                    </ResultCard>
                </div>
            )}
        </div>
    );
};

export default OptimizerAssistant;
