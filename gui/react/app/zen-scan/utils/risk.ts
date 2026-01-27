// Zen Scan - Risk Score Utilities

import type { RiskLevel, MeditationConfig } from '../types';
import { 
  RISK_THRESHOLDS, 
  MEDITATION_THRESHOLD, 
  MEDITATION_CONFIGS,
  RISK_COLORS,
  RISK_BG_COLORS,
  RISK_BORDER_COLORS,
} from '../constants';

/**
 * Converts Trust Score to Risk Score.
 * Trust Score: 100 = safest, 0 = riskiest
 * Risk Score: 0 = safest, 100 = riskiest
 */
export function trustScoreToRiskScore(trustScore: number): number {
  return 100 - trustScore;
}

/**
 * Converts Risk Score to Trust Score.
 * Risk Score: 0 = safest, 100 = riskiest
 * Trust Score: 100 = safest, 0 = riskiest
 */
export function riskScoreToTrustScore(riskScore: number): number {
  return 100 - riskScore;
}

/**
 * Converts a risk score (0-100) to a risk level.
 * Uses internal risk score (higher = riskier).
 */
export function getRiskLevel(riskScore: number): RiskLevel {
  if (riskScore <= RISK_THRESHOLDS.SAFE_MAX) return 'safe';
  if (riskScore <= RISK_THRESHOLDS.LOW_MAX) return 'low';
  if (riskScore <= RISK_THRESHOLDS.MEDIUM_MAX) return 'medium';
  if (riskScore <= RISK_THRESHOLDS.HIGH_MAX) return 'high';
  return 'critical';
}

/**
 * Gets the meditation configuration based on risk score.
 * Returns null if no meditation is required (risk score <= 40).
 */
export function getMeditationConfig(riskScore: number): MeditationConfig | null {
  if (riskScore <= MEDITATION_THRESHOLD) {
    return null; // No meditation required
  }
  
  if (riskScore <= RISK_THRESHOLDS.MEDIUM_MAX) {
    return MEDITATION_CONFIGS.medium;
  }
  
  if (riskScore <= RISK_THRESHOLDS.HIGH_MAX) {
    return MEDITATION_CONFIGS.high;
  }
  
  return MEDITATION_CONFIGS.critical;
}

/**
 * Checks if meditation is required based on risk score.
 */
export function requiresMeditation(riskScore: number): boolean {
  return riskScore > MEDITATION_THRESHOLD;
}

/**
 * Gets the color for a risk level.
 */
export function getRiskColor(level: RiskLevel): string {
  return RISK_COLORS[level];
}

/**
 * Gets the background color class for a risk level.
 */
export function getRiskBgColor(level: RiskLevel): string {
  return RISK_BG_COLORS[level];
}

/**
 * Gets the border color class for a risk level.
 */
export function getRiskBorderColor(level: RiskLevel): string {
  return RISK_BORDER_COLORS[level];
}

/**
 * Gets a human-readable label for a risk level.
 */
export function getRiskLabel(level: RiskLevel): string {
  const labels: Record<RiskLevel, string> = {
    safe: 'Safe',
    low: 'Low Risk',
    medium: 'Medium Risk',
    high: 'High Risk',
    critical: 'Critical Risk',
  };
  return labels[level];
}

/**
 * Gets the emoji indicator for a risk level.
 */
export function getRiskEmoji(level: RiskLevel): string {
  const emojis: Record<RiskLevel, string> = {
    safe: '✅',
    low: '🟢',
    medium: '🟡',
    high: '🟠',
    critical: '🔴',
  };
  return emojis[level];
}

/**
 * Clamps a risk score to valid range [0, 100].
 */
export function clampRiskScore(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)));
}
