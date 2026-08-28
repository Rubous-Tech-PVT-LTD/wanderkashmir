import { CompetingPageCandidate, ManualReviewRecommendation } from './types';

/**
 * AI-Assisted Manual Review Recommendation Engine
 * Analyzes competing pages, target intent, entity relationships, and GSC signals
 * to recommend a single primary landing page candidate with explainable confidence.
 */
export function generateManualReviewRecommendation(
  targetTopic: string,
  searchIntent: string,
  competingPages: Array<{ url: string; title: string; type: string }>,
  gscQueries: any[] = []
): ManualReviewRecommendation {
  if (!competingPages || competingPages.length === 0) {
    return {
      targetTopic,
      searchIntent,
      recommendedPrimaryPage: null,
      confidence: 'INSUFFICIENT_EVIDENCE',
      confidenceReason: 'No competing pages detected in database for this entity.',
      plainLanguageSummary: 'No competing pages detected. You may proceed with normal optimization or creation.',
      competingPages: [],
      suggestedAction: 'CREATE_NEW'
    };
  }

  const topicLower = targetTopic.toLowerCase();
  const intentLower = (searchIntent || 'unknown').toLowerCase();
  const topicWords = topicLower.split(/[^a-z0-9]+/).filter(w => w.length > 2);

  const isAccommodationIntent = 
    intentLower === 'commercial' || 
    intentLower === 'transactional' || 
    topicWords.some(w => ['hotel', 'resort', 'homestay', 'stay', 'room', 'lodge'].includes(w));

  const isTransportIntent = 
    intentLower === 'local' || 
    topicWords.some(w => ['taxi', 'cab', 'fare', 'distance', 'ride'].includes(w));

  const isInformationalIntent = 
    intentLower === 'informational' || 
    topicWords.some(w => ['guide', 'weather', 'how', 'what', 'places', 'visit', 'history'].includes(w));

  const evaluatedCandidates: CompetingPageCandidate[] = competingPages.map(page => {
    const pageType = (page.type || 'PAGE').toUpperCase();
    const titleLower = (page.title || '').toLowerCase();
    const urlLower = (page.url || '').toLowerCase();

    let score = 50;
    let role: CompetingPageCandidate['role'] = 'POTENTIAL_DUPLICATE';
    let intentAlignment = 'General content match';
    const reasons: string[] = [];

    // Intent & Type Matrix
    if (isAccommodationIntent) {
      if (pageType === 'HOMESTAY' || pageType === 'PROPERTY') {
        score = 90;
        role = 'PRIMARY_CANDIDATE';
        intentAlignment = 'Direct match for commercial accommodation intent';
        reasons.push('Existing property/stay page directly matches commercial accommodation intent.');
        reasons.push('Serves user booking demand rather than passive reading.');
      } else if (pageType === 'BLOG') {
        score = 50;
        role = 'SUPPORTING_INFORMATIONAL';
        intentAlignment = 'Supporting informational / travel guide intent';
        reasons.push('Serves informational/reading intent rather than direct booking.');
        reasons.push('Can support the primary accommodation page via internal links.');
      } else if (pageType === 'TAXI') {
        score = 40;
        role = 'SUPPORTING_TRANSPORT';
        intentAlignment = 'Supporting transport / cab route intent';
        reasons.push('Serves local transportation to the resort rather than lodging.');
      } else if (pageType === 'DESTINATION') {
        score = 60;
        role = 'SUPPORTING_INFORMATIONAL';
        intentAlignment = 'Destination overview intent';
        reasons.push('Broad destination guide providing regional context.');
      }
    } else if (isTransportIntent) {
      if (pageType === 'TAXI') {
        score = 90;
        role = 'PRIMARY_CANDIDATE';
        intentAlignment = 'Direct transport / cab route match';
        reasons.push('Dedicated taxi/route page directly matches transport intent.');
      } else if (pageType === 'BLOG') {
        score = 50;
        role = 'SUPPORTING_INFORMATIONAL';
        intentAlignment = 'Supporting travel guide intent';
        reasons.push('Provides background travel information.');
      } else {
        score = 40;
        role = 'SUPPORTING_COMMERCIAL';
        intentAlignment = 'Supporting destination listing';
        reasons.push('Listing page where transport info is secondary.');
      }
    } else if (isInformationalIntent) {
      if (pageType === 'BLOG' || pageType === 'DESTINATION') {
        score = 90;
        role = 'PRIMARY_CANDIDATE';
        intentAlignment = 'Direct informational travel guide match';
        reasons.push('Comprehensive editorial guide matching search exploration.');
      } else {
        score = 45;
        role = 'SUPPORTING_COMMERCIAL';
        intentAlignment = 'Supporting commercial entity';
        reasons.push('Commercial entity page; informational queries are supporting.');
      }
    } else {
      // General entity match
      if (pageType === 'HOMESTAY' || pageType === 'PROPERTY') {
        score = 75;
        role = 'PRIMARY_CANDIDATE';
        intentAlignment = 'Primary commercial entity listing';
        reasons.push('Primary entity landing page.');
      } else {
        score = 55;
        role = 'SUPPORTING_INFORMATIONAL';
        intentAlignment = 'Supporting editorial content';
        reasons.push('Supporting content page.');
      }
    }

    // Keyword Overlap Bonus
    const matchingWords = topicWords.filter(w => titleLower.includes(w) || urlLower.includes(w));
    if (matchingWords.length >= 2) {
      score = Math.min(100, score + 8);
      reasons.push(`High keyword overlap with target topic (${matchingWords.join(', ')}).`);
    }

    return {
      url: page.url,
      title: page.title,
      type: pageType,
      role,
      intentAlignment,
      score,
      reasons
    };
  });

  // Sort candidates by score descending
  evaluatedCandidates.sort((a, b) => b.score - a.score);

  const topCandidate = evaluatedCandidates[0];
  const secondCandidate = evaluatedCandidates[1];

  let confidence: ManualReviewRecommendation['confidence'] = 'MEDIUM';
  let confidenceReason = '';

  if (topCandidate.score >= 85 && (!secondCandidate || (topCandidate.score - secondCandidate.score) >= 20)) {
    confidence = 'HIGH';
    confidenceReason = `Existing ${topCandidate.type} page directly matches ${searchIntent.toUpperCase()} intent while other pages serve supporting roles (${evaluatedCandidates.slice(1).map(c => c.type).join(', ')}).`;
  } else if (topCandidate.score >= 65) {
    confidence = 'MEDIUM';
    confidenceReason = `Existing ${topCandidate.type} page is the strongest candidate, but intent overlap exists with ${secondCandidate?.title || 'other pages'}.`;
  } else {
    confidence = 'LOW';
    confidenceReason = 'AI recommendation is uncertain due to overlapping relevance across multiple pages. Please review manually.';
  }

  const plainLanguageSummary = `The existing pages appear to serve different primary purposes:\n\n` +
    evaluatedCandidates.map(c => `• ${c.title} (${c.type}): ${c.intentAlignment || c.role}`).join('\n') +
    `\n\nWe recommend keeping "${topCandidate.title}" (${topCandidate.type}) as the primary ranking page for ${searchIntent.toLowerCase()} intent.`;

  const realEvidence = [
    `Target Search Intent: ${searchIntent.toUpperCase()}`,
    `Existing Competing Pages Detected: ${competingPages.length}`,
    `Leading Candidate: ${topCandidate.title} (${topCandidate.type})`,
    `Intent Alignment: ${topCandidate.intentAlignment}`,
    `Calculated Relevance Score: ${topCandidate.score}/100`,
    `GSC Page-Level History: ${gscQueries.length > 0 ? `${gscQueries.length} verified queries` : 'N/A / UNAVAILABLE (No direct page-level history)'}`,
    `Google Trends: UNAVAILABLE`,
    `Google Keyword Planner: UNAVAILABLE`,
    `Paid Keyword Research Provider: UNAVAILABLE (Disabled)`,
    `Paid SERP Provider: UNAVAILABLE (Disabled)`
  ];

  return {
    direction: 'USE_EXISTING_PRIMARY',
    recommendedPrimaryPage: {
      url: topCandidate.url,
      pageType: topCandidate.type,
      title: topCandidate.title,
      role: topCandidate.role,
      score: topCandidate.score,
      reasons: topCandidate.reasons,
      evidence: realEvidence
    },
    intent: isAccommodationIntent ? 'Commercial / Hotel Booking' : isTransportIntent ? 'Local / Transportation' : isInformationalIntent ? 'Informational / Research' : searchIntent.toUpperCase(),
    confidence: confidence === 'INSUFFICIENT_EVIDENCE' ? 'LOW' : confidence,
    reason: plainLanguageSummary,
    evidence: realEvidence,
    competingPages: evaluatedCandidates.map(c => ({
      ...c,
      intent: c.intentAlignment
    })),
    targetTopic,
    searchIntent,
    confidenceReason,
    plainLanguageSummary,
    suggestedAction: 'USE_EXISTING_PRIMARY'
  };
}

