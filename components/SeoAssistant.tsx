
import React, { useState } from 'react';
import { useLocalization } from '../context/LocalizationContext.ts';
import { STRINGS } from '../constants.ts';
import { KeywordResult, ContentBriefResult } from '../types.ts';
import { generateKeywords, generateContentBrief } from '../services/geminiService.ts';
import { Spinner } from './Spinner.tsx';
import { ResultCard } from './shared/ResultCard.tsx';
import { CopyButton } from './shared/CopyButton.tsx';
import { SkeletonLoader } from './shared/SkeletonLoader.tsx';

const SeoAssistant: React.FC = () => {
    const { language } = useLocalization();
    const s = STRINGS[language];

    const [topic, setTopic] = useState('');
    const [loading, setLoading] = useState<'keywords' | 'brief' | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [keywordResult, setKeywordResult] = useState<KeywordResult | null>(null);
    const [briefResult, setBriefResult] = useState<ContentBriefResult | null>(null);

    const handleGenerateKeywords = async () => {
        if (!topic) return;
        setLoading('keywords');
        setError(null);
        setKeywordResult(null);
        setBriefResult(null);
        try {
            const result = await generateKeywords(topic, language);
            setKeywordResult(result);
        } catch (err) {
            setError(s.error);
        } finally {
            setLoading(null);
        }
    };

    const handleGenerateBrief = async () => {
        if (!topic) return;
        setLoading('brief');
        setError(null);
        setBriefResult(null);
        setKeywordResult(null);
        try {
            const result = await generateContentBrief(topic, language);
            setBriefResult(result);
        } catch (err) {
            setError(s.error);
        } finally {
            setLoading(null);
        }
    };

    const formatBriefForCopy = (brief: ContentBriefResult): string => {
        let text = `${s.title}: ${brief.title}\n\n`;
        text += `${s.hook}: ${brief.hook}\n\n`;
        text += `${s.introduction}: ${brief.introduction}\n\n`;
        text += `${s.bodySections}:\n`;
        brief.bodySections.forEach(section => {
            text += `- ${section.title}:\n`;
            section.points.forEach(point => {
                text += `  - ${point}\n`;
            });
        });
        text += `\n${s.callToAction}: ${brief.cta}\n\n`;
        text += `${s.metaDescription}: ${brief.seoMetaDescription}\n`;
        return text;
    };

    return (
        <div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{s.seoTitle}</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-2">{s.seoDescription}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mb-6">{s.searchDisclaimer}</p>

                <div className="flex flex-col md:flex-row gap-4">
                    <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder={s.topicPlaceholder}
                        className="flex-grow w-full px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 focus:border-primary-500 dark:focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <button
                        onClick={handleGenerateKeywords}
                        disabled={!topic || !!loading}
                        className="px-6 py-2 font-medium tracking-wide text-white capitalize transition-colors duration-200 transform bg-primary-600 rounded-md hover:bg-primary-500 focus:outline-none focus:ring focus:ring-primary-300 focus:ring-opacity-80 disabled:bg-primary-300 disabled:cursor-not-allowed"
                    >
                        {loading === 'keywords' ? <Spinner/> : s.generateKeywords}
                    </button>
                    <button
                        onClick={handleGenerateBrief}
                        disabled={!topic || !!loading}
                        className="px-6 py-2 font-medium tracking-wide text-white capitalize transition-colors duration-200 transform bg-indigo-600 rounded-md hover:bg-indigo-500 focus:outline-none focus:ring focus:ring-indigo-300 focus:ring-opacity-80 disabled:bg-indigo-300 disabled:cursor-not-allowed"
                    >
                        {loading === 'brief' ? <Spinner/> : s.generateBrief}
                    </button>
                </div>
            </div>

            {error && <div className="mt-4 text-center text-red-500 bg-red-100 dark:bg-red-900/30 p-3 rounded-md">{error}</div>}

            {loading && <SkeletonLoader />}

            {!loading && !error && !keywordResult && !briefResult && (
                <div className="mt-8 text-center text-gray-500 dark:text-gray-400">
                    <p>{s.noResults}</p>
                </div>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                {keywordResult && (
                     <ResultCard title={s.keywords} copyText={`${s.keywords}:\n- ${keywordResult.keywords.join('\n- ')}\n\n${s.searchIntent}: ${keywordResult.searchIntent}`}>
                        <div className="mb-4">
                            <p className="font-semibold text-primary-600 dark:text-primary-400">{s.searchIntent}: <span className="font-normal text-gray-600 dark:text-gray-300">{keywordResult.searchIntent}</span></p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {keywordResult.keywords.map((kw, index) => (
                                <span key={index} className="px-3 py-1 text-sm font-medium text-blue-800 bg-blue-100 rounded-full dark:bg-blue-900 dark:text-blue-300">
                                    {kw}
                                </span>
                            ))}
                        </div>
                    </ResultCard>
                )}

                {briefResult && (
                    <ResultCard title={s.contentBrief} copyText={formatBriefForCopy(briefResult)}>
                        <div className="space-y-4 text-gray-700 dark:text-gray-300">
                            <div><strong className="text-gray-900 dark:text-white">{s.title}:</strong> {briefResult.title}</div>
                            <div><strong className="text-gray-900 dark:text-white">{s.hook}:</strong> {briefResult.hook}</div>
                            <div><strong className="text-gray-900 dark:text-white">{s.introduction}:</strong> {briefResult.introduction}</div>
                            <div>
                                <strong className="text-gray-900 dark:text-white">{s.bodySections}:</strong>
                                <ul className="mt-2 space-y-3 ps-5 rtl:ps-0 rtl:pe-5">
                                    {briefResult.bodySections.map((section, idx) => (
                                        <li key={idx}>
                                            <p className="font-semibold">{section.title}</p>
                                            <ul className="list-disc ps-5 rtl:ps-0 rtl:pe-5 mt-1 space-y-1 text-sm">
                                                {section.points.map((point, pidx) => <li key={pidx}>{point}</li>)}
                                            </ul>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                             <div><strong className="text-gray-900 dark:text-white">{s.callToAction}:</strong> {briefResult.cta}</div>
                             <div><strong className="text-gray-900 dark:text-white">{s.metaDescription}:</strong> {briefResult.seoMetaDescription}</div>
                        </div>
                    </ResultCard>
                )}
            </div>
        </div>
    );
};

export default SeoAssistant;
