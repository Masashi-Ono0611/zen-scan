// Zen Scan - Risk Assessment Validation Utilities

import type { RiskAssessment, RiskLevel } from '../types';
import { clampRiskScore, getRiskLevel } from './risk';

const VALID_RISK_LEVELS: RiskLevel[] = ['safe', 'low', 'medium', 'high', 'critical'];

/**
 * Returns a level-appropriate zen warning with Japanese and English text.
 * Used as fallback when AI doesn't return proper format.
 */
function getZenWarningByLevel(level: RiskLevel): { jp: string; en: string } {
  const warnings = {
    safe: [
      { jp: '清流', en: 'Waters run clear and true' },
      { jp: '静寂', en: 'Stillness reveals no shadows' },
      { jp: '明鏡', en: 'The mirror reflects without distortion' },
    ],
    low: [
      { jp: '微風', en: 'A gentle breeze stirs the surface' },
      { jp: '薄霧', en: 'Thin mist obscures the distant path' },
      { jp: '観察', en: 'Watch the ripples before stepping' },
    ],
    medium: [
      { jp: '警戒', en: 'The path narrows, walk mindfully' },
      { jp: '濁流', en: 'Currents swirl beneath calm waters' },
      { jp: '岐路', en: 'Many paths diverge in shadow' },
    ],
    high: [
      { jp: '危険', en: 'Storm clouds gather on the horizon' },
      { jp: '深淵', en: 'The abyss gazes back' },
      { jp: '迷霧', en: 'Dense fog conceals the way forward' },
    ],
    critical: [
      { jp: '断崖', en: 'The cliff edge crumbles beneath' },
      { jp: '暗闇', en: 'Darkness swallows the path ahead' },
      { jp: '虚無', en: 'The void beckons, turn back' },
    ],
  };

  const options = warnings[level];
  return options[Math.floor(Math.random() * options.length)];
}

/**
 * Validates and normalizes a risk assessment response from the AI.
 * Ensures all required fields are present and valid.
 * Returns a valid RiskAssessment or throws an error.
 * 
 * Note: AI returns Risk Score (0-100, higher = riskier).
 * We convert it to Trust Score (100 - riskScore) for display.
 */
export function validateRiskAssessment(response: unknown): RiskAssessment {
  if (!response || typeof response !== 'object') {
    throw new Error('Invalid response: expected an object');
  }

  const data = response as Record<string, unknown>;

  // Validate and normalize risk score from AI
  let riskScore: number;
  if (typeof data.score === 'number') {
    riskScore = clampRiskScore(data.score);
  } else if (typeof data.score === 'string') {
    riskScore = clampRiskScore(parseInt(data.score, 10));
  } else {
    // Default to maximum risk if score is missing
    riskScore = 100;
  }

  // Convert to Trust Score for display
  const trustScore = 100 - riskScore;

  // Validate and normalize level (based on risk score)
  let level: RiskLevel;
  if (typeof data.level === 'string' && VALID_RISK_LEVELS.includes(data.level as RiskLevel)) {
    level = data.level as RiskLevel;
  } else {
    // Derive level from risk score if invalid
    level = getRiskLevel(riskScore);
  }

  // Validate zenWarning (new format: { jp: string, en: string })
  let zenWarning: { jp: string; en: string };
  if (
    typeof data.zenWarning === 'object' &&
    data.zenWarning !== null &&
    typeof (data.zenWarning as Record<string, unknown>).jp === 'string' &&
    typeof (data.zenWarning as Record<string, unknown>).en === 'string'
  ) {
    zenWarning = {
      jp: ((data.zenWarning as Record<string, unknown>).jp as string).trim().slice(0, 10),
      en: ((data.zenWarning as Record<string, unknown>).en as string).trim().slice(0, 100),
    };
    console.log('✓ Valid zenWarning:', zenWarning);
  } else if (typeof data.zenWarning === 'string' && data.zenWarning.trim()) {
    // AI returned a string - use it as English, generate random Japanese from level
    const enMessage = data.zenWarning.trim().slice(0, 50);
    const jpByLevel: Record<RiskLevel, string[]> = {
      safe: ['清流', '静寂', '明鏡'],
      low: ['微風', '薄霧', '観察'],
      medium: ['注意', '濁流', '岐路'],
      high: ['危険', '深淵', '迷霧'],
      critical: ['断崖', '暗闘', '虚無'],
    };
    const options = jpByLevel[level];
    zenWarning = {
      jp: options[Math.floor(Math.random() * options.length)],
      en: enMessage,
    };
    console.log('⚠ Converted string zenWarning to object:', zenWarning);
  } else {
    // Fallback: use level-appropriate zen warning
    console.warn('⚠ Invalid zenWarning format, using level-based fallback. Received:', data.zenWarning, 'Level:', level);
    zenWarning = getZenWarningByLevel(level);
  }

  // Validate technicalExplanation
  const technicalExplanation = typeof data.technicalExplanation === 'string' && data.technicalExplanation.trim()
    ? data.technicalExplanation.trim()
    : 'Unable to provide detailed analysis.';

  // Validate redFlags
  let redFlags: string[];
  if (Array.isArray(data.redFlags)) {
    redFlags = data.redFlags
      .filter((flag): flag is string => typeof flag === 'string' && flag.trim().length > 0)
      .map(flag => flag.trim());
  } else {
    redFlags = [];
  }

  // Validate recommendation
  const recommendation = typeof data.recommendation === 'string' && data.recommendation.trim()
    ? data.recommendation.trim()
    : 'Exercise caution before proceeding.';

  return {
    score: trustScore,        // Display as Trust Score
    riskScore,                // Keep internal Risk Score
    level,
    zenWarning,
    technicalExplanation,
    redFlags,
    recommendation,
  };
}

/**
 * Parses a JSON string response from the AI.
 * Handles common issues like markdown code blocks.
 */
export function parseAIResponse(responseText: string): unknown {
  // Remove markdown code blocks if present
  let cleaned = responseText.trim();
  
  // Remove ```json ... ``` wrapper
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  
  cleaned = cleaned.trim();

  try {
    return JSON.parse(cleaned);
  } catch (error) {
    throw new Error(`Failed to parse AI response as JSON: ${error}`);
  }
}

/**
 * Creates a default high-risk assessment for error cases.
 */
export function createDefaultRiskAssessment(): RiskAssessment {
  return {
    score: 0,              // Trust Score: 0 (lowest trust)
    riskScore: 100,        // Risk Score: 100 (highest risk)
    level: 'critical',
    zenWarning: { jp: '不明', en: 'The path is unclear. Proceed with extreme caution.' },
    technicalExplanation: 'Unable to complete analysis. Defaulting to maximum risk level for safety.',
    redFlags: ['Analysis failed - treating as high risk'],
    recommendation: 'Wait and try again, or avoid this contract entirely.',
  };
}
