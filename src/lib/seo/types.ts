export interface KeywordResearchData {
  status: 'AVAILABLE' | 'UNAVAILABLE' | 'PROVIDER_RATE_LIMITED' | 'DISABLED';
  source: string;
  searchVolume: number | 'N/A';
  difficulty: number | 'N/A';
  intent: string | 'N/A';
  relatedKeywords: string[];
}

export interface SerpResearchData {
  status: 'AVAILABLE' | 'UNAVAILABLE' | 'PROVIDER_RATE_LIMITED' | 'DISABLED';
  source: string;
  results: Array<{
    position: number;
    title: string;
    url: string;
    contentType: string;
  }>;
  commonTopics: string[];
}

export interface GoogleTrendsData {
  status: 'AVAILABLE' | 'UNAVAILABLE';
  source: string;
  trendSignal: 'RISING' | 'STABLE' | 'DECLINING' | 'SEASONAL' | 'UNAVAILABLE';
}

export interface KeywordPlannerData {
  status: 'AVAILABLE' | 'UNAVAILABLE';
  source: string;
  searchVolume: number | 'N/A';
  competition: 'LOW' | 'MEDIUM' | 'HIGH' | 'N/A';
  relatedKeywords: string[];
}

export interface SeoResearch {
  target: string;
  pageType: string;
  isExistingPage: boolean;
  pageUrl?: string;
  
  gsc: {
    hasPageLevelHistory: boolean;
    pageMetrics?: {
      clicks: number;
      impressions: number;
      ctr: number;
      position: number;
    };
    topQueries: any[];
    relatedQueries: any[];
    opportunities: any[];
  };
  
  keywordResearch: KeywordResearchData;
  serpResearch: SerpResearchData;
  googleTrends: GoogleTrendsData;
  keywordPlanner: KeywordPlannerData;
  
  searchIntent: string;
  
  contentGaps: string[];
  
  cannibalizationRisk: {
    competingPages: { url: string; title: string; type: string }[];
    recommendation: 'CREATE_NEW' | 'KEEP_SEPARATE' | 'OPTIMIZE_EXISTING' | 'CONSOLIDATE' | 'REDIRECT' | 'REWRITE_FOR_DIFFERENT_INTENT' | 'MANUAL_REVIEW';
    reason?: string;
  };

  historicalBaseline?: any;
  performanceDelta?: {
    status: 'STRONG_PERFORMER' | 'STABLE' | 'IMPROVEMENT_CANDIDATE' | 'INSUFFICIENT_DATA';
    reason: string;
  };
}

export type ComponentAction = 'PROTECT' | 'OPTIMIZE' | 'EXPAND' | 'ADD' | 'REMOVE';

export interface StrategyComponent {
  action: ComponentAction;
  reason: string;
  content?: string; // New content or guidelines if optimizing
}

export interface SeoStrategy {
  primaryTopic: string;
  queriesToProtect: string[];
  queriesToImprove: string[];
  title: StrategyComponent;
  metaDescription: StrategyComponent;
  h1Heading: StrategyComponent;
  sections: {
    heading: string;
    action: ComponentAction;
    reason: string;
    contentGuidelines?: string;
  }[];
  faqs: StrategyComponent;
  internalLinks: StrategyComponent;
  recommendedAction: 'KEEP' | 'OPTIMIZE' | 'MONITOR' | 'CONSOLIDATE';
}

export interface ContentOpportunity {
  topic: string;
  cluster: string[];
  type: 'CREATE' | 'OPTIMIZE' | 'MONITOR' | 'IGNORE' | 'MANUAL_REVIEW';
  evidence: string;
  gscSignals: {
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  };
  intent: 'INFORMATIONAL' | 'NAVIGATIONAL' | 'COMMERCIAL' | 'TRANSACTIONAL' | 'LOCAL' | 'UNKNOWN';
  businessRelevance: 'HIGH' | 'MEDIUM' | 'LOW';
  existingPage?: { url: string; title: string; type: string };
  cannibalizationRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  googleTrends?: string;
  keywordPlanner?: string;
  opportunityScore: number;
  reason: string;
}

export interface SeoValidationResult {
  status: 'PASS' | 'FIX' | 'REJECT';
  issues: string[];
}
