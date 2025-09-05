
import React, { useState, useRef } from 'react';
import { useLocalization } from '../context/LocalizationContext.ts';
import { STRINGS } from '../constants.ts';
import { ShortFormIdeasResult } from '../types.ts';
import { generateShortFormIdeas, generateShortFormIdeasFromImage } from '../services/geminiService.ts';
import { Spinner } from './Spinner.tsx';
import { ResultCard } from './shared/ResultCard.tsx';
import { triggerHapticFeedback } from '../utils/haptics.ts';
import { CameraIcon } from './icons/CameraIcon.tsx';
import { SkeletonLoader } from './shared/SkeletonLoader.tsx';

type GenerationMode = 'text' | 'image';

const ContentAssistant: React.FC = () => {
    const { language } = useLocalization();
    const s = STRINGS[language];

    const [mode, setMode] = useState<GenerationMode>('text');
    const [longContent, setLongContent] = useState('');
    const [imagePrompt, setImagePrompt] = useState('');
    const [image, setImage] = useState<{ file: File, preview: string } | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [results, setResults] = useState<ShortFormIdeasResult | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setImage({
                file,
                preview: URL.createObjectURL(file),
            });
        }
    };

    const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = error => reject(error);
    });

    const handleGenerate = async () => {
        triggerHapticFeedback();
        setLoading(true);
        setError(null);
        setResults(null);
        try {
            let result;
            if (mode === 'text' && longContent) {
                result = await generateShortFormIdeas(longContent, language);
            } else if (mode === 'image' && image && imagePrompt) {
                const imageBase64 = await toBase64(image.file);
                result = await generateShortFormIdeasFromImage(imagePrompt, imageBase64, image.file.type, language);
            } else {
                setLoading(false);
                return; 
            }
            setResults(result);
        } catch (err) {
            setError(s.error);
        } finally {
            setLoading(false);
        }
    };
    
    const formatClipForCopy = (clip: ShortFormIdeasResult[0]): string => {
        return `${s.clipTitle}: ${clip.title}\n${s.clipHook}: ${clip.hook}\n${s.clipScript}: ${clip.script}\n${s.visualSuggestion}: ${clip.visualSuggestion}\n${s.callToAction}: ${clip.cta}`;
    };

    const isGenerateDisabled = loading || (mode === 'text' && !longContent) || (mode === 'image' && (!image || !imagePrompt));

    return (
        <div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <p className="text-gray-600 dark:text-gray-400 mb-6">{s.contentDescription}</p>

                <div className="mb-6">
                    <div className="flex border-b border-gray-200 dark:border-gray-700">
                        <button onClick={() => setMode('text')} className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${mode === 'text' ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
                            {s.fromText}
                        </button>
                        <button onClick={() => setMode('image')} className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${mode === 'image' ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
                            {s.fromImage}
                        </button>
                    </div>
                </div>

                {mode === 'text' && (
                    <div className="flex flex-col">
                        <label htmlFor="longContent" className="mb-2 font-medium text-gray-700 dark:text-gray-300">{s.longContent}</label>
                        <textarea
                            id="longContent"
                            rows={10}
                            value={longContent}
                            onChange={(e) => setLongContent(e.target.value)}
                            placeholder={s.longContentPlaceholder}
                            className="w-full px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 focus:border-primary-500 dark:focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                )}

                {mode === 'image' && (
                    <div className="space-y-6">
                        <div className="flex flex-col items-center justify-center w-full">
                            <input type="file" accept="image/*" capture="environment" ref={fileInputRef} onChange={handleImageChange} className="hidden" />
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full h-48 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
                            >
                                {image ? (
                                    <img src={image.preview} alt="Preview" className="h-full w-full object-contain rounded-lg" />
                                ) : (
                                    <div className="text-center text-gray-500 dark:text-gray-400">
                                        <CameraIcon className="mx-auto h-12 w-12" />
                                        <p className="mt-2">{s.uploadImage}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                         <div className="flex flex-col">
                            <label htmlFor="imagePrompt" className="mb-2 font-medium text-gray-700 dark:text-gray-300">{s.imagePrompt}</label>
                            <input
                                id="imagePrompt"
                                type="text"
                                value={imagePrompt}
                                onChange={(e) => setImagePrompt(e.target.value)}
                                placeholder={s.imagePromptPlaceholder}
                                className="w-full px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 focus:border-primary-500 dark:focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                    </div>
                )}


                 <div className="mt-6 flex justify-end">
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerateDisabled}
                        className="px-8 py-2.5 font-medium tracking-wide text-white capitalize transition-colors duration-200 transform bg-primary-600 rounded-md hover:bg-primary-500 focus:outline-none focus:ring focus:ring-primary-300 focus:ring-opacity-80 disabled:bg-primary-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                    >
                        {loading ? <Spinner/> : s.generateShortClips}
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
                     <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{s.shortClipIdeas}</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {results.map((clip, index) => (
                            <ResultCard key={index} title={clip.title} copyText={formatClipForCopy(clip)}>
                                <div className="space-y-3 text-gray-700 dark:text-gray-300">
                                    <p><strong className="text-gray-900 dark:text-white">{s.clipHook}:</strong> {clip.hook}</p>
                                    <p><strong className="text-gray-900 dark:text-white">{s.clipScript}:</strong> {clip.script}</p>
                                    <p><strong className="text-gray-900 dark:text-white">{s.visualSuggestion}:</strong> {clip.visualSuggestion}</p>
                                    <p><strong className="text-gray-900 dark:text-white">{s.callToAction}:</strong> <span className="font-semibold text-primary-600 dark:text-primary-400">{clip.cta}</span></p>
                                </div>
                            </ResultCard>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContentAssistant;
