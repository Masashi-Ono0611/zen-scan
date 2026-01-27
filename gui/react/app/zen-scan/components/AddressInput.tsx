// Zen Scan - Address Input Component

import { useState, useCallback } from 'react';
import { validateAddressWithMessage, normalizeAddress } from '../utils/address';

interface AddressInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  disabled?: boolean;
  className?: string;
}

/**
 * Text input with TON address validation and Zen styling.
 */
export function AddressInput({
  value,
  onChange,
  onSubmit,
  disabled = false,
  className = '',
}: AddressInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  
  const { isValid, error } = validateAddressWithMessage(value);
  const showError = error && value.length > 0;

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(normalizeAddress(newValue));
  }, [onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isValid && onSubmit) {
      onSubmit();
    }
  }, [isValid, onSubmit]);

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          placeholder="EQ... or UQ..."
          className={`
            w-full px-4 py-3
            bg-white/10 border-2 transition-all duration-200
            text-white placeholder-white/60 font-mono text-sm
            shadow-[0_12px_48px_rgba(0,0,0,0.25)]
            focus:outline-none
            disabled:opacity-50 disabled:cursor-not-allowed
            ${isFocused 
              ? 'border-white/40 bg-white/[0.15] shadow-[0_16px_56px_rgba(0,0,0,0.3)]' 
              : showError 
                ? 'border-red-400/70' 
                : isValid 
                  ? 'border-green-400/70' 
                  : 'border-white/30'
            }
          `}
          style={{
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            borderRadius: '32px',
          }}
          spellCheck={false}
          autoComplete="off"
          autoCapitalize="off"
        />
      </div>

      {/* Message area - maintains consistent height */}
      <div className="h-5">
        {showError && (
          <p className="text-red-400 text-xs px-1">
            {error}
          </p>
        )}

        {isValid && (
          <p className="text-green-400 text-xs px-1">
            ✓ Valid TON address
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Compact address display.
 */
export function AddressDisplay({
  address,
  className = '',
}: {
  address: string;
  className?: string;
}) {
  const shortened = address.length > 20
    ? `${address.slice(0, 8)}...${address.slice(-6)}`
    : address;

  return (
    <span 
      className={`font-mono text-sm text-gray-400 ${className}`}
      title={address}
    >
      {shortened}
    </span>
  );
}
