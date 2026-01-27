// Zen Scan - Core Types

// ============================================
// TonAPI Response Types
// ============================================

export interface AccountInfo {
  address: string;
  balance: string;
  status: 'active' | 'uninit' | 'frozen';
  interfaces?: string[];  // e.g., ['jetton_master', 'nft_collection']
  name?: string;
  icon?: string;
}

export interface Message {
  source?: string;
  destination?: string;
  value?: string;
  op_code?: string | null;
  comment?: string | null;
}

export interface Transaction {
  hash: string;
  lt: string;
  account: {
    address: string;
  };
  success: boolean;
  utime: number;
  in_msg?: Message | null;
  out_msgs?: Message[];
  total_fees: string;
}

export interface TransactionHistory {
  transactions: Transaction[];
}

// ============================================
// Contract Data (for AI Analysis)
// ============================================

export interface ContractData {
  address: string;
  accountInfo: AccountInfo;
  transactions: Transaction[];
  fetchedAt: number;
}

// ============================================
// Risk Assessment Types
// ============================================

export type RiskLevel = 'safe' | 'low' | 'medium' | 'high' | 'critical';

export interface RiskAssessment {
  score: number;           // 0-100 (Trust Score: higher = safer)
  riskScore: number;       // 0-100 (Risk Score: higher = riskier, for internal use)
  level: RiskLevel;
  zenWarning: {            // Zen-style warning message
    jp: string;            // Japanese word (2-3 kanji)
    en: string;            // English message (max 50 chars)
  };
  technicalExplanation: string;
  redFlags: string[];
  recommendation: string;
}

// ============================================
// Meditation Session Types
// ============================================

export interface MeditationConfig {
  duration: number;           // seconds (15, 30, or 60)
  tiltTolerance: number;      // degrees (5, 10, or 15)
}

export interface MeditationState {
  isActive: boolean;
  remainingTime: number;      // seconds
  elapsedTime: number;        // seconds
  stableTime: number;         // seconds
  stabilityPercentage: number;
  isDeviceStable: boolean;
  isComplete: boolean;
}

// ============================================
// Device Orientation Types
// ============================================

export interface DeviceOrientation {
  alpha: number | null;  // Z-axis rotation (compass)
  beta: number | null;   // X-axis rotation (front-back tilt)
  gamma: number | null;  // Y-axis rotation (left-right tilt)
}

export interface StabilityMetrics {
  totalTime: number;      // Total elapsed time in ms
  stableTime: number;     // Time device was stable in ms
  percentage: number;     // stableTime / totalTime * 100
  isCurrentlyStable: boolean;
}

// ============================================
// Application State Types
// ============================================

export type AppScreen = 'home' | 'loading' | 'analysis' | 'meditation' | 'complete';

export interface AddressInputState {
  address: string;
  isValid: boolean;
  error: string | null;
}

export interface ZenScanState {
  // Address input state
  addressInput: AddressInputState;
  
  // Contract data
  contractData: ContractData | null;
  isFetching: boolean;
  fetchError: string | null;
  
  // Risk assessment
  riskAssessment: RiskAssessment | null;
  isAnalyzing: boolean;
  analysisError: string | null;
  
  // Meditation state
  meditation: MeditationState | null;
  meditationConfig: MeditationConfig | null;
  
  // UI state
  currentScreen: AppScreen;
}

// ============================================
// API Response Types
// ============================================

export interface AnalyzeResponse {
  success: boolean;
  data?: RiskAssessment;
  error?: string;
}

export interface TonAPIError {
  error: string;
  code?: number;
}
