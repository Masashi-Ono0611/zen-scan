// Zen Scan - Enso Circle Component

import { useMemo } from 'react';
import type { RiskLevel } from '../types';
import { getRiskColor } from '../utils/risk';
import { UI } from '../constants';

interface EnsoCircleProps {
  score?: number;
  level?: RiskLevel;
  size?: number;
  animated?: boolean;
  showScore?: boolean;
  className?: string;
}

/**
 * SVG-based Enso (Zen circle) component with progress ring.
 * Displays risk score with color coding and progress visualization.
 */
export function EnsoCircle({
  score,
  level,
  size = UI.ensoSize,
  animated = true,
  showScore = true,
  className = '',
}: EnsoCircleProps) {
  const color = level ? getRiskColor(level) : '#6b7280';
  
  const { circumference, strokeDashoffset, radius } = useMemo(() => {
    const r = (size / 2) - UI.ensoStrokeWidth * 2;
    const circ = 2 * Math.PI * r;
    const progress = score !== undefined ? score / 100 : 0;
    const offset = circ * (1 - progress);
    return { circumference: circ, strokeDashoffset: offset, radius: r };
  }, [size, score]);

  const hasScore = score !== undefined && showScore;

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className={animated && !hasScore ? 'animate-glow-pulse' : ''}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={UI.ensoStrokeWidth}
          className="text-gray-700/30"
        />
        
        {hasScore ? (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={UI.ensoStrokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
            style={{
              filter: `drop-shadow(0 0 8px ${color}40)`,
              transform: 'rotate(-90deg)',
              transformOrigin: 'center',
            }}
          />
        ) : (
          <EnsoPath size={size} radius={radius} color={color} animated={animated} />
        )}
      </svg>
      
      {hasScore && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs text-gray-400 mb-1">Trust</span>
          <span 
            className="text-4xl font-bold transition-colors duration-500"
            style={{ color }}
          >
            {score}
          </span>
          <span className="text-sm text-gray-400 mt-1">/ 100</span>
        </div>
      )}
    </div>
  );
}

/**
 * Animated Enso path - brush stroke style
 */
function EnsoPath({ 
  size, 
  radius, 
  color, 
  animated 
}: { 
  size: number; 
  radius: number; 
  color: string; 
  animated: boolean;
}) {
  const circumference = 2 * Math.PI * radius;
  
  return (
    <circle
      cx={size / 2}
      cy={size / 2}
      r={radius}
      fill="none"
      stroke={color}
      strokeWidth={3}
      strokeLinecap="round"
      strokeDasharray={circumference}
      strokeDashoffset={animated ? 30 : circumference * 0.1}
      className={animated ? 'animate-enso-draw' : ''}
      style={{
        filter: `drop-shadow(0 0 6px ${color}30)`,
        transform: 'rotate(-90deg)',
        transformOrigin: 'center',
      }}
    />
  );
}

/**
 * Zen Logo - Enso with inner elements for branding
 */
export function ZenLogo({ size = 120 }: { size?: number }) {
  const innerSize = size * 0.4;
  
  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Outer Enso */}
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="animate-glow-pulse"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={(size / 2) - 4}
          fill="none"
          stroke="#4b5563"
          strokeWidth={2}
          strokeLinecap="round"
          strokeDasharray={`${(size - 8) * Math.PI * 0.88} ${(size - 8) * Math.PI * 0.12}`}
          style={{
            transform: 'rotate(-90deg)',
            transformOrigin: 'center',
          }}
        />
      </svg>
      
      {/* Inner symbol - stylized eye/scan */}
      <div 
        className="absolute inset-0 flex items-center justify-center"
        style={{ opacity: 0.7 }}
      >
        <svg
          width={innerSize}
          height={innerSize}
          viewBox="0 0 24 24"
          fill="none"
          stroke="#6b7280"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Simplified eye/scan icon */}
          <circle cx="12" cy="12" r="3" />
          <path d="M12 5C7 5 3 9 3 12s4 7 9 7 9-4 9-7-4-7-9-7z" />
        </svg>
      </div>
    </div>
  );
}

/**
 * Ink drop loading animation with vibration effect
 */
export function InkDropLoader({ size = 100 }: { size?: number }) {
  const dropSize = size * 0.3;
  const dotSize = size * 0.08;
  
  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Multiple ink drops with staggered animation and vibration */}
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="absolute rounded-full animate-ripple-vibrate"
          style={{
            width: dropSize,
            height: dropSize,
            left: (size - dropSize) / 2,
            top: (size - dropSize) / 2,
            animationDelay: `${i * 0.75}s`,
            transformOrigin: 'center center',
            background: `radial-gradient(circle, rgba(107, 114, 128, ${0.4 - i * 0.08}) 0%, rgba(107, 114, 128, ${0.2 - i * 0.04}) 50%, transparent 100%)`,
            border: `1px solid rgba(107, 114, 128, ${0.3 - i * 0.05})`,
          }}
        />
      ))}
      
      {/* Center dot with pulse */}
      <div 
        className="absolute rounded-full bg-gray-400 animate-pulse-slow"
        style={{ 
          width: dotSize, 
          height: dotSize,
          left: (size - dotSize) / 2,
          top: (size - dotSize) / 2,
          boxShadow: '0 0 12px rgba(107, 114, 128, 0.6)',
        }}
      />
    </div>
  );
}

/**
 * Simple loading Enso animation.
 */
export function EnsoLoading({ size = 80 }: { size?: number }) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="animate-spin-slow"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={(size / 2) - 4}
          fill="none"
          stroke="url(#enso-gradient)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeDasharray={`${(size - 8) * Math.PI * 0.75} ${(size - 8) * Math.PI * 0.25}`}
        />
        <defs>
          <linearGradient id="enso-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6b7280" />
            <stop offset="100%" stopColor="#374151" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
