// Zen Scan - Tilt Indicator Component

import { useRef } from 'react';
import type { DeviceOrientation } from '../types';
import { WaterRipple } from './WaterRipple';
import { clamp } from '../utils/stability';

interface TiltIndicatorProps {
  orientation: DeviceOrientation;
  tolerance: number;
  isStable: boolean;
  rippleIntensity?: number;
  className?: string;
}

// Maximum tilt angle for effects (degrees)
const MAX_TILT_ANGLE = 30;

/**
 * Visual indicator showing current device stability.
 * Dot is fixed at center, color and effects change based on tilt.
 */
export function TiltIndicator({
  orientation,
  tolerance,
  isStable,
  rippleIntensity = 0,
  className = '',
}: TiltIndicatorProps) {
  const { beta, gamma } = orientation;
  
  // Clamp beta/gamma for calculations
  const tiltX = clamp(gamma ?? 0, -MAX_TILT_ANGLE, MAX_TILT_ANGLE);
  const tiltY = clamp(beta ?? 0, -MAX_TILT_ANGLE, MAX_TILT_ANGLE);
  
  // Calculate tilt angle from CLAMPED values
  const currentTilt = Math.sqrt(tiltX * tiltX + tiltY * tiltY);

  const rippleLevel = Math.max(0.05, rippleIntensity ?? 0);

  return (
    <div className={`flex flex-col items-center gap-8 ${className}`}>
      {/* Container for circle and ripple */}
      <div className="relative flex items-center justify-center" style={{ width: '192px', height: '192px' }}>
        {/* Water Ripple - background layer */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{ zIndex: 0 }}
        >
          <WaterRipple intensity={rippleLevel} bright />
        </div>
        
        {/* Center dot only */}
        <div
          className={`absolute w-3.5 h-3.5 rounded-full left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ${
            isStable ? 'bg-green-500' : 'bg-red-500'
          }`}
          style={{
            zIndex: 10,
            transition: 'background-color 0.2s ease',
            boxShadow: isStable
              ? '0 0 12px rgba(34,197,94,0.35), 0 0 22px rgba(34,197,94,0.18)'
              : '0 0 12px rgba(239,68,68,0.35), 0 0 22px rgba(239,68,68,0.18)',
            filter: 'blur(0.5px)',
            opacity: 0.8,
          }}
        />
      </div>

      {/* Tilt readout */}
      <div className="text-center">
        <div className={`text-lg font-mono ${isStable ? 'text-green-400' : 'text-red-400'}`}>
          {currentTilt.toFixed(1)}°
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Stay within ±{tolerance}°
        </div>
      </div>

      {/* Status message */}
      <div className={`text-sm font-medium ${isStable ? 'text-green-400' : 'text-orange-400'}`}>
        {isStable ? '✓ Stable' : '⚠ Hold phone flat'}
      </div>
    </div>
  );
}

/**
 * Simple horizontal tilt indicator bar.
 */
export function TiltBar({
  orientation,
  tolerance,
  isStable,
  className = '',
}: TiltIndicatorProps) {
  const { gamma } = orientation;
  const tilt = gamma !== null ? Math.max(-30, Math.min(30, gamma)) : 0;
  const position = 50 + (tilt / 30) * 45;

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <div className="relative w-full h-8 bg-gray-800 rounded-full overflow-hidden">
        {/* Tolerance zone */}
        <div 
          className="absolute top-0 bottom-0 bg-gray-700/50"
          style={{
            left: `${50 - (tolerance / 30) * 45}%`,
            right: `${50 - (tolerance / 30) * 45}%`,
          }}
        />
        
        {/* Center line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-600" />
        
        {/* Indicator */}
        <div
          className={`absolute top-1 bottom-1 w-4 rounded-full -translate-x-1/2 transition-all duration-100 ${
            isStable ? 'bg-green-500' : 'bg-red-500'
          }`}
          style={{ left: `${position}%` }}
        />
      </div>
      
      <div className="flex justify-between w-full text-xs text-gray-500">
        <span>← Left</span>
        <span className={isStable ? 'text-green-400' : 'text-red-400'}>
          {Math.abs(tilt).toFixed(1)}°
        </span>
        <span>Right →</span>
      </div>
    </div>
  );
}
