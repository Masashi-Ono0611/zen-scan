// Zen Scan - Constants and Configuration

import type { MeditationConfig, RiskLevel } from './types';

// ============================================
// TonAPI Configuration
// ============================================

export const TONAPI_BASE_URL = 'https://tonapi.io/v2';
export const TONAPI_TRANSACTIONS_LIMIT = 30;

// ============================================
// Risk Level Thresholds (based on Risk Score, not Trust Score)
// ============================================

export const RISK_THRESHOLDS = {
  SAFE_MAX: 20,      // Risk 0-20 = Trust 80-100 = Safe
  LOW_MAX: 40,       // Risk 21-40 = Trust 60-79 = Low Risk
  MEDIUM_MAX: 60,    // Risk 41-60 = Trust 40-59 = Medium Risk
  HIGH_MAX: 80,      // Risk 61-80 = Trust 20-39 = High Risk
  // 81-100 is critical // Risk 81-100 = Trust 0-19 = Critical
} as const;

export const MEDITATION_THRESHOLD = 40; // Risk score above this requires meditation (Trust < 60)

// ============================================
// Meditation Configuration by Risk Level
// ============================================

export const MEDITATION_CONFIGS: Record<string, MeditationConfig> = {
  // Risk 0-40: No meditation required
  none: { duration: 0, tiltTolerance: 0 },
  
  // Risk 41-60: Light meditation
  medium: { duration: 15, tiltTolerance: 15 },
  
  // Risk 61-80: Moderate meditation
  high: { duration: 30, tiltTolerance: 10 },
  
  // Risk 81-100: Strict meditation
  critical: { duration: 60, tiltTolerance: 5 },
};

// ============================================
// Risk Level Colors
// ============================================

export const RISK_COLORS: Record<RiskLevel, string> = {
  safe: '#22c55e',      // green-500
  low: '#84cc16',       // lime-500
  medium: '#f97316',    // orange-500
  high: '#ef4444',      // red-500
  critical: '#dc2626',  // red-600
};

export const RISK_BG_COLORS: Record<RiskLevel, string> = {
  safe: 'bg-green-500/20',
  low: 'bg-lime-500/20',
  medium: 'bg-orange-500/20',
  high: 'bg-red-500/20',
  critical: 'bg-red-600/30',
};

export const RISK_BORDER_COLORS: Record<RiskLevel, string> = {
  safe: 'border-green-500',
  low: 'border-lime-500',
  medium: 'border-orange-500',
  high: 'border-red-500',
  critical: 'border-red-600',
};

// ============================================
// Zen Messages
// ============================================

export const ZEN_MESSAGES = {
  loading: 'The river of data flows...',
  analyzing: 'Seeking wisdom in the patterns...',
  error: 'The path is unclear. Try again.',
  addressInvalid: 'This address does not follow the path.',
  networkError: 'The river flows slowly today.',
  notFound: 'This address has not yet begun its journey.',
  meditationStart: 'Find your center. Hold steady.',
  meditationComplete: 'Your mind is clear.',
  stable: 'Balance achieved.',
  unstable: 'Return to stillness.',
} as const;

// ============================================
// Bedrock AI Prompt Template
// ============================================

export const RISK_ANALYSIS_PROMPT = `
You are a blockchain security expert with a Zen philosophy approach.
Analyze this TON contract/address for security risks based on its transaction history.

Contract Address: {address}
Account Status: {status}
Balance: {balance} TON
Contract Type: {interfaces}

Recent Transactions (last 30):
{transactions}

Analyze for:
- Suspicious transaction patterns (draining, honeypot, rug pull indicators)
- Contract age and activity patterns
- Interaction with known scam addresses
- Unusual fee patterns
- Red flags in transaction flow

Respond ONLY with valid JSON (no markdown, no code blocks):
{
  "score": <0-100 integer>,
  "level": "<safe|low|medium|high|critical>",
  "zenWarning": "<calming but clear warning in Zen style, max 50 chars>",
  "technicalExplanation": "<technical analysis of risks found>",
  "redFlags": ["<flag1>", "<flag2>"],
  "recommendation": "<what user should do>"
}
`;

// ============================================
// Gyroscope Configuration
// ============================================

export const GYROSCOPE_REFRESH_RATE = 60; // Hz

// ============================================
// Haptic Patterns
// ============================================

export const HAPTIC_PATTERNS = {
  stabilityAchieved: 'soft' as const,
  stabilityLost: 'medium' as const,
  sessionComplete: 'success' as const,
  warning: 'warning' as const,
};

// ============================================
// Animation Durations
// ============================================

export const ANIMATION_DURATIONS = {
  rippleTransition: 300, // ms
  screenTransition: 200, // ms
  timerUpdate: 1000, // ms
};

// ============================================
// UI Constants
// ============================================

export const UI = {
  maxAddressLength: 48,
  ensoStrokeWidth: 3,
  ensoSize: 200,
};
