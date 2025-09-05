import React, { useState } from 'react';
import { useLocalization } from '../context/LocalizationContext.ts';
import { STRINGS } from '../constants.ts';
import { InfluencerResult, GroundedResult } from '../types.ts';
import { findInfluencers } from '../services/geminiService.ts';
import { Spinner } from './Spinner.tsx';
import { ResultCard } from './shared/ResultCard.tsx';
import { triggerHapticFeedback } from '../utils/haptics.ts';
import { SkeletonLoader } from './shared/SkeletonLoader.tsx';

const InfluencerAssistant: React.FC = () => {
    const { language } = useLocalization();
    const s = STRINGS[language];

    const [city, setCity] = useState('');
    const [category, setCategory] = useState('');
    const [followerRange, setFollowerRange] = useState('5k-10k');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [results, setResults] = useState<GroundedResult<InfluencerResult> | null>(null);

    const handleGenerate = async () => {
        if (!city || !category) return;
        triggerHapticFeedback();
        setLoading(true);
        setError(null);
        setResults(null);
        try {
            const result = await findInfluencers(city, category, followerRange, language);
            setResults(result);
        } catch (err) {
            setError(s.error);
        } finally {
            setLoading(false);
        }
    };

    const formatInfluencerForCopy = (influencer: InfluencerResult[0]): string => {
        let text = `Username: ${influencer.username}\nPlatform: ${influencer.platform}\nFollowers: ${influencer.followers}\nCategory: ${influencer.category}\nBio: ${influencer.bio}`;
        if (influencer.profileUrl) {
            text += `\nProfile: ${influencer.profileUrl}`;
        }
        return text;
    };

    const isGenerateDisabled = !city || !category || loading;

    return (
        <div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <p className="text-gray-600 dark:text-gray-400 mb-2">{s.influencersDescription}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500">{s.influencerDisclaimer}</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                    <div className="flex flex-col">
                        <label htmlFor="city" className="mb-2 font-medium text-gray-700 dark:text-gray-300">{s.city}</label>
                        <input id="city" type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder={s.cityPlaceholder} className="w-full px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 focus:border-primary-500 dark:focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500" />
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="category" className="mb-2 font-medium text-gray-700 dark:text-gray-300">{s.category}</label>
                        <input id="category" type="text" value={category} onChange={(e) => setCategory(e.target.value)} placeholder={s.categoryPlaceholder} className="w-full px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 focus:border-primary-500 dark:focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500" />
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="followerRange" className="mb-2 font-medium text-gray-700 dark:text-gray-300">{s.followerRange}</label>
                        <select id="followerRange" value={followerRange} onChange={(e) => setFollowerRange(e.target.value)} className="w-full px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 focus:border-primary-500 dark:focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500">
                            <option value="1k-5k">1k - 5k</option>
                            <option value="5k-10k">5k - 10k</option>
                            <option value="10k-50k">10k - 50k</option>
                            <option value="50k-100k">50k - 100k</option>
                        </select>
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <button onClick={handleGenerate} disabled={isGenerateDisabled} className="px-8 py-2.5 font-medium tracking-wide text-white capitalize transition-colors duration-200 transform bg-primary-600 rounded-md hover:bg-primary-500 focus:outline-none focus:ring focus:ring-primary-300 focus:ring-opacity-80 disabled:bg-primary-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed">
                        {loading ? <Spinner /> : s.findInfluencers}
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
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{s.influencerResults}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {results.data.map((influencer, index) => (
                            <ResultCard 
                                key={index} 
                                title={
                                    influencer.profileUrl ? (
                                        <a href={influencer.profileUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                            {influencer.username}
                                        </a>
                                    ) : (
                                        influencer.username
                                    )
                                } 
                                copyText={formatInfluencerForCopy(influencer)}
                            >
                                <div className="space-y-3 text-gray-700 dark:text-gray-300">
                                    <p><strong className="text-gray-900 dark:text-white">{s.platform}:</strong> <span className="font-semibold text-primary-600 dark:text-primary-400">{influencer.platform}</span></p>
                                    <p><strong className="text-gray-900 dark:text-white">{s.followers}:</strong> {influencer.followers}</p>
                                    <p><strong className="text-gray-900 dark:text-white">{s.category}:</strong> {influencer.category}</p>
                                    <p><strong className="text-gray-900 dark:text-white">{s.bio}:</strong> {influencer.bio}</p>
                                    {influencer.profileUrl && (
                                        <a href={influencer.profileUrl} target="_blank" rel="noopener noreferrer" className="inline-block mt-2 font-semibold text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
                                             {s.viewProfile} &rarr;
                                        </a>
                                    )}
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

export default InfluencerAssistant;