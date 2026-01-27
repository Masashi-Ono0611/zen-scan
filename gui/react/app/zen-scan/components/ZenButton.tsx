// Zen Scan - Zen Button Component

import { onButtonPress } from '../utils/haptics';

interface ZenButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  className?: string;
}

/**
 * Styled button with Zen aesthetic.
 */
export function ZenButton({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
}: ZenButtonProps) {
  const handleClick = () => {
    if (!disabled) {
      onButtonPress();
      onClick?.();
    }
  };

  const baseStyles = 'font-medium transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 rounded-full';
  
  const variantStyles = {
    primary: 'bg-white/[0.15] text-white hover:bg-white/[0.25] shadow-[0_12px_48px_rgba(0,0,0,0.25)] hover:shadow-[0_16px_56px_rgba(0,0,0,0.3)] border-2 border-white/30',
    secondary: 'bg-white/10 text-gray-200 border-2 border-white/25 hover:bg-white/[0.15] hover:border-white/[0.35] shadow-[0_8px_32px_rgba(0,0,0,0.2)]',
    danger: 'bg-red-500/10 text-white hover:bg-red-500/20 shadow-[0_12px_48px_rgba(0,0,0,0.25)] hover:shadow-xl border-2 border-white/30',
    ghost: 'bg-transparent text-gray-300 hover:text-white hover:bg-white/10',
  };

  const sizeStyles = {
    sm: 'h-10 px-4 text-sm',
    md: 'h-12 px-5 text-base',
    lg: 'h-[52px] px-6 text-lg',
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      style={{
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
    >
      {children}
    </button>
  );
}

/**
 * Icon button variant.
 */
export function ZenIconButton({
  children,
  onClick,
  disabled = false,
  className = '',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  const handleClick = () => {
    if (!disabled) {
      onButtonPress();
      onClick?.();
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`
        p-2 rounded-full transition-all duration-200
        text-gray-400 hover:text-gray-200 hover:bg-gray-800/50
        active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {children}
    </button>
  );
}
