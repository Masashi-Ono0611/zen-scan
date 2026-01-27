// Zen Scan - Main Application Container

import { useState, useCallback, useEffect } from 'react';
import type { AppScreen, ContractData, RiskAssessment, MeditationConfig } from './types';
import { HomeScreen } from './screens/HomeScreen';
import { RiskAnalysisScreen, AnalysisLoadingScreen } from './screens/RiskAnalysisScreen';
import { MeditationScreen } from './screens/MeditationScreen';
import { CompletionScreen } from './screens/CompletionScreen';
import { fetchContractData } from './services/tonapi';
import { analyzeContract } from './services/riskAnalyzer';
import { getMeditationConfig, requiresMeditation } from './utils/risk';
import { onError } from './utils/haptics';
import './styles.css';

/**
 * Main Zen Scan application container.
 * Manages state and screen navigation.
 */
export function ZenScanApp() {
  // State
  const [screen, setScreen] = useState<AppScreen>('home');
  const [address, setAddress] = useState('');
  const [_contractData, setContractData] = useState<ContractData | null>(null);
  const [assessment, setAssessment] = useState<RiskAssessment | null>(null);
  const [meditationConfig, setMeditationConfig] = useState<MeditationConfig | null>(null);
  const [meditationCompleted, setMeditationCompleted] = useState(false);
  const [_error, setError] = useState<string | null>(null);

  // Expand viewport on mount using native Telegram WebApp API
  useEffect(() => {
    try {
      // Use native Telegram WebApp API for maximum compatibility
      const tg = (window as any).Telegram?.WebApp;
      if (tg) {
        // Expand to full height
        tg.expand();
        // Ready signal
        tg.ready();
      }
    } catch (e) {
      console.warn('Failed to expand viewport:', e);
    }
  }, []);

  // Handle address analysis
  const handleAnalyze = useCallback(async () => {
    if (!address) return;

    setScreen('loading');
    setError(null);

    try {
      // Fetch contract data from TonAPI
      const data = await fetchContractData(address);
      setContractData(data);

      // Analyze with AI (Amazon Bedrock)
      const result = await analyzeContract(data);
      setAssessment(result);

      // Determine meditation requirements (use internal riskScore)
      const config = getMeditationConfig(result.riskScore);
      setMeditationConfig(config);
      setMeditationCompleted(false);

      setScreen('analysis');
    } catch (err) {
      console.error('Analysis failed:', err);
      setError(err instanceof Error ? err.message : 'Analysis failed');
      onError();
      setScreen('home');
    }
  }, [address]);

  // Handle meditation start
  const handleStartMeditation = useCallback(() => {
    setScreen('meditation');
  }, []);

  // Handle meditation complete
  const handleMeditationComplete = useCallback(() => {
    setMeditationCompleted(true);
    setScreen('complete');
  }, []);

  // Handle skip (low risk - no meditation needed) - go back to home
  const handleSkip = useCallback(() => {
    setAddress('');
    setContractData(null);
    setAssessment(null);
    setMeditationConfig(null);
    setMeditationCompleted(false);
    setError(null);
    setScreen('home');
  }, []);

  // Handle analyze another
  const handleAnalyzeAnother = useCallback(() => {
    setAddress('');
    setContractData(null);
    setAssessment(null);
    setMeditationConfig(null);
    setMeditationCompleted(false);
    setError(null);
    setScreen('home');
  }, []);

  // Handle back to home
  const handleBack = useCallback(() => {
    setScreen('home');
  }, []);

  // Handle cancel meditation
  const handleCancelMeditation = useCallback(() => {
    setScreen('analysis');
  }, []);

  // Render screen with Telegram-optimized container
  const renderScreen = () => {
    switch (screen) {
      case 'home':
        return (
          <HomeScreen
            address={address}
            onAddressChange={setAddress}
            onAnalyze={handleAnalyze}
          />
        );

      case 'loading':
        return <AnalysisLoadingScreen />;

      case 'analysis':
        if (!assessment) {
          return <AnalysisLoadingScreen />;
        }
        return (
          <RiskAnalysisScreen
            address={address}
            assessment={assessment}
            requiresMeditation={requiresMeditation(assessment.riskScore)}
            onStartMeditation={handleStartMeditation}
            onSkip={handleSkip}
            onBack={handleBack}
          />
        );

      case 'meditation':
        if (!meditationConfig) {
          return <AnalysisLoadingScreen />;
        }
        return (
          <MeditationScreen
            config={meditationConfig}
            address={address}
            onComplete={handleMeditationComplete}
            onCancel={handleCancelMeditation}
          />
        );

      case 'complete':
        if (!assessment) {
          return <AnalysisLoadingScreen />;
        }
        return (
          <CompletionScreen
            address={address}
            assessment={assessment}
            meditationCompleted={meditationCompleted}
            onAnalyzeAnother={handleAnalyzeAnother}
            onBack={() => setScreen('analysis')}
          />
        );

      default:
        return <HomeScreen address={address} onAddressChange={setAddress} onAnalyze={handleAnalyze} />;
    }
  };

  return (
    <div className="tg-app-container bg-[#1a1a1a]">
      <div className="tg-screen">
        {renderScreen()}
      </div>
    </div>
  );
}
