import { Language, SmmPlanResult, GroundedResult, InfluencerResult, OptimizerResult, KeywordResult, ContentBriefResult, AdIdeasResult, ShortFormIdeasResult, LandingPageResult, EmailCampaignResult, AffiliateResult, CrmResult } from '../types.ts';

/**
 * A helper function to call our backend proxy API.
 * This function centralizes the fetch logic for all Gemini-related requests.
 * @param endpoint The specific Gemini function to call on the backend.
 * @param params The arguments for that function.
 * @returns The JSON response from the backend.
 */
async function callGeminiApi<T>(endpoint: string, params: object): Promise<T> {
    try {
        const response = await fetch('/api/gemini', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ endpoint, params }),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || `API call to endpoint '${endpoint}' failed with status ${response.status}`);
        }

        return result;
    } catch (error) {
        console.error(`Error calling backend for endpoint '${endpoint}':`, error);
        // Re-throw the error to be caught by the component's error handler
        throw error;
    }
}

// All functions are now thin wrappers that call the backend proxy.

export const generateAdIdeas = (product: string, audience: string, sellingPoints: string, language: Language): Promise<AdIdeasResult> => {
    return callGeminiApi('generateAdIdeas', { product, audience, sellingPoints, language });
};

export const generateShortFormIdeas = (longContent: string, language: Language): Promise<ShortFormIdeasResult> => {
    return callGeminiApi('generateShortFormIdeas', { longContent, language });
};

export const generateShortFormIdeasFromImage = (prompt: string, imageBase64: string, imageMimeType: string, language: Language): Promise<ShortFormIdeasResult> => {
    return callGeminiApi('generateShortFormIdeasFromImage', { prompt, imageBase64, imageMimeType, language });
};

export const generateSmmPlan = (topic: string, numPosts: number, platform: string, language: Language): Promise<GroundedResult<SmmPlanResult>> => {
    return callGeminiApi('generateSmmPlan', { topic, numPosts, platform, language });
};

export const generateKeywords = (topic: string, language: Language): Promise<GroundedResult<KeywordResult>> => {
    return callGeminiApi('generateKeywords', { topic, language });
};

export const generateContentBrief = (topic: string, language: Language): Promise<GroundedResult<ContentBriefResult>> => {
    return callGeminiApi('generateContentBrief', { topic, language });
};

export const findInfluencers = (city: string, category: string, followerRange: string, language: Language): Promise<GroundedResult<InfluencerResult>> => {
    return callGeminiApi('findInfluencers', { city, category, followerRange, language });
};

export const getOptimizerSuggestions = (platform: string, industry: string, language: Language): Promise<GroundedResult<OptimizerResult>> => {
    return callGeminiApi('getOptimizerSuggestions', { platform, industry, language });
};

export const generateLandingPageCopy = (productDescription: string, language: Language): Promise<LandingPageResult> => {
    return callGeminiApi('generateLandingPageCopy', { productDescription, language });
};

export const generateEmailCampaign = (campaignGoal: string, productDescription: string, language: Language): Promise<EmailCampaignResult> => {
    return callGeminiApi('generateEmailCampaign', { campaignGoal, productDescription, language });
};

export const generateAffiliateOutreach = (productDescription: string, offer: string, language: Language): Promise<AffiliateResult> => {
    return callGeminiApi('generateAffiliateOutreach', { productDescription, offer, language });
};

export const generateCrmPersona = (audienceDescription: string, language: Language): Promise<CrmResult> => {
    return callGeminiApi('generateCrmPersona', { audienceDescription, language });
};
