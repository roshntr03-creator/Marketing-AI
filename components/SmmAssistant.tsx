import React, { useState } from 'react';
import { useLocalization } from '../context/LocalizationContext.ts';
import { STRINGS } from '../constants.ts';
import { SmmPlanResult, GroundedResult } from '../types.ts';
import { generateSmmPlan } from '../services/geminiService.ts';
import { Spinner } from './Spinner.tsx';
import { ResultCard } from './shared/ResultCard.tsx';
import { triggerHapticFeedback } from '../utils/haptics.ts';
import { SkeletonLoader } from './shared/SkeletonLoader.tsx';

const SmmAssistant: React.FC = () => {
    const { language } = useLocalization();
    const s = STRINGS[language];

    const [topic, setTopic] = useState('');
    const [numPosts, setNumPosts] = useState(7);
    const [platform, setPlatform] = useState('Instagram');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [results, setResults] = useState<GroundedResult<SmmPlanResult> | null>(null);

    const handleGenerate = async () => {
        if (!topic) return;
        triggerHapticFeedback();
        setLoading(true);
        setError(null);
        setResults(null);
        try {
            const result = await generateSmmPlan(topic, numPosts, platform, language);
            setResults(result);
        } catch (err) {
            setError(s.error);
        } finally {
            setLoading(false);
        }
    };
    
    const formatPostForCopy = (post: SmmPlanResult[0]): string => {
        return `${s.day} ${post.day}\n${s.contentType}: ${post.contentType}\n${s.caption}: ${post.caption}\n${s.hashtags}: ${post.hashtags.join(' ')}`;
    };

    const isGenerateDisabled = !topic || loading;

    return (
        <div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <p className="text-gray-600 dark:text-gray-400 mb-2">{s.smmDescription}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mb-6">{s.searchDisclaimer}</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex flex-col md:col-span-1">
                        <label htmlFor="topic" className="mb-2 font-medium text-gray-700 dark:text-gray-300">{s.campaignTopic}</label>
                        <input id="topic" type="text" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder={s.campaignTopicPlaceholder} className="w-full px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 focus:border-primary-500 dark:focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500" />
                    </div>
                     <div className="flex flex-col">
                        <label htmlFor="platform" className="mb-2 font-medium text-gray-700 dark:text-gray-300">{s.platform}</label>
                        <select id="platform" value={platform} onChange={(e) => setPlatform(e.target.value)} className="w-full px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 focus:border-primary-500 dark:focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500">
                            <option value="Instagram">Instagram</option>
                            <option value="TikTok">TikTok</option>
                            <option value="X (Twitter)">X (Twitter)</option>
                             <option value="Facebook">Facebook</option>
                        </select>
                    </div>
                    <div className="flex flex-col">
                         <label htmlFor="numPosts" className="mb-2 font-medium text-gray-700 dark:text-gray-300">{s.numberOfPosts}</label>
                        <input id="numPosts" type="number" min="1" max="14" value={numPosts} onChange={(e) => setNumPosts(parseInt(e.target.value))} className="w-full px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 focus:border-primary-500 dark:focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500" />
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <button onClick={handleGenerate} disabled={isGenerateDisabled} className="px-8 py-2.5 font-medium tracking-wide text-white capitalize transition-colors duration-200 transform bg-primary-600 rounded-md hover:bg-primary-500 focus:outline-none focus:ring focus:ring-primary-300 focus:ring-opacity-80 disabled:bg-primary-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed">
                        {loading ? <Spinner /> : s.generatePlan}
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
            
            {results && results.data && (
                <div className="mt-8">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{`${s.smmResults} - ${platform}`}</h3>
                    <div className="space-y-6">
                        {results.data.map((post) => (
                            <ResultCard key={post.day} title={`${s.day} ${post.day}`} copyText={formatPostForCopy(post)}>
                                <div className="space-y-3 text-gray-700 dark:text-gray-300">
                                     <p><strong className="text-gray-900 dark:text-white">{s.contentType}:</strong> <span className="font-semibold text-primary-600 dark:text-primary-400">{post.contentType}</span></p>
                                    <p><strong className="text-gray-900 dark:text-white">{s.caption}:</strong> {post.caption}</p>
                                    <div>
                                        <strong className="text-gray-900 dark:text-white">{s.hashtags}:</strong>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {post.hashtags.map((tag, index) => (
                                                <span key={index} className="px-3 py-1 text-sm font-medium text-indigo-800 bg-indigo-100 rounded-full dark:bg-indigo-900 dark:text-indigo-300">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </ResultCard>
                        ))}
                    </div>
                     {results.sources && results.sources.length > 0 && (
                        <div className="mt-6 text-sm text-gray-500 dark:text-gray-400 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                            <h4 className="font-semibold mb-2 text-gray-700 dark:text-gray-300">{s.sources}:</h4>
                            <ul className="list-disc list-inside space-y-1">
                                {results.sources.map((source, index) => (
                                    source.web && source.web.uri && (
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
                </div>
            )}
        </div>
    );
};

export default SmmAssistant;