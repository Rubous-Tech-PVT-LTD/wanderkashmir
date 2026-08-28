import { KeywordResearchData, SerpResearchData, GoogleTrendsData, KeywordPlannerData } from '../types';

export interface KeywordResearchProvider {
  getKeywordMetrics(topic: string, location?: string): Promise<KeywordResearchData>;
}

export interface SerpResearchProvider {
  getSerpResults(topic: string, location?: string): Promise<SerpResearchData>;
}

export interface GoogleTrendsProvider {
  getTrends(target: string): Promise<GoogleTrendsData>;
}

export interface KeywordPlannerProvider {
  getPlannerData(target: string): Promise<KeywordPlannerData>;
}

// In-memory cache for this session
const cache = new Map<string, any>();
const researchCache = new Map<string, any>();

function getCacheKey(provider: string, topic: string) {
  return `${provider}:${topic.toLowerCase()}`;
}

export class DefaultKeywordProvider implements KeywordResearchProvider {
  async getKeywordMetrics(topic: string, location?: string): Promise<KeywordResearchData> {
    return {
      status: 'DISABLED',
      source: 'Paid Provider Disabled by Policy',
      searchVolume: 'N/A',
      difficulty: 'N/A',
      intent: 'N/A',
      relatedKeywords: []
    };
  }
}

export class DefaultSerpProvider implements SerpResearchProvider {
  async getSerpResults(topic: string, location?: string): Promise<SerpResearchData> {
    return {
      status: 'DISABLED',
      source: 'Paid Provider Disabled by Policy',
      results: [],
      commonTopics: []
    };
  }
}

// Singleton instances
export const keywordProvider = new DefaultKeywordProvider();
export const serpProvider: SerpResearchProvider = new DefaultSerpProvider();

class DefaultGoogleTrendsProvider implements GoogleTrendsProvider {
  async getTrends(target: string): Promise<GoogleTrendsData> {
    const cacheKey = `trends:${target}`;
    if (researchCache.has(cacheKey)) return researchCache.get(cacheKey);

    const data: GoogleTrendsData = {
      status: 'UNAVAILABLE',
      source: 'Google Trends unavailable',
      trendSignal: 'UNAVAILABLE'
    };

    researchCache.set(cacheKey, data);
    return data;
  }
}

class DefaultKeywordPlannerProvider implements KeywordPlannerProvider {
  async getPlannerData(target: string): Promise<KeywordPlannerData> {
    const cacheKey = `planner:${target}`;
    if (researchCache.has(cacheKey)) return researchCache.get(cacheKey);

    const data: KeywordPlannerData = {
      status: 'UNAVAILABLE',
      source: 'Keyword Planner unavailable',
      searchVolume: 'N/A',
      competition: 'N/A',
      relatedKeywords: []
    };

    researchCache.set(cacheKey, data);
    return data;
  }
}

export const googleTrendsProvider: GoogleTrendsProvider = new DefaultGoogleTrendsProvider();
export const keywordPlannerProvider: KeywordPlannerProvider = new DefaultKeywordPlannerProvider();
