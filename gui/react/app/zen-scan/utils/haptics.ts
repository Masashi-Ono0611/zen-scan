// Zen Scan - Haptic Feedback Utilities

import { hapticFeedback } from '@tma.js/sdk-react';

/**
 * Triggers haptic feedback when device becomes stable.
 */
export function onStabilityAchieved(): void {
  try {
    hapticFeedback.impactOccurred('soft');
  } catch (e) {
    // Ignore if haptic feedback is not available
  }
}

/**
 * Triggers haptic feedback when device becomes unstable.
 */
export function onStabilityLost(): void {
  try {
    hapticFeedback.impactOccurred('medium');
  } catch (e) {
    // Ignore if haptic feedback is not available
  }
}

/**
 * Triggers haptic feedback when meditation session completes successfully.
 */
export function onSessionComplete(): void {
  try {
    hapticFeedback.notificationOccurred('success');
  } catch (e) {
    // Ignore if haptic feedback is not available
  }
}

/**
 * Triggers periodic warning haptic when stability is low.
 */
export function onWarningPulse(): void {
  try {
    hapticFeedback.notificationOccurred('warning');
  } catch (e) {
    // Ignore if haptic feedback is not available
  }
}

/**
 * Triggers haptic feedback for button press.
 */
export function onButtonPress(): void {
  try {
    hapticFeedback.impactOccurred('light');
  } catch (e) {
    // Ignore if haptic feedback is not available
  }
}

/**
 * Triggers haptic feedback for error.
 */
export function onError(): void {
  try {
    hapticFeedback.notificationOccurred('error');
  } catch (e) {
    // Ignore if haptic feedback is not available
  }
}

/**
 * Triggers light haptic feedback for timer countdown tick.
 */
export function onTimerTickStable(): void {
  try {
    hapticFeedback.impactOccurred('light');
  } catch (e) {
    // Ignore if haptic feedback is not available
  }
}

/**
 * Triggers haptic feedback when screen loads/appears.
 */
export function onScreenAppear(): void {
  try {
    hapticFeedback.impactOccurred('light');
  } catch (e) {
    // Ignore if haptic feedback is not available
  }
}

/**
 * Triggers haptic feedback for navigation back.
 */
export function onNavigateBack(): void {
  try {
    hapticFeedback.impactOccurred('soft');
  } catch (e) {
    // Ignore if haptic feedback is not available
  }
}

/**
 * Triggers haptic feedback when analysis starts.
 */
export function onAnalysisStart(): void {
  try {
    hapticFeedback.impactOccurred('light');
  } catch (e) {
    // Ignore if haptic feedback is not available
  }
}

/**
 * Triggers haptic feedback when analysis completes.
 */
export function onAnalysisComplete(): void {
  try {
    hapticFeedback.notificationOccurred('success');
  } catch (e) {
    // Ignore if haptic feedback is not available
  }
}

/**
 * Triggers subtle haptic feedback during loading.
 */
export function onLoadingPulse(): void {
  try {
    hapticFeedback.impactOccurred('soft');
  } catch (e) {
    // Ignore if haptic feedback is not available
  }
}
