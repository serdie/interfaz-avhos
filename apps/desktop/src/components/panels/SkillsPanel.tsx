import { useAppStore } from '../../store/app-store.js';
import { useTranslation, useTheme, Panel, PanelHeader, EmptyState, ScrollList, Badge, IconButton } from '@avhos/ui';

export function SkillsPanel() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { skills } = useAppStore();

  return (
    <Panel>
      <PanelHeader
        title={t('skills.title')}
        actions={<IconButton title={t('skills.refresh')}>↻</IconButton>}
      />
      {skills.length === 0 ? (
        <EmptyState message={t('skills.empty')} />
      ) : (
        <ScrollList>
          {skills.map((skill) => (
            <div
              key={skill.id}
              style={{
                padding: '10px 12px',
                borderBottom: `1px solid ${theme.colors.border}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: theme.colors.textPrimary, fontSize: 'var(--font-base)', fontWeight: 500 }}>
                  {skill.name}
                </span>
                <Badge color={skill.enabled ? theme.colors.success : theme.colors.textMuted}>
                  {skill.enabled ? t('skills.enabled') : t('skills.disabled')}
                </Badge>
              </div>
              <div style={{ color: theme.colors.textSecondary, fontSize: 'var(--font-sm)', marginBottom: '6px' }}>
                {skill.description}
              </div>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <Badge color={theme.colors.accent}>{t(`skills.category.${skill.category}`)}</Badge>
                <span style={{ color: theme.colors.textMuted, fontSize: 'var(--font-xs)' }}>v{skill.version}</span>
                {skill.enabled && (
                  <button
                    style={{
                      marginLeft: 'auto',
                      background: 'transparent',
                      border: `1px solid ${theme.colors.border}`,
                      color: theme.colors.accent,
                      borderRadius: '3px',
                      padding: '2px 8px',
                      cursor: 'pointer',
                      fontSize: 'var(--font-xs)',
                    }}
                  >
                    {t('skills.run')}
                  </button>
                )}
              </div>
            </div>
          ))}
        </ScrollList>
      )}
    </Panel>
  );
}
