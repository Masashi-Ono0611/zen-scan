// Zen Scan - Glass Bottom Bar Component
// iOS/Apple-like frosted glass bottom bar with high transparency

interface GlassBottomBarProps {
  children: React.ReactNode;
  className?: string;
  withContainer?: boolean; // Whether to wrap children in a glass container
}

/**
 * Fixed glass morphism bottom bar with high transparency.
 * Inspired by iOS Safari, Apple Music, and Telegram.
 */
export function GlassBottomBar({ children, className = '', withContainer = false }: GlassBottomBarProps) {
  return (
    <>
      {/* Glass bottom bar */}
      <div className={`fixed bottom-0 left-0 right-0 z-50 ${className}`}>
        <div 
          className="w-full max-w-3xl mx-auto px-4"
          style={{
            paddingBottom: 'max(env(safe-area-inset-bottom, 16px), 16px)',
            paddingTop: '16px',
          }}
        >
          {withContainer ? (
            <div 
              className="w-full rounded-[16px] border border-white/10 bg-[rgba(30,35,46,0.20)] backdrop-blur-xs px-4 py-3"
              style={{
                WebkitBackdropFilter: 'blur(8px)',
              }}
            >
              {children}
            </div>
          ) : (
            children
          )}
        </div>
      </div>
    </>
  );
}

/**
 * Spacer component to prevent content from being hidden behind the fixed bottom bar.
 */
export function BottomBarSpacer() {
  return (
    <div 
      className="shrink-0"
      style={{ 
        height: 'calc(80px + env(safe-area-inset-bottom, 16px))',
      }} 
    />
  );
}
