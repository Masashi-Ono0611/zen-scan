// Zen Scan - Water Ripple Animation Component

import { useEffect, useRef } from 'react';

interface WaterRippleProps {
  intensity: number; // 0 (calm) to 1 (rough)
  bright?: boolean; // Use brighter colors
  className?: string;
}

/**
 * Canvas-based water ripple animation.
 * Intensity controls how agitated the water appears.
 */
export function WaterRipple({ intensity, bright = false, className = '' }: WaterRippleProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const timeRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      // Reset any previous scaling to avoid accumulation on multiple resizes
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    // Color settings based on bright mode
    const bgColor = bright ? 'transparent' : '#1a1a1a';
    const rippleColor = bright ? '180, 190, 200' : '107, 114, 128'; // brighter gray for bright mode
    const smallRippleColor = bright ? '200, 210, 220' : '156, 163, 175';
    const alphaMultiplier = bright ? 1.6 : 1; // Slightly brighter for visibility

    // Animation loop
    const animate = () => {
      timeRef.current += 0.015; // Much slower animation (was 0.02)
      const t = timeRef.current;
      
      const width = canvas.width / window.devicePixelRatio;
      const height = canvas.height / window.devicePixelRatio;

      // Clear canvas
      if (bright) {
        ctx.clearRect(0, 0, width, height);
      } else {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, width, height);
      }

      // Draw ripples
      // Snap center to half-pixel to align with CSS strokes and avoid perceived offset
      const centerX = Math.floor(width / 2) + 0.5;
      const centerY = Math.floor(height / 2) + 0.5;
      const maxRadius = Math.max(width, height) * 0.6;

      // Number of ripples based on intensity
      const rippleCount = 3 + Math.floor(intensity * 4);
      
      for (let i = 0; i < rippleCount; i++) {
        const phase = (t + i * 0.5) % 5;
        const radius = (phase / 3) * maxRadius;
        const alpha = Math.min(1, (1 - phase / 3) * (0.45 + intensity * 0.35) * alphaMultiplier);
        
        // Ripple distortion based on intensity
        const distortion = intensity * 10 * Math.sin(t * 3 + i);
        
        ctx.beginPath();
        ctx.strokeStyle = `rgba(${rippleColor}, ${alpha})`;
        ctx.lineWidth = bright ? 1.25 + intensity * 1.8 : 1 + intensity * 2; // Slightly thicker in bright mode
        
        // Draw slightly distorted circle
        for (let angle = 0; angle < Math.PI * 2; angle += 0.1) {
          const r = radius + distortion * Math.sin(angle * 3 + t);
          const x = centerX + r * Math.cos(angle);
          const y = centerY + r * Math.sin(angle);
          
          if (angle === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.closePath();
        ctx.stroke();
      }

      // Add some random small ripples when intensity is high
      if (intensity > 0.5) {
        const smallRipples = Math.floor((intensity - 0.5) * 10);
        for (let i = 0; i < smallRipples; i++) {
          const x = Math.random() * width;
          const y = Math.random() * height;
          const r = 5 + Math.random() * 15;
          const alpha = Math.min(1, (0.18 + Math.random() * 0.25) * alphaMultiplier);
          
          ctx.beginPath();
          ctx.strokeStyle = `rgba(${smallRippleColor}, ${alpha})`;
          ctx.lineWidth = bright ? 1.2 : 0.6;
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationRef.current);
    };
  }, [intensity, bright]);

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full ${className}`}
      style={{ display: 'block' }}
    />
  );
}

/**
 * Simple CSS-based ripple effect (fallback).
 */
export function WaterRippleCSS({ intensity, className = '' }: WaterRippleProps) {
  const rippleCount = 3 + Math.floor(intensity * 3);
  
  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      <div className="absolute inset-0 bg-[#1a1a1a]" />
      {Array.from({ length: rippleCount }).map((_, i) => (
        <div
          key={i}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-gray-600/30"
          style={{
            width: `${(i + 1) * 25}%`,
            height: `${(i + 1) * 25}%`,
            animation: `ripple ${2 + intensity}s ease-out infinite`,
            animationDelay: `${i * 0.5}s`,
            opacity: 0.3 + intensity * 0.3,
          }}
        />
      ))}
    </div>
  );
}
