import { type ReactNode, type CSSProperties } from 'react';
import { useTheme } from '../hooks/use-theme.js';

/** Converts a ThemeConfig into CSS custom properties for inline styling. */
export function useThemeStyles(): { style: CSSProperties; theme: ReturnType<typeof useTheme>['theme'] } {
  const { theme } = useTheme();
  const style: CSSProperties = {
    '--bg-primary': theme.colors.bgPrimary,
    '--bg-secondary': theme.colors.bgSecondary,
    '--bg-tertiary': theme.colors.bgTertiary,
    '--bg-hover': theme.colors.bgHover,
    '--border': theme.colors.border,
    '--text-primary': theme.colors.textPrimary,
    '--text-secondary': theme.colors.textSecondary,
    '--text-muted': theme.colors.textMuted,
    '--accent': theme.colors.accent,
    '--accent-hover': theme.colors.accentHover,
    '--danger': theme.colors.danger,
    '--warning': theme.colors.warning,
    '--success': theme.colors.success,
    '--info': theme.colors.info,
    '--font-xs': theme.fontSizes.xs,
    '--font-sm': theme.fontSizes.sm,
    '--font-base': theme.fontSizes.base,
    '--font-lg': theme.fontSizes.lg,
    '--font-xl': theme.fontSizes.xl,
  } as CSSProperties;

  return { style, theme };
}

/** Panel container — the basic building block of the IDE layout. */
export function Panel({
  children,
  style,
  className,
}: {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
}) {
  const { style: themeStyle } = useThemeStyles();
  return (
    <div
      className={`avhos-panel ${className ?? ''}`}
      style={{ ...themeStyle, ...style }}
    >
      {children}
    </div>
  );
}

/** Panel header with title and optional actions. */
export function PanelHeader({
  title,
  actions,
}: {
  title: string;
  actions?: ReactNode;
}) {
  return (
    <div className="avhos-panel-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)', fontSize: 'var(--font-sm)', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
      <span>{title}</span>
      {actions && <div style={{ display: 'flex', gap: '4px' }}>{actions}</div>}
    </div>
  );
}

/** Empty state component for panels with no content. */
export function EmptyState({ message, hint }: { message: string; hint?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--font-base)' }}>
      <p style={{ margin: '0 0 8px 0' }}>{message}</p>
      {hint && <p style={{ margin: 0, fontSize: 'var(--font-sm)', color: 'var(--text-muted)' }}>{hint}</p>}
    </div>
  );
}

/** Icon button — minimal, no text. */
export function IconButton({
  onClick,
  title,
  children,
  active,
}: {
  onClick?: () => void;
  title?: string;
  children: ReactNode;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        background: active ? 'var(--bg-hover)' : 'transparent',
        border: 'none',
        color: active ? 'var(--accent)' : 'var(--text-secondary)',
        cursor: 'pointer',
        padding: '6px',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 'var(--font-base)',
        transition: 'background 0.1s, color 0.1s',
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.background = 'var(--bg-hover)';
          e.currentTarget.style.color = 'var(--text-primary)';
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = 'var(--text-secondary)';
        }
      }}
    >
      {children}
    </button>
  );
}

/** Badge — small status indicator. */
export function Badge({
  children,
  color,
}: {
  children: ReactNode;
  color?: string;
}) {
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: '10px',
        fontSize: 'var(--font-xs)',
        fontWeight: 500,
        background: color ? `${color}22` : 'var(--bg-tertiary)',
        color: color ?? 'var(--text-secondary)',
        border: `1px solid ${color ? `${color}44` : 'var(--border)'}`,
      }}
    >
      {children}
    </span>
  );
}

/** Scrollable list container. */
export function ScrollList({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        overflowY: 'auto',
        flex: 1,
        height: '100%',
      }}
    >
      {children}
    </div>
  );
}

/** List item with hover state. */
export function ListItem({
  children,
  onClick,
  active,
  style,
}: {
  children: ReactNode;
  onClick?: () => void;
  active?: boolean;
  style?: CSSProperties;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: '6px 12px',
        cursor: onClick ? 'pointer' : 'default',
        background: active ? 'var(--bg-hover)' : 'transparent',
        color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
        borderLeft: active ? '2px solid var(--accent)' : '2px solid transparent',
        fontSize: 'var(--font-base)',
        transition: 'background 0.08s',
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!active && onClick) e.currentTarget.style.background = 'var(--bg-hover)';
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.background = 'transparent';
      }}
    >
      {children}
    </div>
  );
}
