
import React, { useState } from 'react';
import { useLocalization } from '../context/LocalizationContext.ts';
import { STRINGS } from '../constants.ts';
import * as geminiService from '../services/geminiService.ts';
import { Language, TestResult } from '../types.ts';
import { Spinner } from './Spinner.tsx';

const CheckCircleIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const XCircleIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const ClockIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const allTests = [
    { name: 'SEO: Generate Keywords (Success)', fn: () => geminiService.generateKeywords('test', Language.EN) },
    { name: 'SEO: Generate Keywords (Failure)', fn: () => geminiService.generateKeywords('', Language.EN), shouldFail: true },
    { name: 'SEO: Generate Brief (Success)', fn: () => geminiService.generateContentBrief('test', Language.EN) },
    { name: 'Ads: Generate Ideas (Success)', fn: () => geminiService.generateAdIdeas('p', 'a', 's', Language.EN) },
    { name: 'Content: Generate Ideas (Success)', fn: () => geminiService.generateShortFormIdeas('content', Language.EN) },
    { name: 'Influencers: Find (Success)', fn: async () => { const res = await geminiService.findInfluencers('c', 'c', 'f', Language.EN); if (!res.data) throw new Error("No data returned"); } },
    { name: 'Optimizer: Get Suggestions (Success)', fn: async () => { const res = await geminiService.getOptimizerSuggestions('p', 'i', Language.EN); if (!res.data) throw new Error("No data returned"); } },
    { name: 'SMM: Generate Plan (Success)', fn: async () => { const res = await geminiService.generateSmmPlan('t', 5, 'p', Language.EN); if (!res.data) throw new Error("No data returned"); } },
    { name: 'SMM: Generate Plan (Failure)', fn: () => geminiService.generateSmmPlan('', 5, 'p', Language.EN), shouldFail: true },
];

const getInitialState = (): TestResult[] => allTests.map(t => ({ name: t.name, status: 'idle' }));

const TestingSuite: React.FC = () => {
    const { language } = useLocalization();
    const s = STRINGS[language];
    const [results, setResults] = useState<TestResult[]>(getInitialState());
    const [isRunning, setIsRunning] = useState(false);

    const runTests = async () => {
        setIsRunning(true);
        setResults(getInitialState());

        for (let i = 0; i < allTests.length; i++) {
            const test = allTests[i];
            setResults(prev => prev.map((r, idx) => idx === i ? { ...r, status: 'running' } : r));

            try {
                await test.fn();
                if (test.shouldFail) {
                     setResults(prev => prev.map((r, idx) => idx === i ? { ...r, status: 'failed', message: 'Test was expected to fail, but it succeeded.' } : r));
                } else {
                     setResults(prev => prev.map((r, idx) => idx === i ? { ...r, status: 'passed' } : r));
                }
            } catch (err: any) {
                if (test.shouldFail) {
                     setResults(prev => prev.map((r, idx) => idx === i ? { ...r, status: 'passed' } : r));
                } else {
                    setResults(prev => prev.map((r, idx) => idx === i ? { ...r, status: 'failed', message: err.message } : r));
                }
            }
        }
        setIsRunning(false);
    };
    
    const renderStatus = (status: TestResult['status']) => {
        switch (status) {
            case 'idle':
                return <ClockIcon />;
            case 'running':
                return <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-500"></div>;
            case 'passed':
                return <CheckCircleIcon />;
            case 'failed':
                return <XCircleIcon />;
        }
    };
    
    return (
        <div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{s.testingTitle}</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">{s.testingDescription}</p>
                 <div className="flex justify-end">
                    <button
                        onClick={runTests}
                        disabled={isRunning}
                        className="px-8 py-2.5 font-medium tracking-wide text-white capitalize transition-colors duration-200 transform bg-primary-600 rounded-md hover:bg-primary-500 focus:outline-none focus:ring focus:ring-primary-300 focus:ring-opacity-80 disabled:bg-primary-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                    >
                        {isRunning ? s.running : s.runTests}
                    </button>
                </div>
            </div>

             <div className="mt-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{s.testResults}</h3>
                <ul className="space-y-4">
                    {results.map((result, index) => (
                        <li key={index} className="p-4 rounded-md flex items-center justify-between bg-gray-50 dark:bg-gray-900/50">
                           <div className="flex items-center">
                             <div className="w-8">{renderStatus(result.status)}</div>
                             <div className="ms-3">
                                <p className="font-medium text-gray-800 dark:text-gray-200">{result.name}</p>
                                {result.status === 'failed' && <p className="text-sm text-red-600 dark:text-red-400 mt-1">{result.message}</p>}
                             </div>
                           </div>
                           {result.status === 'passed' && <span className="text-sm font-semibold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/50 px-2 py-1 rounded-full">{s.passed}</span>}
                           {result.status === 'failed' && <span className="text-sm font-semibold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/50 px-2 py-1 rounded-full">{s.failed}</span>}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default TestingSuite;
