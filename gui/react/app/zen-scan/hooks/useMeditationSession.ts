// Zen Scan - Meditation Session Hook

import { useState, useEffect, useCallback, useRef } from 'react';
import type { MeditationConfig, MeditationState } from '../types';
import { 
  onStabilityAchieved, 
  onStabilityLost, 
  onSessionComplete, 
  onWarningPulse,
  onTimerTickStable,
} from '../utils/haptics';

interface UseMeditationSessionProps {
  config: MeditationConfig;
  isDeviceStable: boolean;
  onComplete?: () => void;
}

interface UseMeditationSessionReturn {
  state: MeditationState;
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
}

const TICK_INTERVAL = 100; // ms - update every 100ms for smooth UI
const WARNING_INTERVAL = 3000; // ms - haptic warning every 3 seconds when unstable

/**
 * Hook for managing meditation session state and logic.
 */
export function useMeditationSession({
  config,
  isDeviceStable,
  onComplete,
}: UseMeditationSessionProps): UseMeditationSessionReturn {
  const [state, setState] = useState<MeditationState>({
    isActive: false,
    remainingTime: config.duration,
    elapsedTime: 0,
    stableTime: 0,
    stabilityPercentage: 0, // Kept for backward compatibility but not used
    isDeviceStable: false,
    isComplete: false,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastWarningRef = useRef<number>(0);
  const lastDisplayedSecondRef = useRef<number>(config.duration);
  const wasStableRef = useRef<boolean>(false);

  // Handle stability change haptics
  useEffect(() => {
    if (!state.isActive) return;

    if (isDeviceStable && !wasStableRef.current) {
      // Became stable
      onStabilityAchieved();
    } else if (!isDeviceStable && wasStableRef.current) {
      // Became unstable
      onStabilityLost();
    }

    wasStableRef.current = isDeviceStable;
  }, [isDeviceStable, state.isActive]);

  // Main timer tick
  useEffect(() => {
    if (!state.isActive || state.isComplete) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setState(prev => {
        const tickSeconds = TICK_INTERVAL / 1000;
        const newElapsedTime = prev.elapsedTime + tickSeconds;
        
        // Only count stable time and decrement remaining time when device is stable
        const newStableTime = isDeviceStable 
          ? prev.stableTime + tickSeconds 
          : prev.stableTime;
        
        const newRemainingTime = isDeviceStable
          ? Math.max(0, prev.remainingTime - tickSeconds)
          : prev.remainingTime;

        // Simple completion condition: countdown reaches 0
        const isComplete = newRemainingTime <= 0;

        // Trigger warning haptic if unstable for too long
        if (!isDeviceStable && !isComplete) {
          const now = Date.now();
          if (now - lastWarningRef.current > WARNING_INTERVAL) {
            onWarningPulse();
            lastWarningRef.current = now;
          }
        }

        // Trigger haptic when countdown second changes (only when stable/timer running)
        if (isDeviceStable && !isComplete) {
          const currentDisplayedSecond = Math.ceil(newRemainingTime);
          if (currentDisplayedSecond < lastDisplayedSecondRef.current && currentDisplayedSecond >= 0) {
            onTimerTickStable();
            lastDisplayedSecondRef.current = currentDisplayedSecond;
          }
        }

        return {
          ...prev,
          elapsedTime: newElapsedTime,
          stableTime: newStableTime,
          remainingTime: newRemainingTime,
          stabilityPercentage: 0, // Not used anymore
          isDeviceStable,
          isComplete,
        };
      });
    }, TICK_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [state.isActive, state.isComplete, isDeviceStable]);

  // Handle completion
  useEffect(() => {
    if (state.isComplete) {
      onSessionComplete();
      onComplete?.();
    }
  }, [state.isComplete, onComplete]);

  const start = useCallback(() => {
    setState({
      isActive: true,
      remainingTime: config.duration,
      elapsedTime: 0,
      stableTime: 0,
      stabilityPercentage: 0, // Not used
      isDeviceStable: false,
      isComplete: false,
    });
    wasStableRef.current = false;
    lastWarningRef.current = 0;
    lastDisplayedSecondRef.current = config.duration;
  }, [config.duration]);

  const pause = useCallback(() => {
    setState(prev => ({ ...prev, isActive: false }));
  }, []);

  const resume = useCallback(() => {
    setState(prev => ({ ...prev, isActive: true }));
  }, []);

  const reset = useCallback(() => {
    setState({
      isActive: false,
      remainingTime: config.duration,
      elapsedTime: 0,
      stableTime: 0,
      stabilityPercentage: 0, // Not used
      isDeviceStable: false,
      isComplete: false,
    });
    wasStableRef.current = false;
    lastWarningRef.current = 0;
    lastDisplayedSecondRef.current = config.duration;
  }, [config.duration]);

  return {
    state,
    start,
    pause,
    resume,
    reset,
  };
}
