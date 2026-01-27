// Zen Scan - Stability Detector Hook

import { useState, useEffect, useCallback, useRef } from 'react';
import { postEvent } from '@tma.js/sdk-react';
import type { DeviceOrientation } from '../types';
import { GYROSCOPE_REFRESH_RATE } from '../constants';

interface UseStabilityDetectorReturn {
  // State
  isSupported: boolean;
  hasPermission: boolean;
  orientation: DeviceOrientation;
  isTracking: boolean;
  
  // Methods
  requestPermission: () => Promise<boolean>;
  startTracking: () => void;
  stopTracking: () => void;
  isStable: (tolerance: number) => boolean;
  
  // Computed values
  currentTilt: number; // Combined tilt angle
}

/**
 * Hook for detecting device stability using gyroscope sensors.
 * Reuses patterns from existing DeviceSensors.tsx.
 */
export function useStabilityDetector(): UseStabilityDetectorReturn {
  const [isSupported, setIsSupported] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [orientation, setOrientation] = useState<DeviceOrientation>({
    alpha: null,
    beta: null,
    gamma: null,
  });

  const handleOrientationRef = useRef<((event: DeviceOrientationEvent) => void) | null>(null);

  // Check if device orientation is supported
  useEffect(() => {
    setIsSupported('DeviceOrientationEvent' in window);
  }, []);

  // Handle orientation change
  const handleOrientation = useCallback((event: DeviceOrientationEvent) => {
    setIsSupported(true);
    setOrientation({
      alpha: event.alpha,
      beta: event.beta,
      gamma: event.gamma,
    });
  }, []);

  // Store the handler ref for cleanup
  useEffect(() => {
    handleOrientationRef.current = handleOrientation;
  }, [handleOrientation]);

  // Request permission for device orientation (required on iOS)
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        const granted = permission === 'granted';
        setHasPermission(granted);
        return granted;
      } catch (error) {
        console.error('Permission denied:', error);
        setHasPermission(false);
        return false;
      }
    } else {
      // Permission not required (Android, desktop)
      setHasPermission(true);
      return true;
    }
  }, []);

  // Start tracking device orientation
  const startTracking = useCallback(() => {
    if (!handleOrientationRef.current) return;

    // Start Telegram gyroscope if available
    try {
      postEvent('web_app_start_gyroscope', {
        refresh_rate: GYROSCOPE_REFRESH_RATE,
      });
    } catch (e) {
      // Ignore if not in Telegram context
    }

    window.addEventListener('deviceorientation', handleOrientationRef.current);
    setIsTracking(true);
  }, []);

  // Stop tracking device orientation
  const stopTracking = useCallback(() => {
    if (handleOrientationRef.current) {
      window.removeEventListener('deviceorientation', handleOrientationRef.current);
    }

    // Stop Telegram gyroscope if available
    try {
      postEvent('web_app_stop_gyroscope');
    } catch (e) {
      // Ignore if not in Telegram context
    }

    setIsTracking(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (handleOrientationRef.current) {
        window.removeEventListener('deviceorientation', handleOrientationRef.current);
      }
      try {
        postEvent('web_app_stop_gyroscope');
      } catch (e) {
        // Ignore
      }
    };
  }, []);

  // Check if device is stable within tolerance
  // Uses the shared utility function for consistency
  const isStable = useCallback((tolerance: number): boolean => {
    const { beta, gamma } = orientation;
    
    if (beta === null || gamma === null) {
      return false; // No data available
    }

    // Use shared calculation function - SINGLE SOURCE OF TRUTH
    const tiltAngle = Math.sqrt(beta * beta + gamma * gamma);
    return tiltAngle <= tolerance;
  }, [orientation]);

  // Calculate combined tilt angle using the same formula
  const currentTilt = (() => {
    const { beta, gamma } = orientation;
    if (beta === null || gamma === null) return 0;
    // Use shared calculation function - SINGLE SOURCE OF TRUTH
    return Math.sqrt(beta * beta + gamma * gamma);
  })();

  return {
    isSupported,
    hasPermission,
    orientation,
    isTracking,
    requestPermission,
    startTracking,
    stopTracking,
    isStable,
    currentTilt,
  };
}
