// Zen Scan - Stability Calculation Utilities

/**
 * Calculates the combined tilt angle from beta and gamma.
 * Returns the magnitude of the tilt vector.
 * This is the SINGLE SOURCE OF TRUTH for tilt calculation.
 */
export function calculateTiltAngle(beta: number | null, gamma: number | null): number {
  if (beta === null || gamma === null) {
    return 0;
  }
  return Math.sqrt(beta * beta + gamma * gamma);
}

/**
 * Checks if device is stable within the given tolerance.
 * Uses the same calculation as calculateTiltAngle for consistency.
 */
export function isDeviceStable(
  beta: number | null, 
  gamma: number | null, 
  tolerance: number
): boolean {
  const tiltAngle = calculateTiltAngle(beta, gamma);
  return tiltAngle <= tolerance;
}

/**
 * Normalizes a tilt value to a 0-1 range for visualization.
 * maxTilt is the angle at which the value reaches 1.
 */
export function normalizeTilt(tilt: number, maxTilt: number = 45): number {
  return Math.min(1, Math.max(0, tilt / maxTilt));
}

/**
 * Clamps a value between min and max.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Formats time in seconds to MM:SS display format.
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
