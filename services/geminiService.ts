import { GoogleGenAI, Type, GenerateContentResponse, GroundingMetadata } from "@google/genai";
import { Language, SmmPlanResult, GroundedResult, InfluencerResult, OptimizerResult, KeywordResult, ContentBriefResult, AdIdeasResult, ShortFormIdeasResult, LandingPageResult, EmailCampaignResult, AffiliateResult, CrmResult, GroundingSource } from '../types.ts';

// Initialize the Google AI client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const model = 'gemini-2.5-flash';

/**
 * Safely parses a JSON string from the model's text response.
 * It robustly handles cases where the JSON is wrapped in markdown, or has leading/trailing text.
 * @param text The raw text response from the model.
 * @returns The parsed JSON object.
 */
function safelyParseJson<T>(text: string): T {
    // Attempt to find a JSON blob enclosed in ```json ... ``` or just ```...```
    const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    let jsonText = text;

    if (match && match[1]) {
        jsonText = match[1];
    } else {
        // If no markdown block, find the first '{' or '[' to start parsing from.
        // This helps strip leading non-JSON text.
        const firstBracket = text.indexOf('{');
        const firstSquareBracket = text.indexOf('[');
        
        if (firstBracket !== -1 || firstSquareBracket !== -1) {
            const startIndex = (firstBracket === -1) 
                ? firstSquareBracket 
                : (firstSquareBracket === -1) 
                    ? firstBracket 
                    : Math.min(firstBracket, firstSquareBracket);
            
            jsonText = text.substring(startIndex);
        }
    }
    
    try {
        return JSON.parse(jsonText) as T;
    } catch (error) {
        console.error("Failed to parse JSON. Raw text:", text);
        console.error("Attempted to parse:", jsonText);
        throw new Error("The model returned data in an unexpected format. Please try again.");
    }
}

/**
* Extracts grounding sources from the response metadata.
* @param response The GenerateContentResponse from the Gemini API.
* @returns An array of grounding sources, or undefined.
*/
const extractSources = (response: GenerateContentResponse): GroundingSource[] | undefined => {
    const metadata: GroundingMetadata | undefined = response.candidates?.[0]?.groundingMetadata;
    if (metadata?.groundingChunks) {
        return metadata.groundingChunks.map(chunk => ({
            web: {
                uri: chunk.web?.uri,
                title: chunk.web?.title,
            }
        }));
    }
    return undefined;
};


/**
 * A helper function to call the Gemini API directly for grounded results.
 * This is used for functions requiring Google Search grounding.
 * @param prompt The text prompt to send to the model.
 * @returns A promise that resolves to a GroundedResult.
 */
async function getGroundedResult<T>(prompt: string): Promise<GroundedResult<T>> {
    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });
        const data = safelyParseJson<T>(response.text);
        const sources = extractSources(response);
        return { data, sources };
    } catch (error) {
        console.error("Error getting grounded result:", error);
        throw new Error(`Failed to process grounded request. Details: ${(error as Error).message}`);
    }
}


/**
 * A helper function to call the Gemini API directly for JSON results with a defined schema.
 * @param prompt The text prompt to send to the model.
 * @param responseSchema The OpenAPI schema for the expected JSON response.
 * @returns A promise that resolves to the parsed JSON data.
 */
async function getJsonResult<T>(prompt: string, responseSchema: object): Promise<T> {
     try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });
        return safelyParseJson<T>(response.text);
    } catch (error) {
        console.error("Error getting JSON result:", error);
        throw new Error(`Failed to process JSON request. Details: ${(error as Error).message}`);
    }
}


// --- Rewritten Service Functions ---

export const generateAdIdeas = (product: string, audience: string, sellingPoints: string, language: Language): Promise<AdIdeasResult> => {
    if (!product || !audience || !sellingPoints) {
        return Promise.reject(new Error("Product, audience, and selling points must be provided."));
    }
    const prompt = `You are a creative marketing expert. Generate 3 diverse ad ideas for the following product.
    Product: ${product}
    Target Audience: ${audience}
    Key Selling Points: ${sellingPoints}
    Language: ${language === 'ar' ? 'Arabic' : 'English'}
    
    For each idea, provide a unique "angle", a compelling "headline", concise "body" copy, and a strong "cta" (call to action).`;
    
    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                angle: { type: Type.STRING },
                headline: { type: Type.STRING },
                body: { type: Type.STRING },
                cta: { type: Type.STRING },
            },
            required: ["angle", "headline", "body", "cta"],
        },
    };
    return getJsonResult<AdIdeasResult>(prompt, schema);
};

export const generateShortFormIdeas = (longContent: string, language: Language): Promise<ShortFormIdeasResult> => {
    if (!longContent) {
        return Promise.reject(new Error("Long content must be provided."));
    }
    const prompt = `Analyze this long-form content and extract 3 distinct ideas for short-form vertical videos (like TikTok or Reels).
    Content: "${longContent}"
    Language: ${language === 'ar' ? 'Arabic' : 'English'}
    
    For each idea, provide a "title", a strong "hook" to grab attention in the first 2 seconds, a brief "script" outline, a "visualSuggestion", and a "cta".`;
    
    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                hook: { type: Type.STRING },
                script: { type: Type.STRING },
                visualSuggestion: { type: Type.STRING },
                cta: { type: Type.STRING },
            },
            required: ["title", "hook", "script", "visualSuggestion", "cta"],
        },
    };
    return getJsonResult<ShortFormIdeasResult>(prompt, schema);
};

export const generateShortFormIdeasFromImage = async (prompt: string, imageBase64: string, imageMimeType: string, language: Language): Promise<ShortFormIdeasResult> => {
    if (!prompt || !imageBase64) {
        throw new Error("Prompt and image must be provided.");
    }
    const textPart = { text: `Based on this image and the user's goal, generate 2 ideas for short-form vertical videos.
    Goal: "${prompt}"
    Language: ${language === 'ar' ? 'Arabic' : 'English'}
    
    For each idea, provide a "title", "hook", "script", "visualSuggestion", and "cta".`};
    const imagePart = { inlineData: { mimeType: imageMimeType, data: imageBase64 } };

    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                hook: { type: Type.STRING },
                script: { type: Type.STRING },
                visualSuggestion: { type: Type.STRING },
                cta: { type: Type.STRING },
            },
            required: ["title", "hook", "script", "visualSuggestion", "cta"],
        },
    };
    
    const response = await ai.models.generateContent({
        model,
        contents: { parts: [textPart, imagePart] },
        config: {
            responseMimeType: "application/json",
            responseSchema: schema,
        },
    });

    return safelyParseJson<ShortFormIdeasResult>(response.text);
};


export const generateSmmPlan = (topic: string, numPosts: number, platform: string, language: Language): Promise<GroundedResult<SmmPlanResult>> => {
    if (!topic) {
        return Promise.reject(new Error("Topic must be provided."));
    }
    const prompt = `Create a social media content plan for ${numPosts} days about "${topic}" for the platform ${platform}.
    Incorporate relevant trends or events if applicable using your search tool.
    Language: ${language === 'ar' ? 'Arabic' : 'English'}
    
    Return the response as a single JSON array where each object represents a day and contains:
    - "day" (number)
    - "contentType" (string, e.g., 'Video', 'Carousel Post')
    - "caption" (string)
    - "hashtags" (array of strings)
    
    Do not include any other text or markdown formatting.`;
    return getGroundedResult<SmmPlanResult>(prompt);
};

export const generateKeywords = (topic: string, language: Language): Promise<GroundedResult<KeywordResult>> => {
    if (!topic) {
        return Promise.reject(new Error("Topic must be provided."));
    }
    const prompt = `For the topic "${topic}" in ${language === 'ar' ? 'Arabic' : 'English'}, generate a list of relevant SEO keywords and the primary search intent.
    Use your search tool to identify popular and long-tail keywords.
    
    Return the response as a single JSON object with two keys:
    - "keywords" (an array of strings)
    - "searchIntent" (a string explaining the user's goal)
    
    Do not include any other text or markdown formatting.`;
    return getGroundedResult<KeywordResult>(prompt);
};

export const generateContentBrief = (topic: string, language: Language): Promise<GroundedResult<ContentBriefResult>> => {
    if (!topic) {
        return Promise.reject(new Error("Topic must be provided."));
    }
    const prompt = `Create a detailed content brief for a blog post about "${topic}".
    Language: ${language === 'ar' ? 'Arabic' : 'English'}
    Use your search tool to understand the topic and suggest relevant sections.
    
    Return the response as a single JSON object with the following keys:
    - "title" (string)
    - "hook" (string)
    - "introduction" (string)
    - "bodySections" (an array of objects, each with "title" and "points" which is an array of strings)
    - "cta" (string)
    - "seoMetaDescription" (string)
    
    Do not include any other text or markdown formatting.`;
    return getGroundedResult<ContentBriefResult>(prompt);
};


export const findInfluencers = (city: string, category: string, followerRange: string, language: Language): Promise<GroundedResult<InfluencerResult>> => {
    if (!city || !category) {
        return Promise.reject(new Error("City and category must be provided."));
    }
    const prompt = `Find 3 influencers based in ${city} in the "${category}" niche with a follower range of ${followerRange}.
    Language: ${language === 'ar' ? 'Arabic' : 'English'}
    Use your search tool to find them.

    Return ONLY a single, valid JSON array in your response. Do not include any other text, explanations, or markdown formatting. The array should contain objects with the following structure:
    - "username" (string)
    - "platform" (string, e.g., 'Instagram')
    - "followers" (string, e.g., '55k')
    - "category" (string)
    - "bio" (string)
    - "profileUrl" (string, optional, the full URL)

    Example of a valid response:
    [
      {
        "username": "@example_influencer",
        "platform": "Instagram",
        "followers": "75k",
        "category": "Food Blogger",
        "bio": "Sharing the best eats in Jeddah.",
        "profileUrl": "https://instagram.com/example_influencer"
      }
    ]
    `;
    return getGroundedResult<InfluencerResult>(prompt);
};

export const getOptimizerSuggestions = (platform: string, industry: string, language: Language): Promise<GroundedResult<OptimizerResult>> => {
    if (!platform || !industry) {
        return Promise.reject(new Error("Platform and industry must be provided."));
    }
    const prompt = `Provide social media optimization suggestions for the "${industry}" industry on ${platform}.
    Language: ${language === 'ar' ? 'Arabic' : 'English'}
    Use your search tool to find recent data on optimal posting times.
    
    Return the response as a single JSON object with two keys:
    - "postingTimes" (an array of objects, each with "day" and "times")
    - "contentIdeas" (an array of strings)
    
    Do not include any other text or markdown formatting.`;
    return getGroundedResult<OptimizerResult>(prompt);
};

export const generateLandingPageCopy = (productDescription: string, language: Language): Promise<LandingPageResult> => {
    if (!productDescription) {
        return Promise.reject(new Error("Product description must be provided."));
    }
    const prompt = `Write compelling landing page copy for the following product.
    Product Description: "${productDescription}"
    Language: ${language === 'ar' ? 'Arabic' : 'English'}
    
    Provide a "headline", "subheadline", "body" text, and a "cta".`;

    const schema = {
        type: Type.OBJECT,
        properties: {
            headline: { type: Type.STRING },
            subheadline: { type: Type.STRING },
            body: { type: Type.STRING },
            cta: { type: Type.STRING },
        },
        required: ["headline", "subheadline", "body", "cta"],
    };
    return getJsonResult<LandingPageResult>(prompt, schema);
};

export const generateEmailCampaign = (campaignGoal: string, productDescription: string, language: Language): Promise<EmailCampaignResult> => {
    if (!campaignGoal || !productDescription) {
        return Promise.reject(new Error("Campaign goal and product description must be provided."));
    }
    const prompt = `Generate a sequence of 3 marketing emails for a campaign.
    Campaign Goal: ${campaignGoal}
    Product Description: ${productDescription}
    Language: ${language === 'ar' ? 'Arabic' : 'English'}
    
    For each email, provide a "subject" and "body".`;

    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                subject: { type: Type.STRING },
                body: { type: Type.STRING },
            },
            required: ["subject", "body"],
        },
    };
    return getJsonResult<EmailCampaignResult>(prompt, schema);
};

export const generateAffiliateOutreach = (productDescription: string, offer: string, language: Language): Promise<AffiliateResult> => {
    if (!productDescription || !offer) {
        return Promise.reject(new Error("Product description and offer must be provided."));
    }
    const prompt = `Write a professional and persuasive outreach email to recruit a new affiliate.
    Product: ${productDescription}
    Affiliate Offer: ${offer}
    Language: ${language === 'ar' ? 'Arabic' : 'English'}
    
    Provide a "subject" and "body" for the email.`;

    const schema = {
        type: Type.OBJECT,
        properties: {
            subject: { type: Type.STRING },
            body: { type: Type.STRING },
        },
        required: ["subject", "body"],
    };
    return getJsonResult<AffiliateResult>(prompt, schema);
};

export const generateCrmPersona = (audienceDescription: string, language: Language): Promise<CrmResult> => {
    if (!audienceDescription) {
        return Promise.reject(new Error("Audience description must be provided."));
    }
    const prompt = `Create a detailed customer persona based on this description.
    Audience Description: "${audienceDescription}"
    Language: ${language === 'ar' ? 'Arabic' : 'English'}
    
    Provide a fictional "name", "demographics", a list of "goals", and a list of "painPoints".`;

    const schema = {
        type: Type.OBJECT,
        properties: {
            name: { type: Type.STRING },
            demographics: { type: Type.STRING },
            goals: { type: Type.ARRAY, items: { type: Type.STRING } },
            painPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["name", "demographics", "goals", "painPoints"],
    };
    return getJsonResult<CrmResult>(prompt, schema);
};