// Zen Scan - Address Validation Utilities

/**
 * Validates a TON address format.
 * TON addresses can be in two formats:
 * - Bounceable: EQ + 46 base64/base64url characters
 * - Non-bounceable: UQ + 46 base64/base64url characters
 * 
 * Both formats can contain: A-Za-z0-9, +, /, _, -
 * Total length: 48 characters
 */
export function isValidTonAddress(address: string): boolean {
  if (!address || typeof address !== 'string') {
    return false;
  }

  // Trim whitespace
  const trimmed = address.trim();

  // Check length (must be exactly 48 characters)
  if (trimmed.length !== 48) {
    return false;
  }

  // Must start with EQ or UQ
  if (!trimmed.startsWith('EQ') && !trimmed.startsWith('UQ')) {
    return false;
  }

  // Allow both base64 and base64url characters (A-Za-z0-9+/_-)
  const validCharsRegex = /^[EU]Q[A-Za-z0-9+/_-]{46}$/;

  return validCharsRegex.test(trimmed);
}

/**
 * Normalizes a TON address by trimming whitespace.
 */
export function normalizeAddress(address: string): string {
  return address.trim();
}

/**
 * Gets a shortened display version of a TON address.
 * Example: EQBRBreA0bxgUMSzl-C4mWMaEMlne4R1e3ne8TlBcn2Eq8SY
 *       -> EQBRBr...q8SY
 */
export function shortenAddress(address: string, prefixLength = 6, suffixLength = 4): string {
  if (!address || address.length <= prefixLength + suffixLength + 3) {
    return address;
  }
  return `${address.slice(0, prefixLength)}...${address.slice(-suffixLength)}`;
}

/**
 * Validates address and returns an error message if invalid.
 */
export function validateAddressWithMessage(address: string): { isValid: boolean; error: string | null } {
  const trimmed = address.trim();

  if (!trimmed) {
    return { isValid: false, error: null }; // Empty is not an error, just not valid
  }

  if (trimmed.length !== 48) {
    return { 
      isValid: false, 
      error: `Address must be 48 characters (currently ${trimmed.length})` 
    };
  }

  if (!trimmed.startsWith('EQ') && !trimmed.startsWith('UQ')) {
    return { 
      isValid: false, 
      error: 'Address must start with EQ or UQ' 
    };
  }

  if (!isValidTonAddress(trimmed)) {
    return { 
      isValid: false, 
      error: 'Invalid address format' 
    };
  }

  return { isValid: true, error: null };
}
