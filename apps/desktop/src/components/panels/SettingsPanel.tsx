import { useAppStore } from '../../store/app-store.js';
import { useTranslation, useTheme, Panel, PanelHeader, ScrollList } from '@avhos/ui';

export function SettingsPanel() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { settings } = useAppStore();

  const categories = ['appearance', 'editor', 'terminal', 'models', 'mcp', 'agent', 'general'] as const;

  return (
    <Panel>
      <PanelHeader title={t('settings.title')} />
      <ScrollList>
        {categories.map((cat) => {
          const catSettings = settings.filter((s) => s.category === cat);
          if (catSettings.length === 0) return null;
          return (
            <div key={cat} style={{ borderBottom: `1px solid ${theme.colors.border}` }}>
              <div
                style={{
                  padding: '8px 12px',
                  background: theme.colors.bgTertiary,
                  fontSize: 'var(--font-sm)',
                  fontWeight: 600,
                  color: theme.colors.textPrimary,
                }}
              >
                {t(`settings.${cat}`)}
              </div>
              {catSettings.map((setting) => (
                <div
                  key={setting.id}
                  style={{
                    padding: '8px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ color: theme.colors.textPrimary, fontSize: 'var(--font-base)' }}>
                      {setting.description}
                    </div>
                    <div style={{ color: theme.colors.textMuted, fontSize: 'var(--font-xs)' }}>
                      {setting.key}
                    </div>
                  </div>
                  <div style={{ color: theme.colors.accent, fontSize: 'var(--font-sm)' }}>
                    {String(setting.value)}
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </ScrollList>
    </Panel>
  );
}
