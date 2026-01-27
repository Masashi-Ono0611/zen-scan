// Zen Scan - Risk Analyzer Client

import type { ContractData, RiskAssessment } from '../types';
import { validateRiskAssessment, createDefaultRiskAssessment } from '../utils/validation';

// API endpoint
const API_ENDPOINT = '/app/api/analyze';

/**
 * Analyzes a contract for security risks using Amazon Bedrock AI.
 * Calls the Lambda API which interfaces with Bedrock.
 */
export async function analyzeContract(data: ContractData): Promise<RiskAssessment> {
  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API error: ${response.status}`);
    }

    const result = await response.json();
    console.log('📥 Raw API response:', result);
    
    if (result.error) {
      throw new Error(result.error);
    }

    const validated = validateRiskAssessment(result.data || result);
    console.log('✅ Validated assessment:', validated);
    return validated;
  } catch (error) {
    console.error('Bedrock risk analysis failed:', error);
    // Return default high-risk assessment on error
    return createDefaultRiskAssessment();
  }
}
