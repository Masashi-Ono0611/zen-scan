// Zen Scan - Meditation Screen

import { useEffect, useRef, useState } from 'react';
import type { MeditationConfig } from '../types';
import { TiltIndicator } from '../components/TiltIndicator';
import { AddressDisplay } from '../components/AddressInput';
import { useStabilityDetector } from '../hooks/useStabilityDetector';
import { useMeditationSession } from '../hooks/useMeditationSession';
import { formatTime, normalizeTilt } from '../utils/stability';
import { onScreenAppear, onNavigateBack } from '../utils/haptics';
import { SingingBowlSound } from '../utils/sound';

interface MeditationScreenProps {
  config: MeditationConfig;
  address: string;
  onComplete: () => void;
  onCancel: () => void;
}

// Zen guidance messages
const ZEN_GUIDANCE = {
  stable: ['瞑想中', 'Meditating'],
  unstable: ['静心', 'Meditate and calm down'],
};

/**
 * Meditation session screen with gyroscope tracking.
 */
export function MeditationScreen({
  config,
  address,
  onComplete,
  onCancel,
}: MeditationScreenProps) {
  const [mode, setMode] = useState<'normal' | 'debug'>('normal');
  const [debugBeta, setDebugBeta] = useState(0);
  const [debugGamma, setDebugGamma] = useState(0);

  const stability = useStabilityDetector();

  const effectiveOrientation =
    mode === 'debug'
      ? { alpha: null, beta: debugBeta, gamma: debugGamma }
      : stability.orientation;

  const effectiveTilt = (() => {
    const { beta, gamma } = effectiveOrientation;
    if (beta === null || gamma === null) return 0;
    return Math.sqrt(beta * beta + gamma * gamma);
  })();

  const isStable = (() => {
    const { beta, gamma } = effectiveOrientation;
    if (beta === null || gamma === null) return false;
    const tiltAngle = Math.sqrt(beta * beta + gamma * gamma);
    return tiltAngle <= config.tiltTolerance;
  })();
  
  const session = useMeditationSession({
    config,
    isDeviceStable: isStable,
    onComplete,
  });

  const stopAmbientRef = useRef<(() => void) | undefined>(undefined);
  const stopSequenceRef = useRef<(() => void) | undefined>(undefined);
  const soundRef = useRef<SingingBowlSound | null>(null);

  useEffect(() => {
    // Create new sound instance for this component
    const sound = new SingingBowlSound();
    soundRef.current = sound;
    
    const init = async () => {
      onScreenAppear();
      if (mode === 'debug') {
        session.start();
      } else {
        const hasPermission = await stability.requestPermission();
        if (hasPermission) {
          stability.startTracking();
          session.start();
        }
      }

      // Delay sound start to allow screen transition to complete
      setTimeout(() => {
        if (soundRef.current) {
          stopAmbientRef.current = soundRef.current.playAmbientLoop(216, 0.12);
          stopSequenceRef.current = soundRef.current.playSequence(10, 0);
        }
      }, 800);
    };
    init();

    return () => {
      stability.stopTracking();
      
      if (stopAmbientRef.current) {
        stopAmbientRef.current();
        stopAmbientRef.current = undefined;
      }
      
      if (stopSequenceRef.current) {
        stopSequenceRef.current();
        stopSequenceRef.current = undefined;
      }
      
      if (soundRef.current) {
        soundRef.current.stop();
        soundRef.current = null;
      }
    };
  }, [mode]);

  useEffect(() => {
    if (mode === 'debug') {
      stability.stopTracking();
    }
  }, [mode, stability]);

  const rippleIntensity = isStable ? 0.1 : normalizeTilt(effectiveTilt, 30);
  const guidance = isStable ? ZEN_GUIDANCE.stable : ZEN_GUIDANCE.unstable;

  return (
    <div className="flex flex-col flex-1 h-full relative bg-[#0f1115]">

      {/* Content - Scrollable */}
      <div className="relative z-10 flex flex-col flex-1 h-full overflow-y-auto px-6 py-4 pb-8">
        <div className="w-full max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between pt-16 mb-3">
            <button 
              onClick={() => {
                onNavigateBack();
                onCancel();
              }}
              className="text-gray-400 hover:text-white transition-colors text-sm"
            >
              ← Back
            </button>
            <AddressDisplay address={address} />
          </div>

          {/* Zen Scan */}
          <div className="text-center mb-4">
            <p className="text-3xl text-white font-light tracking-widest mb-2 drop-shadow-lg" style={{ fontFamily: "'Noto Serif JP', 'Hiragino Mincho ProN', 'Yu Mincho', serif" }}>
              {guidance[0]}
            </p>
            <p className="text-gray-200 text-sm italic drop-shadow">
              {guidance[1]}
            </p>
          </div>

          {/* Timer Display */}
          <div className="text-center mb-4">
            <div className={`text-6xl font-light tracking-wider transition-colors duration-500 ${
              isStable ? 'text-green-400' : 'text-gray-600'
            }`}>
              {formatTime(session.state.remainingTime)}
            </div>
          </div>

          {/* Tilt Indicator with Water Ripple */}
          <div className="flex items-center justify-center py-4 mb-6">
            <TiltIndicator
              orientation={effectiveOrientation}
              tolerance={config.tiltTolerance}
              isStable={isStable}
              rippleIntensity={rippleIntensity}
            />
          </div>
          
          {mode === 'debug' && (
            <div className="mt-2 mb-6 px-4 pb-4">
              <div className="p-4 rounded-lg border border-[#1f2430] bg-[#151821]">
                <div className="text-xs text-gray-500 mb-3">Debug: simulate device tilt (degrees)</div>

                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                    <span>beta (front/back)</span>
                    <span className="font-mono">{debugBeta.toFixed(1)}°</span>
                  </div>
                  <input
                    type="range"
                    min={-30}
                    max={30}
                    step={0.1}
                    value={debugBeta}
                    onChange={(e) => setDebugBeta(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                    <span>gamma (left/right)</span>
                    <span className="font-mono">{debugGamma.toFixed(1)}°</span>
                  </div>
                  <input
                    type="range"
                    min={-30}
                    max={30}
                    step={0.1}
                    value={debugGamma}
                    onChange={(e) => setDebugGamma(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mode Toggle - subtle bottom-right control */}
      <div className="fixed bottom-4 right-4 z-20 opacity-70 hover:opacity-100 transition-opacity">
        <div className="inline-flex rounded-full border border-gray-800/40 bg-gray-900/40 backdrop-blur-sm overflow-hidden">
          <button
            onClick={() => setMode('normal')}
            className={`px-2.5 py-1 text-[10px] tracking-wide transition-colors ${
              mode === 'normal' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'
            }`}
            aria-label="Normal mode"
          >
            Normal
          </button>
          <button
            onClick={() => setMode('debug')}
            className={`px-2.5 py-1 text-[10px] tracking-wide transition-colors ${
              mode === 'debug' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'
            }`}
            aria-label="Debug mode"
          >
            Debug
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Permission request screen.
 */
export function PermissionScreen({
  onRequestPermission,
  onSkip,
}: {
  onRequestPermission: () => void;
  onSkip: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 h-full px-6 py-4 bg-[#0f1115]">
      <div className="w-full max-w-3xl mx-auto flex flex-col items-center">
        <div className="text-center mb-8">
          <p className="text-2xl text-gray-400 font-light tracking-widest mb-2">
            許可
          </p>
          <h2 className="text-xl text-white font-light mb-3">
            Sensor Access Required
          </h2>
          <p className="text-gray-500 text-sm max-w-xs">
            Zen Scan needs access to your device's motion sensors 
            to guide your meditation session.
          </p>
        </div>

        <div className="space-y-3 w-full max-w-xs">
          <button
            onClick={onRequestPermission}
            className="w-full py-3 px-4 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors border border-gray-700"
          >
            Allow Sensor Access
          </button>
          
          <button
            onClick={onSkip}
            className="w-full py-3 px-4 text-gray-500 hover:text-white transition-colors"
          >
            Skip Meditation
          </button>
        </div>
      </div>
    </div>
  );
}
