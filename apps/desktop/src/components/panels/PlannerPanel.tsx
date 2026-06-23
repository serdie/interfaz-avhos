import { useAppStore } from '../../store/app-store.js';
import { useTranslation, useTheme, Panel, PanelHeader, EmptyState, ScrollList, Badge } from '@avhos/ui';

const STATUS_COLORS: Record<string, string> = {
  pending: '#6e7681',
  in_progress: '#2f81f7',
  blocked: '#d29922',
  completed: '#3fb950',
  failed: '#f85149',
  cancelled: '#6e7681',
};

const PRIORITY_COLORS: Record<string, string> = {
  low: '#6e7681',
  medium: '#2f81f7',
  high: '#d29922',
  critical: '#f85149',
};

export function PlannerPanel() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { tasks } = useAppStore();

  return (
    <Panel>
      <PanelHeader title={t('planner.title')} />
      {tasks.length === 0 ? (
        <EmptyState message={t('planner.empty')} />
      ) : (
        <ScrollList>
          {tasks.map((task) => (
            <div
              key={task.id}
              style={{
                padding: '10px 12px',
                borderBottom: `1px solid ${theme.colors.border}`,
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ color: theme.colors.textPrimary, fontSize: 'var(--font-base)', fontWeight: 500 }}>
                  {task.title}
                </span>
              </div>
              <div style={{ color: theme.colors.textSecondary, fontSize: 'var(--font-sm)', marginBottom: '6px' }}>
                {task.description}
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <Badge color={STATUS_COLORS[task.status]}>
                  {t(`planner.status.${task.status}`)}
                </Badge>
                <Badge color={PRIORITY_COLORS[task.priority]}>
                  {t(`planner.priority.${task.priority}`)}
                </Badge>
              </div>
            </div>
          ))}
        </ScrollList>
      )}
    </Panel>
  );
}
