// Zen Scan - Main Export

export { ZenScanApp } from './ZenScanApp';

// Types
export type {
  ContractData,
  RiskAssessment,
  RiskLevel,
  MeditationConfig,
  MeditationState,
  DeviceOrientation,
  AppScreen,
  ZenScanState,
} from './types';

// Components
export { EnsoCircle, EnsoLoading, ZenLogo, InkDropLoader } from './components/EnsoCircle';
export { WaterRipple, WaterRippleCSS } from './components/WaterRipple';
export { TiltIndicator, TiltBar } from './components/TiltIndicator';
export { ZenButton, ZenIconButton } from './components/ZenButton';
export { AddressInput, AddressDisplay } from './components/AddressInput';

// Screens
export { HomeScreen } from './screens/HomeScreen';
export { RiskAnalysisScreen, AnalysisLoadingScreen } from './screens/RiskAnalysisScreen';
export { MeditationScreen, PermissionScreen } from './screens/MeditationScreen';
export { CompletionScreen } from './screens/CompletionScreen';

// Hooks
export { useStabilityDetector } from './hooks/useStabilityDetector';
export { useMeditationSession } from './hooks/useMeditationSession';

// Services
export { fetchContractData, getTransactions, getAccountInfo } from './services/tonapi';
export { analyzeContract } from './services/riskAnalyzer';

// Utils
export { isValidTonAddress, normalizeAddress, shortenAddress } from './utils/address';
export { getRiskLevel, getMeditationConfig, requiresMeditation, getRiskColor } from './utils/risk';
export { calculateStabilityPercentage, isDeviceHorizontal, formatTime } from './utils/stability';
export { validateRiskAssessment, parseAIResponse, createDefaultRiskAssessment } from './utils/validation';
export * from './utils/haptics';

// Constants
export * from './constants';
