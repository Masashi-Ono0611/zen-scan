// Zen Scan - Risk Analysis Screen

import { useState, useEffect } from 'react';
import type { RiskAssessment } from '../types';
import { EnsoCircle } from '../components/EnsoCircle';
import { WaterRipple } from '../components/WaterRipple';
import { AddressDisplay } from '../components/AddressInput';
import { ZenButton } from '../components/ZenButton';
import { GlassBottomBar, BottomBarSpacer } from '../components/GlassBottomBar';
import { 
  onAnalysisStart, 
  onAnalysisComplete, 
  onLoadingPulse, 
  onNavigateBack 
} from '../utils/haptics';

interface RiskAnalysisScreenProps {
  address: string;
  assessment: RiskAssessment;
  requiresMeditation: boolean;
  onStartMeditation: () => void;
  onSkip: () => void;
  onBack: () => void;
}

/**
 * Risk analysis results screen.
 */
export function RiskAnalysisScreen({
  address,
  assessment,
  requiresMeditation,
  onStartMeditation,
  onSkip,
  onBack,
}: RiskAnalysisScreenProps) {
  const [showDetails, setShowDetails] = useState(false);
  const { score, level, zenWarning, technicalExplanation, redFlags, recommendation } = assessment;

  // Haptic feedback when results are displayed
  useEffect(() => {
    onAnalysisComplete();
  }, []);

  return (
    <div className="flex flex-col flex-1 h-full relative bg-[#0f1115]">
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="w-full max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between pt-16 mb-4">
            <button 
              onClick={() => {
                onNavigateBack();
                onBack();
              }}
              className="text-gray-400 hover:text-white transition-colors text-sm"
            >
              ← Back
            </button>
            <AddressDisplay address={address} />
          </div>

          {/* Enso Circle with Score */}
          <div className="flex justify-center mb-4">
            <EnsoCircle 
              score={score} 
              level={level}
              size={150}
              animated={false}
            />
          </div>

          {/* Zen Warning - Main Message */}
          <div className="text-center mb-6">
            <p className="text-3xl text-white font-light tracking-widest mb-2 drop-shadow-lg" style={{ fontFamily: "'Noto Serif JP', 'Hiragino Mincho ProN', 'Yu Mincho', serif" }}>
              {zenWarning.jp}
            </p>
            <p className="text-gray-200 text-sm italic drop-shadow">
              {zenWarning.en}
            </p>
          </div>

        {/* Red Flags */}
        {redFlags.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-300 mb-2">Warning Signs</h3>
            <ul className="space-y-1.5">
              {redFlags.map((flag, index) => (
                <li 
                  key={index}
                  className="flex items-start gap-2 text-sm text-red-400"
                >
                  <span className="text-red-500 shrink-0">⚠</span>
                  <span>{flag}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommendation */}
        <div className="rounded-lg p-4 mb-4 border border-[#1f2430] bg-[#151821]">
          <h3 className="text-sm font-medium text-gray-300 mb-2">Recommendation</h3>
          <p className="text-gray-200 text-sm leading-relaxed">{recommendation}</p>
        </div>

        {/* Technical Details (Collapsible) */}
        <div className="mb-4">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200 transition-colors"
          >
            <span className="transition-transform duration-200" style={{ transform: showDetails ? 'rotate(90deg)' : 'rotate(0deg)' }}>▶</span>
            Technical Details
          </button>
          
          {showDetails && (
            <div className="mt-2 p-4 rounded-lg border border-[#1f2430] bg-[#151821]">
              <p className="text-sm text-gray-200 whitespace-pre-wrap leading-relaxed">
                {technicalExplanation}
              </p>
            </div>
          )}
        </div>

          {/* Spacer for bottom bar */}
          <BottomBarSpacer />
        </div>
      </div>

      {/* Glass Bottom Bar */}
      <GlassBottomBar>
        {requiresMeditation ? (
          <ZenButton
            onClick={onStartMeditation}
            variant="primary"
            size="lg"
            fullWidth
          >
            Start Meditation
          </ZenButton>
        ) : (
          <ZenButton
            onClick={onSkip}
            variant="primary"
            size="lg"
            fullWidth
          >
            Done
          </ZenButton>
        )}
      </GlassBottomBar>
    </div>
  );
}

/**
 * Loading state for analysis with Zen aesthetic.
 */
export function AnalysisLoadingScreen() {
  const message = { jp: '洞察', en: 'Scanning deeply...' };

  // Haptic feedback on mount (analysis start)
  useEffect(() => {
    onAnalysisStart();

    // Periodic subtle pulse during loading
    const pulseInterval = setInterval(() => {
      onLoadingPulse();
    }, 4000); // Every 4 seconds

    return () => {
      clearInterval(pulseInterval);
    };
  }, []);

  return (
    <div className="flex flex-col flex-1 h-full relative overflow-hidden bg-[#0f1115]">
      {/* Content Layer */}
      <div className="relative z-10 flex flex-col flex-1 h-full px-6">
        <div className="w-full max-w-3xl mx-auto flex flex-col flex-1">
          {/* Header */}
          <div className="text-center pt-40 pb-8 shrink-0">
            <h1 className="text-5xl font-light tracking-wide text-white" style={{ fontFamily: "'Cormorant Garamond', serif", textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' }}>
              Zen Scan
            </h1>
          </div>

          {/* Center Content - Loading Animation */}
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="text-center">
              {/* Water Ripple Animation */}
              <div className="flex justify-center mb-8">
                <div className="relative" style={{ width: '192px', height: '192px' }}>
                  <WaterRipple intensity={0.05} bright />
                </div>
              </div>

              {/* Loading text */}
              <div className="px-6 py-4">
                <p className="text-3xl text-white font-light tracking-widest mb-2 drop-shadow-lg" style={{ fontFamily: "'Noto Serif JP', 'Hiragino Mincho ProN', 'Yu Mincho', serif" }}>
                  {message.jp}
                </p>
                <p className="text-gray-200 text-sm italic drop-shadow">
                  {message.en}
                </p>
              </div>
            </div>
          </div>

          {/* Bottom spacing - same as HomeScreen */}
          <div className="pt-8 pb-4 w-full shrink-0"></div>
        </div>
      </div>
    </div>
  );
}
