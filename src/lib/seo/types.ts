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
    status?: 'SAFE' | 'MEDIUM_RISK' | 'HIGH_RISK';
    competingPages: { id?: string; url: string; title: string; type: string }[];
    recommendation: 'CREATE_NEW' | 'KEEP_SEPARATE' | 'OPTIMIZE_EXISTING' | 'CONSOLIDATE' | 'REDIRECT' | 'REWRITE_FOR_DIFFERENT_INTENT' | 'MANUAL_REVIEW';
    reason?: string;
  };

  historicalBaseline?: any;
  performanceDelta?: {
    status: 'STRONG_PERFORMER' | 'STABLE' | 'IMPROVEMENT_CANDIDATE' | 'INSUFFICIENT_DATA';
    reason: string;
  };
  manualReviewRecommendation?: ManualReviewRecommendation;
}

export interface CompetingPageCandidate {
  id?: string;
  url: string;
  title: string;
  type: string;
  role: 'PRIMARY_CANDIDATE' | 'SUPPORTING_INFORMATIONAL' | 'SUPPORTING_TRANSPORT' | 'SUPPORTING_COMMERCIAL' | 'POTENTIAL_DUPLICATE';
  intent?: string;
  intentAlignment: string;
  score: number;
  reasons: string[];
}

export interface ManualReviewRecommendation {
  direction: 'USE_EXISTING_PRIMARY' | 'CONSOLIDATE' | 'CREATE_NEW' | 'IGNORE';
  recommendedPrimaryPage: {
    id?: string;
    url: string;
    title: string;
    pageType: string;
    role?: string;
    score?: number;
    reasons?: string[];
    evidence?: string[];
  } | null;
  intent: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  reason: string;
  evidence: string[];
  competingPages: CompetingPageCandidate[];
  targetTopic?: string;
  searchIntent?: string;
  confidenceReason?: string;
  plainLanguageSummary?: string;
  suggestedAction?: 'USE_EXISTING_PRIMARY' | 'CONSOLIDATE' | 'CREATE_NEW' | 'MANUAL_SELECTION_REQUIRED';
}

export interface AdminManualReviewDecision {
  type: 'USE_EXISTING_PRIMARY' | 'CHOOSE_ANOTHER' | 'CREATE_NEW_PAGE' | 'IGNORE';
  primaryPageUrl?: string;
  primaryPageTitle?: string;
  primaryPageType?: string;
  source?: 'AI_RECOMMENDATION_ACCEPTED' | 'ADMIN_MANUAL_SELECTION' | 'ADMIN_CREATE_NEW_CONFIRMED' | 'ADMIN_IGNORED';
  reason?: string;
  confirmedDistinctIntent?: string;
  decidedBy?: string;
  decidedAt: string;
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
  competingPagesAnalysis?: string;
  manualReviewRequired?: boolean;
  adminDecision?: 'USE_EXISTING' | 'CONSOLIDATE' | 'CREATE_NEW' | 'IGNORE';
  selectedPrimaryPageUrl?: string;
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
  recommendedAction: 'KEEP' | 'OPTIMIZE' | 'MONITOR' | 'CONSOLIDATE' | 'MANUAL_REVIEW';
}

export interface ContentOpportunity {
  topic: string;
  canonicalTopic?: string;
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
  existingPage?: { id?: string; url: string; title: string; type: string };
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
