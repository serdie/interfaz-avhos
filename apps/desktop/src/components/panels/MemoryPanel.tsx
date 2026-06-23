import { useState } from 'react';
import { useAppStore } from '../../store/app-store.js';
import { useTranslation, useTheme, Panel, PanelHeader, EmptyState, ScrollList, Badge, IconButton } from '@avhos/ui';

const IMPORTANCE_COLORS: Record<string, string> = {
  low: '#6e7681',
  medium: '#2f81f7',
  high: '#d29922',
  critical: '#f85149',
};

const TYPE_COLORS: Record<string, string> = {
  preference: '#2f81f7',
  project_fact: '#3fb950',
  decision: '#a371f7',
  summary: '#6e7681',
  correction: '#f85149',
  verified_outcome: '#3fb950',
  pattern: '#d29922',
  note: '#6e7681',
};

export function MemoryPanel() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { memoryEntries } = useAppStore();
  const [search, setSearch] = useState('');

  const filtered = search
    ? memoryEntries.filter(
        (e) =>
          e.title.toLowerCase().includes(search.toLowerCase()) ||
          e.content.toLowerCase().includes(search.toLowerCase()) ||
          e.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase())),
      )
    : memoryEntries;

  return (
    <Panel>
      <PanelHeader
        title={t('memory.title')}
        actions={<IconButton title={t('memory.newEntry')}>+</IconButton>}
      />
      <div style={{ padding: '8px', borderBottom: `1px solid ${theme.colors.border}` }}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('memory.search')}
          style={{
            width: '100%',
            background: theme.colors.bgTertiary,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: '4px',
            padding: '6px 8px',
            color: theme.colors.textPrimary,
            fontSize: 'var(--font-sm)',
            outline: 'none',
          }}
        />
      </div>
      {filtered.length === 0 ? (
        <EmptyState message={t('memory.empty')} />
      ) : (
        <ScrollList>
          {filtered.map((entry) => (
            <div
              key={entry.id}
              style={{
                padding: '10px 12px',
                borderBottom: `1px solid ${theme.colors.border}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <span style={{ color: theme.colors.textPrimary, fontSize: 'var(--font-base)', fontWeight: 500 }}>
                  {entry.title}
                </span>
              </div>
              <div style={{ color: theme.colors.textSecondary, fontSize: 'var(--font-sm)', marginBottom: '6px' }}>
                {entry.content}
              </div>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                <Badge color={TYPE_COLORS[entry.type]}>{t(`memory.type.${entry.type}`)}</Badge>
                <Badge color={IMPORTANCE_COLORS[entry.importance]}>{t(`memory.importance.${entry.importance}`)}</Badge>
                {entry.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      fontSize: 'var(--font-xs)',
                      color: theme.colors.textMuted,
                      padding: '1px 6px',
                      background: theme.colors.bgTertiary,
                      borderRadius: '3px',
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </ScrollList>
      )}
    </Panel>
  );
}
