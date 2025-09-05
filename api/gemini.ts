// This file should be deployed as a serverless function (e.g., in the /api directory on Vercel).
// It acts as a secure backend proxy to the Google Gemini API.
// IMPORTANT: You must set the API_KEY as an environment variable in your deployment settings.

import { GoogleGenAI, Type } from "@google/genai";
import type { Language, GroundedResult, KeywordResult, ContentBriefResult, SmmPlanResult, InfluencerResult, OptimizerResult, AdIdeasResult, ShortFormIdeasResult, LandingPageResult, EmailCampaignResult, AffiliateResult, CrmResult } from '../types.ts';

// --- Interfaces for Request/Response (framework-agnostic) ---
interface ApiRequest {
    body: {
        endpoint: string;
        params: any;
    };
}

interface ApiResponse {
    status: (code: number) => {
        json: (data: any) => void;
    };
}

// --- Gemini API Logic (moved from frontend service) ---

let aiInstance: GoogleGenAI | null = null;
const getAi = (): GoogleGenAI => {
    if (aiInstance) return aiInstance;
    const API_KEY = process.env.API_KEY;
    if (!API_KEY) throw new Error("API_KEY environment variable not set on the server.");
    aiInstance = new GoogleGenAI({ apiKey: API_KEY });
    return aiInstance;
};

const parseGroundedJson = (text: string, fallback: string = '[]') => {
    try {
        const firstBracket = text.indexOf('[');
        const firstBrace = text.indexOf('{');
        if (firstBracket === -1 && firstBrace === -1) return JSON.parse(fallback);
        let startIndex = (firstBracket !== -1 && firstBrace !== -1) ? Math.min(firstBracket, firstBrace) : (firstBracket !== -1 ? firstBracket : firstBrace);
        const isArray = text[startIndex] === '[';
        const lastBracketOrBrace = isArray ? text.lastIndexOf(']') : text.lastIndexOf('}');
        if (startIndex === -1 || lastBracketOrBrace === -1) {
            const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(cleanedText);
        }
        const jsonStr = text.substring(startIndex, lastBracketOrBrace + 1);
        return JSON.parse(jsonStr);
    } catch (e) {
        console.warn("Failed to parse JSON, falling back. Original text:", text);
        return JSON.parse(fallback);
    }
};

// --- Schemas ---
const adIdeasSchema = { type: Type.ARRAY, description: "A list of 3-5 distinct ad ideas.", items: { type: Type.OBJECT, properties: { angle: { type: Type.STRING }, headline: { type: Type.STRING }, body: { type: Type.STRING }, cta: { type: Type.STRING } }, required: ["angle", "headline", "body", "cta"] } };
const shortFormIdeasSchema = { type: Type.ARRAY, description: "A list of 3-5 distinct short-form video ideas.", items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, hook: { type: Type.STRING }, script: { type: Type.STRING }, cta: { type: Type.STRING }, visualSuggestion: { type: Type.STRING } }, required: ["title", "hook", "script", "cta", "visualSuggestion"] } };
const landingPageSchema = { type: Type.OBJECT, properties: { headline: { type: Type.STRING }, subheadline: { type: Type.STRING }, body: { type: Type.STRING }, cta: { type: Type.STRING } }, required: ["headline", "subheadline", "body", "cta"] };
const emailCampaignSchema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { subject: { type: Type.STRING }, body: { type: Type.STRING } }, required: ["subject", "body"] } };
const affiliateOutreachSchema = { type: Type.OBJECT, properties: { subject: { type: Type.STRING }, body: { type: Type.STRING } }, required: ["subject", "body"] };
const crmPersonaSchema = { type: Type.OBJECT, properties: { name: { type: Type.STRING }, demographics: { type: Type.STRING }, goals: { type: Type.ARRAY, items: { type: Type.STRING } }, painPoints: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["name", "demographics", "goals", "painPoints"] };

// --- API Functions ---
const apiFunctions: { [key: string]: (params: any) => Promise<any> } = {
    generateAdIdeas: async ({ product, audience, sellingPoints, language }) => {
        const ai = getAi();
        const prompt = `Language: ${language === 'ar' ? 'Modern Standard Arabic' : 'English'}. Generate 3-5 distinct ad ideas for: Product: "${product}", Audience: "${audience}", Selling Points: ${sellingPoints}`;
        const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt, config: { systemInstruction: "You are an expert ad copywriter for the MENA market.", responseMimeType: "application/json", responseSchema: adIdeasSchema } });
        return JSON.parse(response.text.trim());
    },
    generateShortFormIdeas: async ({ longContent, language }) => {
        const ai = getAi();
        const prompt = `Language: ${language === 'ar' ? 'Modern Standard Arabic' : 'English'}. Analyze and extract 3-5 short video ideas from: """${longContent}"""`;
        const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt, config: { systemInstruction: "You are a viral social media content creator for the Middle East.", responseMimeType: "application/json", responseSchema: shortFormIdeasSchema } });
        return JSON.parse(response.text.trim());
    },
    generateShortFormIdeasFromImage: async ({ prompt, imageBase64, imageMimeType, language }) => {
        const ai = getAi();
        const imagePart = { inlineData: { mimeType: imageMimeType, data: imageBase64 } };
        const textPart = { text: `Language: ${language === 'ar' ? 'Modern Standard Arabic' : 'English'}. Prompt: "${prompt}". Generate 3-5 short video ideas based on the image.` };
        const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: { parts: [imagePart, textPart] }, config: { systemInstruction: "You are a viral social media content creator for the Middle East.", responseMimeType: "application/json", responseSchema: shortFormIdeasSchema } });
        return JSON.parse(response.text.trim());
    },
    generateSmmPlan: async ({ topic, numPosts, platform, language }) => {
        const ai = getAi();
        const prompt = `Language: ${language === 'ar' ? 'Arabic' : 'English'}. Using Google Search, create a content plan for ${numPosts} days on ${platform} for the topic "${topic}" for a Middle Eastern audience. Return only a valid JSON array.`;
        const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt, config: { systemInstruction: "You are an expert SMM who uses Google Search for timely data.", tools: [{ googleSearch: {} }] } });
        return { data: parseGroundedJson(response.text, '[]'), sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks };
    },
    generateKeywords: async ({ topic, language }) => {
        const ai = getAi();
        const prompt = `Language: ${language === 'ar' ? 'Arabic' : 'English'}. Using Google Search, generate keywords and search intent for "${topic}". Return only a valid JSON object.`;
        const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt, config: { systemInstruction: "You are an SEO expert for MENA using Google Search.", tools: [{ googleSearch: {} }] } });
        return { data: parseGroundedJson(response.text, '{}'), sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks };
    },
    generateContentBrief: async ({ topic, language }) => {
        const ai = getAi();
        const prompt = `Language: ${language === 'ar' ? 'Arabic' : 'English'}. Using Google Search, create a content brief for "${topic}". Return only a valid JSON object with the specified structure.`;
        const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt, config: { systemInstruction: "You are a content strategist using Google Search.", tools: [{ googleSearch: {} }] } });
        return { data: parseGroundedJson(response.text, '{}'), sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks };
    },
    findInfluencers: async ({ city, category, followerRange, language }) => {
        const ai = getAi();
        const prompt = `Language: ${language === 'ar' ? 'Arabic' : 'English'}. Using Google Search, find influencers in ${city} for niche ${category} with ${followerRange} followers. Return only a valid JSON array.`;
        const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt, config: { systemInstruction: "You are an influencer marketing specialist using Google Search.", tools: [{ googleSearch: {} }] } });
        return { data: parseGroundedJson(response.text, '[]'), sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks };
    },
    getOptimizerSuggestions: async ({ platform, industry, language }) => {
        const ai = getAi();
        const prompt = `Language: ${language === 'ar' ? 'Arabic' : 'English'}. Using Google Search, provide posting times and content ideas for ${platform} in the ${industry} niche for the MENA region. Return only a valid JSON object.`;
        const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt, config: { systemInstruction: "You are a social media optimizer using Google Search.", tools: [{ googleSearch: {} }] } });
        return { data: parseGroundedJson(response.text, '{}'), sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks };
    },
    generateLandingPageCopy: async ({ productDescription, language }) => {
        const ai = getAi();
        const prompt = `Language: ${language === 'ar' ? 'Arabic' : 'English'}. Generate landing page copy for: "${productDescription}"`;
        const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt, config: { systemInstruction: "You are a conversion copywriter for the MENA market.", responseMimeType: "application/json", responseSchema: landingPageSchema } });
        return JSON.parse(response.text.trim());
    },
    generateEmailCampaign: async ({ campaignGoal, productDescription, language }) => {
        const ai = getAi();
        const prompt = `Language: ${language === 'ar' ? 'Arabic' : 'English'}. Generate 2-3 emails for a campaign with goal: "${campaignGoal}" for product: "${productDescription}"`;
        const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt, config: { systemInstruction: "You are an expert email marketer for the Gulf region.", responseMimeType: "application/json", responseSchema: emailCampaignSchema } });
        return JSON.parse(response.text.trim());
    },
    generateAffiliateOutreach: async ({ productDescription, offer, language }) => {
        const ai = getAi();
        const prompt = `Language: ${language === 'ar' ? 'Arabic' : 'English'}. Write an affiliate recruitment email for product: "${productDescription}" with offer: "${offer}"`;
        const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt, config: { systemInstruction: "You are a partnership manager for the Middle East.", responseMimeType: "application/json", responseSchema: affiliateOutreachSchema } });
        return JSON.parse(response.text.trim());
    },
    generateCrmPersona: async ({ audienceDescription, language }) => {
        const ai = getAi();
        const prompt = `Language: ${language === 'ar' ? 'Arabic' : 'English'}. Create a customer persona for: "${audienceDescription}"`;
        const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt, config: { systemInstruction: "You are a market research analyst for the MENA region.", responseMimeType: "application/json", responseSchema: crmPersonaSchema } });
        return JSON.parse(response.text.trim());
    },
};

// --- Main Handler ---
// This is a generic handler that should be adapted to your serverless environment (Vercel, Netlify, etc.)
export default async function handler(req: ApiRequest, res: ApiResponse) {
    try {
        const { endpoint, params } = req.body;
        
        if (!endpoint || !apiFunctions[endpoint]) {
            return res.status(400).json({ error: 'Invalid endpoint' });
        }

        const result = await apiFunctions[endpoint](params);
        return res.status(200).json(result);

    } catch (error: any) {
        console.error(`Error in API route for endpoint '${req.body?.endpoint}':`, error);
        return res.status(500).json({ error: error.message || 'An internal server error occurred.' });
    }
}
