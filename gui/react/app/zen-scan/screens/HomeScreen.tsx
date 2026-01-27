// Zen Scan - Home Screen

import { useState, useEffect } from 'react';
import { AddressInput } from '../components/AddressInput';
import { ZenButton } from '../components/ZenButton';
import { GlassBottomBar, BottomBarSpacer } from '../components/GlassBottomBar';
import { isValidTonAddress } from '../utils/address';
import { onScreenAppear } from '../utils/haptics';

interface HomeScreenProps {
  address: string;
  onAddressChange: (address: string) => void;
  onAnalyze: () => void;
  isLoading?: boolean;
}

// Zen quotes with translations
const ZEN_QUOTES = [
  { jp: '静心', en: 'Calm the mind' },
  { jp: '静寂', en: 'In stillness, truth reveals itself' },
  { jp: '心眼', en: 'See with the mind\'s eye' },
];

/**
 * Home screen with Zen portrait background and layered content.
 */
export function HomeScreen({
  address,
  onAddressChange,
  onAnalyze,
  isLoading = false,
}: HomeScreenProps) {
  const [showInput, setShowInput] = useState(false);
  const isValid = isValidTonAddress(address);
  const quote = ZEN_QUOTES[0];

  // Haptic feedback on mount
  useEffect(() => {
    onScreenAppear();
  }, []);

  return (
    <div className="flex flex-col flex-1 h-full relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img 
          src="/zen-portrait.png" 
          alt="Zen Meditation" 
          className="w-full h-full object-cover animate-pan-horizontal"
          style={{ objectPosition: 'center 60%' }}
        />
        {/* Gradient overlays for readability - lighter at bottom to show meditating person */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </div>

      {/* Content Layer */}
      <div className="relative z-10 flex flex-col flex-1 h-full">
        {/* Header */}
        <div className="text-center pt-40 pb-8 flex-shrink-0">
          <h1 className="text-5xl font-light tracking-wide text-white" style={{ fontFamily: "'Cormorant Garamond', serif", textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' }}>
            Zen Scan
          </h1>
        </div>

        {/* Center Content - Zen Quote (Hidden when input is shown) */}
        {!showInput && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <div className="inline-block px-6 py-4">
                <p className="text-3xl text-white font-light tracking-widest mb-2 drop-shadow-lg" style={{ fontFamily: "'Noto Serif JP', 'Hiragino Mincho ProN', 'Yu Mincho', serif" }}>
                  {quote.jp}
                </p>
                <p className="text-gray-200 text-sm italic drop-shadow">
                  {quote.en}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Spacer for bottom bar */}
        <div className="flex-1"></div>
        <BottomBarSpacer />
      </div>

      {/* Glass Bottom Bar */}
      <GlassBottomBar withContainer={showInput}>
        {!showInput ? (
          /* Initial Start Button - no container */
          <div className="flex justify-center">
            <ZenButton
              onClick={() => setShowInput(true)}
              variant="primary"
              size="lg"
              className="px-12"
            >
              Start
            </ZenButton>
          </div>
        ) : (
          /* Input and Analyze Button - with glass container */
          <div className="space-y-3">
            {/* Instruction text - aligned with validation message */}
            <div className="px-1">
              <p className="text-gray-400 text-xs tracking-wide">
                Enter TON Address
              </p>
            </div>
            
            <AddressInput
              value={address}
              onChange={onAddressChange}
              onSubmit={onAnalyze}
              disabled={isLoading}
            />
            <ZenButton
              onClick={onAnalyze}
              disabled={!isValid || isLoading}
              variant="primary"
              size="lg"
              fullWidth
            >
              {isLoading ? 'Analyzing...' : 'Analyze'}
            </ZenButton>
          </div>
        )}
      </GlassBottomBar>
    </div>
  );
}
