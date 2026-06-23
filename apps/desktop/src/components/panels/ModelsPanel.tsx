import { useAppStore } from '../../store/app-store.js';
import { useTranslation, useTheme, Panel, PanelHeader, EmptyState, ScrollList, Badge, IconButton } from '@avhos/ui';

export function ModelsPanel() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { providers, profiles, activeProfileId, setActiveProfile } = useAppStore();

  return (
    <Panel>
      <PanelHeader
        title={t('models.title')}
        actions={
          <>
            <IconButton title={t('models.addProvider')}>+</IconButton>
          </>
        }
      />
      {providers.length === 0 ? (
        <EmptyState message={t('models.empty')} />
      ) : (
        <ScrollList>
          {providers.map((provider) => {
            const providerProfiles = profiles.filter((p) => p.providerId === provider.id);
            return (
              <div key={provider.id} style={{ borderBottom: `1px solid ${theme.colors.border}` }}>
                <div
                  style={{
                    padding: '8px 12px',
                    background: theme.colors.bgTertiary,
                    fontSize: 'var(--font-sm)',
                    fontWeight: 600,
                    color: theme.colors.textPrimary,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span>{provider.name}</span>
                  <Badge color={provider.enabled ? theme.colors.success : theme.colors.textMuted}>
                    {t(`models.provider.${provider.type}`)}
                  </Badge>
                </div>
                <div style={{ padding: '4px 0' }}>
                  {providerProfiles.length === 0 ? (
                    <div style={{ padding: '8px 12px', color: theme.colors.textMuted, fontSize: 'var(--font-sm)' }}>
                      {t('common.none')}
                    </div>
                  ) : (
                    providerProfiles.map((profile) => (
                      <div
                        key={profile.id}
                        onClick={() => setActiveProfile(profile.id)}
                        style={{
                          padding: '8px 12px 8px 24px',
                          cursor: 'pointer',
                          background: profile.id === activeProfileId ? theme.colors.bgHover : 'transparent',
                          borderLeft: profile.id === activeProfileId ? `2px solid ${theme.colors.accent}` : '2px solid transparent',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ color: theme.colors.textPrimary, fontSize: 'var(--font-base)' }}>
                            {profile.displayName}
                          </span>
                          {profile.isDefault && (
                            <Badge color={theme.colors.accent}>{t('models.default')}</Badge>
                          )}
                        </div>
                        <div style={{ color: theme.colors.textMuted, fontSize: 'var(--font-xs)', marginTop: '2px' }}>
                          {profile.modelId} · {profile.contextWindow.toLocaleString('es-ES')} ctx · temp {profile.temperature}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </ScrollList>
      )}
    </Panel>
  );
}
