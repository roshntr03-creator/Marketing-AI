import { GoogleGenAI, Type } from "@google/genai";
import { Language, SmmPlanResult, GroundedResult, InfluencerResult, OptimizerResult } from '../types.ts';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

/**
 * A robust function to parse JSON from a string that might contain markdown or other text.
 * It finds the main JSON object or array and attempts to parse it.
 * @param text The raw string from the API response.
 * @param fallback The fallback value if parsing fails (e.g., '[]' or '{}').
 * @returns The parsed JSON object.
 */
const parseGroundedJson = (text: string, fallback: string = '[]') => {
    try {
        // Attempt to find the start and end of the main JSON structure
        const firstBracket = text.indexOf('[');
        const firstBrace = text.indexOf('{');
        
        let startIndex = -1;
        
        if (firstBracket === -1 && firstBrace === -1) {
            return JSON.parse(fallback);
        }

        if (firstBracket !== -1 && firstBrace !== -1) {
            startIndex = Math.min(firstBracket, firstBrace);
        } else if (firstBracket !== -1) {
            startIndex = firstBracket;
        } else {
            startIndex = firstBrace;
        }

        const isArray = text[startIndex] === '[';
        const lastBracketOrBrace = isArray ? text.lastIndexOf(']') : text.lastIndexOf('}');
        
        if (startIndex === -1 || lastBracketOrBrace === -1) {
            // Fallback to trying to parse the whole string after cleaning it up a bit
            const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(cleanedText);
        }
        
        const jsonStr = text.substring(startIndex, lastBracketOrBrace + 1);
        return JSON.parse(jsonStr);

    } catch (e) {
        console.warn("Failed to parse JSON with robust parser, falling back. Original text:", text);
        return JSON.parse(fallback);
    }
};


const adIdeasSchema = {
    type: Type.ARRAY,
    description: "A list of 3-5 distinct ad ideas.",
    items: {
        type: Type.OBJECT,
        properties: {
            angle: {
                type: Type.STRING,
                description: "The marketing angle or strategy for this ad (e.g., 'Focus on luxury', 'Highlight durability')."
            },
            headline: {
                type: Type.STRING,
                description: "A short, catchy headline for the ad."
            },
            body: {
                type: Type.STRING,
                description: "The main ad copy, 2-4 sentences long."
            },
            cta: {
                type: Type.STRING,
                description: "A clear call to action (e.g., 'Shop Now', 'Learn More')."
            }
        },
        required: ["angle", "headline", "body", "cta"]
    }
};

const shortFormIdeasSchema = {
    type: Type.ARRAY,
    description: "A list of 3-5 distinct short-form video ideas.",
    items: {
        type: Type.OBJECT,
        properties: {
            title: {
                type: Type.STRING,
                description: "A short, catchy title for the video clip (max 50 characters)."
            },
            hook: {
                type: Type.STRING,
                description: "A strong hook to grab attention in the first 3 seconds."
            },
            script: {
                type: Type.STRING,
                description: "The main script for the video, concise and engaging (3-5 sentences)."
            },
            cta: {
                type: Type.STRING,
                description: "A clear call to action for the end of the video."
            },
            visualSuggestion: {
                type: Type.STRING,
                description: "A simple suggestion for visuals (e.g., 'Talking head with text overlays', 'Quick cuts of the product')."
            }
        },
        required: ["title", "hook", "script", "cta", "visualSuggestion"]
    }
};

const landingPageSchema = {
    type: Type.OBJECT,
    properties: {
        headline: { type: Type.STRING, description: "A powerful, attention-grabbing headline." },
        subheadline: { type: Type.STRING, description: "A supportive subheadline that elaborates on the headline." },
        body: { type: Type.STRING, description: "Persuasive body copy explaining the benefits, 3-4 sentences." },
        cta: { type: Type.STRING, description: "A strong, clear call-to-action." },
    },
    required: ["headline", "subheadline", "body", "cta"],
};

const emailCampaignSchema = {
    type: Type.ARRAY,
    description: "A list of 2-3 email ideas for the campaign.",
    items: {
        type: Type.OBJECT,
        properties: {
            subject: { type: Type.STRING, description: "A compelling email subject line." },
            body: { type: Type.STRING, description: "The full body of the email, written in a persuasive and professional tone." },
        },
        required: ["subject", "body"],
    },
};

const affiliateOutreachSchema = {
    type: Type.OBJECT,
    properties: {
        subject: { type: Type.STRING, description: "A professional and enticing subject line for the outreach email." },
        body: { type: Type.STRING, description: "The full body of the email, explaining the program and its benefits." },
    },
    required: ["subject", "body"],
};

const crmPersonaSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING, description: "A representative name for the persona (e.g., 'Ambitious Aisha')." },
        demographics: { type: Type.STRING, description: "A summary of key demographics (age, location, profession, etc.)." },
        goals: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of 3-4 primary goals for this persona." },
        painPoints: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of 3-4 key challenges or pain points." },
    },
    required: ["name", "demographics", "goals", "painPoints"],
};

const keywordsSchema = {
    type: Type.OBJECT,
    properties: {
        keywords: {
            type: Type.ARRAY,
            description: "A list of 10-15 relevant keywords, including a mix of short-tail and long-tail.",
            items: { type: Type.STRING },
        },
        searchIntent: {
            type: Type.STRING,
            description: "A brief description of the likely user search intent (e.g., 'Informational', 'Commercial', 'Navigational')."
        },
    },
    required: ["keywords", "searchIntent"],
};

const contentBriefSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING, description: "A compelling, SEO-friendly title for the article." },
        hook: { type: Type.STRING, description: "An engaging opening sentence or question to capture the reader's attention." },
        introduction: { type: Type.STRING, description: "A short introduction (2-3 sentences) to the topic." },
        bodySections: {
            type: Type.ARRAY,
            description: "An array of 3-5 main sections for the article body.",
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING, description: "The subtitle for this section." },
                    points: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of key points or questions to cover in this section." },
                },
                required: ["title", "points"],
            }
        },
        cta: { type: Type.STRING, description: "A clear call-to-action for the end of the article." },
        seoMetaDescription: { type: Type.STRING, description: "A concise and compelling meta description for SEO (max 160 characters)." },
    },
    required: ["title", "hook", "introduction", "bodySections", "cta", "seoMetaDescription"],
};

export const generateAdIdeas = async (product: string, audience: string, sellingPoints: string, language: Language) => {
    const systemInstruction = "You are 'Marketing AI', an expert advertising copywriter with experience in high-impact campaigns for the Saudi and Gulf markets. Your ideas must be creative, culturally sensitive, and persuasive. The target language is determined by the user's prompt.";
    const prompt = `Language: ${language === Language.AR ? 'Modern Standard Arabic' : 'English'}. Generate 3-5 distinct ad ideas for the following product. For each idea, provide a clear marketing angle, a compelling headline, professional body copy, and a strong call to action.
    
    Product/Service: "${product}"
    Target Audience: "${audience}"
    Key Selling Points:
    ${sellingPoints}`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: adIdeasSchema,
            },
        });

        const jsonStr = response.text.trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("Error generating ad ideas:", error);
        throw new Error("Failed to generate ad ideas from Gemini API.");
    }
};

export const generateShortFormIdeas = async (longContent: string, language: Language) => {
    const systemInstruction = "You are 'Marketing AI', a viral social media content creator and strategist, expert on TikTok and Instagram Reels trends in the Middle East. Your ideas must be engaging, thumb-stopping, and highly shareable for a Gulf audience. The target language is determined by the user's prompt.";
    const prompt = `Language: ${language === Language.AR ? 'Modern Standard Arabic' : 'English'}. Analyze the following text and extract 3-5 distinct, engaging short video ideas. The ideas must be tailored for a Middle Eastern audience.
    
    Source Text: """
    ${longContent}
    """
    
    For each idea, provide a catchy title, a strong hook, a concise script, a clear call to action, and a simple visual suggestion.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: shortFormIdeasSchema,
            },
        });

        const jsonStr = response.text.trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("Error generating short-form ideas:", error);
        throw new Error("Failed to generate short-form ideas from Gemini API.");
    }
};

export const generateShortFormIdeasFromImage = async (prompt: string, imageBase64: string, imageMimeType: string, language: Language) => {
    const systemInstruction = "You are 'Marketing AI', a viral social media content creator and strategist, expert on TikTok and Instagram Reels trends in the Middle East. Your ideas must be engaging, thumb-stopping, and highly shareable for a Gulf audience. The target language is determined by the user's prompt.";
    
    const imagePart = {
      inlineData: {
        mimeType: imageMimeType,
        data: imageBase64,
      },
    };
    
    const textPart = {
        text: `Language: ${language === Language.AR ? 'Modern Standard Arabic' : 'English'}. Based on the attached image, generate 3-5 distinct, engaging short video ideas for a Middle Eastern audience. Here is the prompt: "${prompt}". For each idea, provide a catchy title, a strong hook, a concise script, a clear call to action, and a simple visual suggestion.`
    };

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: [imagePart, textPart] },
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: shortFormIdeasSchema,
            },
        });

        const jsonStr = response.text.trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("Error generating short-form ideas from image:", error);
        throw new Error("Failed to generate short-form ideas from Gemini API.");
    }
};


export const generateSmmPlan = async (topic: string, numPosts: number, platform: string, language: Language): Promise<GroundedResult<SmmPlanResult>> => {
    if (!topic || topic.trim() === "") {
        throw new Error("Campaign topic cannot be empty.");
    }
    const systemInstruction = "You are 'Marketing AI', an expert social media manager who creates comprehensive, data-driven content calendars for businesses in the Middle East. You must use Google Search to find timely information to make your plans strategic and relevant. The target language is determined by the user's prompt.";
    const prompt = `Language: ${language === Language.AR ? 'Arabic' : 'English'}. Using Google Search, research the campaign topic "${topic}" for a Middle Eastern audience. Create a content plan for ${numPosts} days on the ${platform} platform. Incorporate any relevant upcoming events, holidays, or current trends you find into the plan to make it timely and engaging.

Return your response as a single, valid JSON array of objects. Do not include any introductory text, closing text, or markdown formatting like \`\`\`json. The entire response must be only the JSON array. Each object must have the following keys: "day" (integer), "contentType", "caption", and "hashtags" (an array of strings).`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction,
                tools: [{ googleSearch: {} }],
            },
        });
        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        const data = parseGroundedJson(response.text, '[]');
        return { data, sources };
    } catch (error) {
        console.error("Error generating SMM plan:", error);
        throw new Error("Failed to generate SMM plan from Gemini API.");
    }
};

export const generateKeywords = async (topic: string, language: Language) => {
    if (!topic || topic.trim() === "") {
        throw new Error("Topic cannot be empty.");
    }
    const systemInstruction = "You are 'Marketing AI', an SEO expert specializing in keyword research for the MENA region. Your suggestions should be highly relevant and cover different search intents.";
    const prompt = `Language: ${language === Language.AR ? 'Arabic' : 'English'}. Generate a list of relevant keywords and the primary search intent for the topic: "${topic}".`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: keywordsSchema,
            },
        });
        const jsonStr = response.text.trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("Error generating keywords:", error);
        throw new Error("Failed to generate keywords from Gemini API.");
    }
};

export const generateContentBrief = async (topic: string, language: Language) => {
    const systemInstruction = "You are 'Marketing AI', a content strategist who creates detailed, SEO-optimized content briefs for writers.";
    const prompt = `Language: ${language === Language.AR ? 'Arabic' : 'English'}. Create a comprehensive content brief for an article on the topic: "${topic}".`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: contentBriefSchema,
            },
        });
        const jsonStr = response.text.trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("Error generating content brief:", error);
        throw new Error("Failed to generate content brief from Gemini API.");
    }
};

export const findInfluencers = async (city: string, category: string, followerRange: string, language: Language): Promise<GroundedResult<InfluencerResult>> => {
    const systemInstruction = "You are 'Marketing AI', an influencer marketing specialist. Use Google Search to find real and relevant social media influencers based on user criteria in the Middle East. Prioritize providing profile URLs when available.";
    const prompt = `Language: ${language === Language.AR ? 'Arabic' : 'English'}. Using Google Search, find social media influencers who match the following criteria:
    - City: ${city}
    - Niche/Category: ${category}
    - Follower Range: ${followerRange}
    
    Return your response as a single, valid JSON array of objects. Do not include any introductory text, closing text, or markdown formatting like \`\`\`json. The entire response must be only the JSON array. Each object must have keys for "username", "platform", "followers", "category", "bio", and an optional "profileUrl".`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction,
                tools: [{ googleSearch: {} }],
            },
        });
        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        const data = parseGroundedJson(response.text, '[]');
        return { data, sources };
    } catch (error) {
        console.error("Error finding influencers:", error);
        throw new Error("Failed to find influencers from Gemini API.");
    }
};

export const getOptimizerSuggestions = async (platform: string, industry: string, language: Language): Promise<GroundedResult<OptimizerResult>> => {
    const systemInstruction = "You are 'Marketing AI', a social media optimization expert. Use Google Search to find the latest data and trends to provide the best recommendations.";
    const prompt = `Language: ${language === Language.AR ? 'Arabic' : 'English'}. Based on recent data from Google Search for the MENA region, provide recommendations for the best times to post and a list of content ideas for the following:
    - Platform: ${platform}
    - Industry/Niche: ${industry}
    
    Return your response as a single, valid JSON object. Do not include any introductory text, closing text, or markdown formatting like \`\`\`json. The entire response must be only the JSON object. The object must have keys "postingTimes" (an array of objects with "day" and "times") and "contentIdeas" (an array of strings).`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction,
                tools: [{ googleSearch: {} }],
            },
        });
        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        const data = parseGroundedJson(response.text, '{}');
        return { data, sources };
    } catch (error) {
        console.error("Error getting optimizer suggestions:", error);
        throw new Error("Failed to get optimizer suggestions from Gemini API.");
    }
};

export const generateLandingPageCopy = async (productDescription: string, language: Language) => {
    const systemInstruction = "You are 'Marketing AI', a world-class conversion copywriter specializing in direct response for the MENA market. Your copy must be persuasive, clear, and benefit-driven.";
    const prompt = `Language: ${language === Language.AR ? 'Arabic' : 'English'}. Generate compelling landing page copy for the following product/service.
    
    Product/Service: "${productDescription}"`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: landingPageSchema,
            },
        });
        const jsonStr = response.text.trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("Error generating landing page copy:", error);
        throw new Error("Failed to generate landing page copy from Gemini API.");
    }
};

export const generateEmailCampaign = async (campaignGoal: string, productDescription: string, language: Language) => {
    const systemInstruction = "You are 'Marketing AI', an expert email marketer who writes high-converting campaigns for e-commerce and SaaS businesses in the Gulf region.";
    const prompt = `Language: ${language === Language.AR ? 'Arabic' : 'English'}. Generate a sequence of 2-3 marketing emails for the following campaign.
    
    Campaign Goal: "${campaignGoal}"
    Product/Service: "${productDescription}"`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: emailCampaignSchema,
            },
        });
        const jsonStr = response.text.trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("Error generating email campaign:", error);
        throw new Error("Failed to generate email campaign from Gemini API.");
    }
};

export const generateAffiliateOutreach = async (productDescription: string, offer: string, language: Language) => {
    const systemInstruction = "You are 'Marketing AI', a partnership manager specializing in building affiliate networks in the tech and e-commerce spaces in the Middle East.";
    const prompt = `Language: ${language === Language.AR ? 'Arabic' : 'English'}. Write a professional and persuasive outreach email to recruit a new affiliate.
    
    Product/Service: "${productDescription}"
    Affiliate Offer: "${offer}"`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: affiliateOutreachSchema,
            },
        });
        const jsonStr = response.text.trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("Error generating affiliate outreach:", error);
        throw new Error("Failed to generate affiliate outreach from Gemini API.");
    }
};

export const generateCrmPersona = async (audienceDescription: string, language: Language) => {
    const systemInstruction = "You are 'Marketing AI', a market research analyst who creates detailed, actionable customer personas for strategic marketing planning in the MENA region.";
    const prompt = `Language: ${language === Language.AR ? 'Arabic' : 'English'}. Based on the following audience description, create a detailed customer persona.
    
    Audience Description: "${audienceDescription}"`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: crmPersonaSchema,
            },
        });
        const jsonStr = response.text.trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("Error generating CRM persona:", error);
        throw new Error("Failed to generate CRM persona from Gemini API.");
    }
};