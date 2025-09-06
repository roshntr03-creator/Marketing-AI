export enum Language {
  EN = 'en',
  AR = 'ar',
}

export interface User {
    id: string;
    name: string;
    email: string;
    role?: 'admin' | 'user';
    subscription_status?: 'active' | 'inactive';
}

export interface AdIdea {
    angle: string;
    headline: string;
    body: string;
    cta: string;
}
export type AdIdeasResult = AdIdea[];

export interface ShortFormIdea {
    title: string;
    hook: string;
    script: string;
    cta: string;
    visualSuggestion: string;
}
export type ShortFormIdeasResult = ShortFormIdea[];

export interface SmmPostIdea {
    day: number;
    contentType: string;
    caption: string;
    hashtags: string[];
}
export type SmmPlanResult = SmmPostIdea[];

export interface LandingPageResult {
    headline: string;
    subheadline: string;
    body: string;
    cta: string;
}

export interface EmailResult {
    subject: string;
    body: string;
}
export type EmailCampaignResult = EmailResult[];


export interface AffiliateResult {
    subject: string;
    body: string;
}

export interface CrmResult {
    name: string;
    demographics: string;
    goals: string[];
    painPoints: string[];
}

export interface KeywordResult {
    keywords: string[];
    searchIntent: string;
}

export interface ContentBriefResult {
    title: string;
    hook: string;
    introduction: string;
    bodySections: {
        title: string;
        points: string[];
    }[];
    cta: string;
    seoMetaDescription: string;
}

export interface Influencer {
    username: string;
    platform: string;
    followers: string;
    category: string;
    bio: string;
    profileUrl?: string;
}
export type InfluencerResult = Influencer[];

export interface OptimizerResult {
    postingTimes: {
        day: string;
        times: string;
    }[];
    contentIdeas: string[];
}

export interface TestResult {
    name: string;
    status: 'idle' | 'running' | 'passed' | 'failed';
    message?: string;
}

export enum AppView {
    DASHBOARD = 'dashboard',
    SEO = 'seo',
    ADS = 'ads',
    CONTENT = 'content',
    SMM = 'smm',
    INFLUENCERS = 'influencers',
    OPTIMIZER = 'optimizer',
    LANDING_PAGES = 'landing_pages',
    EMAIL = 'email',
    AFFILIATE = 'affiliate',
    CRM = 'crm',
    ANALYTICS = 'analytics',
    TESTING = 'testing',
    MORE = 'more',
    ADMIN = 'admin',
    SETTINGS = 'settings',
    CONNECTING = 'connecting',
    OAUTH_CALLBACK = 'oauth_callback',
}

export interface KpiData {
    title: string;
    value: string;
    change: string;
    changeType: 'increase' | 'decrease';
}

export interface PerformanceDataPoint {
    day: string;
    value: number;
}

export interface ChannelPerformanceData {
    name: string;
    value: number;
    color: string;
}

export interface TopContentData {
    name: string;
    platform: 'Instagram' | 'TikTok' | 'X (Twitter)';
    reach: string;
    engagement: string;
}

export interface AdCampaign {
    name: string;
    status: 'Active' | 'Paused' | 'Completed';
    spend: string;
    results: string;
}

export interface GroundingSource {
  web?: {
    uri?: string;
    title?: string;
  }
}

export interface GroundedResult<T> {
  data: T;
  sources?: GroundingSource[];
}
