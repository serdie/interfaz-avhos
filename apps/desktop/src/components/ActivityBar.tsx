import { useAppStore, type ActivityView } from '../store/app-store.js';
import { useTranslation } from '@avhos/ui';
import { useTheme } from '@avhos/ui';

/** Activity bar icons — simple SVG paths for a clean IDE look */
const ICONS: Record<ActivityView, string> = {
  explorer: 'M3 3h18v18H3V3zm2 2v14h14V5H5z',
  chat: 'M21 6h-2v9H6v2c0 .55.45 1 1 1h11l4 4V7c0-.55-.45-1-1-1zm-4 6V3c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v14l4-4h10c.55 0 1-.45 1-1z',
  planner: 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z',
  memory: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.07 5 7.41 0 2.08-.8 3.97-2.1 5.39z',
  skills: 'M22 11.04V12c0 5.52-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2c.39 0 .78.02 1.16.06-.37.59-.58 1.28-.58 2.02 0 .68.18 1.32.5 1.86L12 8l-2.5 2.5L12 13l2.5-2.5L12 8z',
  mcp: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
  models: 'M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z',
  logs: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z',
  settings: 'M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z',
};

const VIEW_KEYS: Record<ActivityView, string> = {
  explorer: 'activity.explorer',
  chat: 'activity.chat',
  planner: 'activity.planner',
  memory: 'activity.memory',
  skills: 'activity.skills',
  mcp: 'activity.mcp',
  models: 'activity.models',
  logs: 'activity.logs',
  settings: 'activity.settings',
};

export function ActivityBar() {
  const { activeView, setActiveView, sidebarVisible, toggleSidebar } = useAppStore();
  const { t } = useTranslation();
  const { theme } = useTheme();

  const views: ActivityView[] = ['explorer', 'chat', 'planner', 'memory', 'skills', 'mcp', 'models', 'logs', 'settings'];

  return (
    <div
      style={{
        width: '48px',
        minWidth: '48px',
        background: theme.colors.bgSecondary,
        borderRight: `1px solid ${theme.colors.border}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: '8px',
      }}
    >
      {views.map((view) => {
        const isActive = activeView === view && sidebarVisible;
        return (
          <button
            key={view}
            onClick={() => {
              if (activeView === view && sidebarVisible) {
                toggleSidebar();
              } else {
                if (!sidebarVisible) toggleSidebar();
                setActiveView(view);
              }
            }}
            title={t(VIEW_KEYS[view])}
            style={{
              width: '48px',
              height: '48px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderLeft: isActive ? `2px solid ${theme.colors.accent}` : '2px solid transparent',
              color: isActive ? theme.colors.textPrimary : theme.colors.textMuted,
              transition: 'color 0.1s',
            }}
            onMouseEnter={(e) => {
              if (!isActive) e.currentTarget.style.color = theme.colors.textSecondary;
            }}
            onMouseLeave={(e) => {
              if (!isActive) e.currentTarget.style.color = theme.colors.textMuted;
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d={ICONS[view]} />
            </svg>
          </button>
        );
      })}
    </div>
  );
}
