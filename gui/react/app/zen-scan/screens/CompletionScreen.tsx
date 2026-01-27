// Zen Scan - Completion Screen

import { useEffect } from 'react';
import type { RiskAssessment } from '../types';
import { AddressDisplay } from '../components/AddressInput';
import { ZenButton } from '../components/ZenButton';
import { GlassBottomBar, BottomBarSpacer } from '../components/GlassBottomBar';
import { onScreenAppear, onNavigateBack } from '../utils/haptics';

interface CompletionScreenProps {
  address: string;
  assessment: RiskAssessment;
  meditationCompleted: boolean;
  onAnalyzeAnother: () => void;
  onBack: () => void;
}

/**
 * Completion screen after meditation.
 */
export function CompletionScreen({
  address,
  assessment,
  onAnalyzeAnother,
  onBack,
}: CompletionScreenProps) {
  const { recommendation } = assessment;

  // Haptic feedback on mount
  useEffect(() => {
    onScreenAppear();
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

          {/* Content - centered */}
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            {/* Success Icon with Zen aesthetic */}
            <div className="mb-8">
              <div className="w-28 h-28 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center">
                  <span className="text-5xl">🧘</span>
                </div>
              </div>
            </div>

            {/* Zen completion message */}
            <div className="text-center mb-8">
              <p className="text-3xl text-white font-light tracking-widest mb-2 drop-shadow-lg" style={{ fontFamily: "'Noto Serif JP', 'Hiragino Mincho ProN', 'Yu Mincho', serif" }}>
                禅定
              </p>
              <p className="text-gray-200 text-sm italic drop-shadow">
                Zen Realized
              </p>
            </div>

            {/* Recommendation */}
            <div className="w-full rounded-lg p-4 border border-[#1f2430] bg-[#151821]">
              <h3 className="text-xs text-gray-500 mb-2 tracking-wide">FINAL GUIDANCE</h3>
              <p className="text-gray-200 text-sm leading-relaxed">{recommendation}</p>
            </div>
          </div>

          {/* Spacer for bottom bar */}
          <BottomBarSpacer />
        </div>
      </div>

      {/* Glass Bottom Bar */}
      <GlassBottomBar>
        <ZenButton
          onClick={onAnalyzeAnother}
          variant="secondary"
          size="lg"
          fullWidth
        >
          Analyze Another
        </ZenButton>
      </GlassBottomBar>
    </div>
  );
}
