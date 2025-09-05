
import React, { useState } from 'react';
import { useLocalization } from '../context/LocalizationContext.ts';
import { STRINGS } from '../constants.ts';
import { CrmResult } from '../types.ts';
import { generateCrmPersona } from '../services/geminiService.ts';
import { Spinner } from './Spinner.tsx';
import { ResultCard } from './shared/ResultCard.tsx';
import { triggerHapticFeedback } from '../utils/haptics.ts';
import { SkeletonLoader } from './shared/SkeletonLoader.tsx';

// FIX: Changed from a named export to a local const to allow for a default export, which is required for React.lazy().
const CrmAssistant: React.FC = () => {
    const { language } = useLocalization();
    const s = STRINGS[language];

    const [audience, setAudience] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<CrmResult | null>(null);

    const handleGenerate = async () => {
        if (!audience) return;
        triggerHapticFeedback();
        setLoading(true);
        setError(null);
        setResult(null);
        try {
            const apiResult = await generateCrmPersona(audience, language);
            setResult(apiResult);
        } catch (err) {
            setError(s.error);
        } finally {
            setLoading(false);
        }
    };

    const formatResultForCopy = (res: CrmResult): string => {
        let text = `Persona: ${res.name}\n\n`;
        text += `${s.demographics}: ${res.demographics}\n\n`;
        text += `${s.goals}:\n- ${res.goals.join('\n- ')}\n\n`;
        text += `${s.painPoints}:\n- ${res.painPoints.join('\n- ')}`;
        return text;
    };

    const isGenerateDisabled = !audience || loading;

    return (
        <div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <p className="text-gray-600 dark:text-gray-400 mb-6">{s.crmDescription}</p>

                <div className="flex flex-col">
                    <label htmlFor="audience" className="mb-2 font-medium text-gray-700 dark:text-gray-300">{s.targetAudience}</label>
                    <textarea
                        id="audience"
                        rows={5}
                        value={audience}
                        onChange={(e) => setAudience(e.target.value)}
                        placeholder={s.audienceDescriptionPlaceholder}
                        className="w-full px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 focus:border-primary-500 dark:focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                </div>

                 <div className="mt-6 flex justify-end">
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerateDisabled}
                        className="px-8 py-2.5 font-medium tracking-wide text-white capitalize transition-colors duration-200 transform bg-primary-600 rounded-md hover:bg-primary-500 focus:outline-none focus:ring focus:ring-primary-300 focus:ring-opacity-80 disabled:bg-primary-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                    >
                        {loading ? <Spinner/> : s.generatePersona}
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
                    <ResultCard title={`${s.customerPersona}: ${result.name}`} copyText={formatResultForCopy(result)}>
                        <div className="space-y-4">
                            <div>
                                <h4 className="text-lg font-semibold text-gray-800 dark:text-white">{s.demographics}</h4>
                                <p className="text-gray-700 dark:text-gray-300">{result.demographics}</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white">{s.goals}</h4>
                                    <ul className="mt-2 space-y-2 list-disc list-inside text-gray-700 dark:text-gray-300">
                                        {result.goals.map((goal, i) => <li key={i}>{goal}</li>)}
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white">{s.painPoints}</h4>
                                    <ul className="mt-2 space-y-2 list-disc list-inside text-gray-700 dark:text-gray-300">
                                        {result.painPoints.map((point, i) => <li key={i}>{point}</li>)}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </ResultCard>
                </div>
            )}
        </div>
    );
};

export default CrmAssistant;
