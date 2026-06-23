import { useAppStore } from '../store/app-store.js';
import { useTranslation, useTheme, Panel, PanelHeader, EmptyState, ScrollList, ListItem, Badge } from '@avhos/ui';
import { ExplorerPanel } from './panels/ExplorerPanel.js';
import { ChatPanel } from './panels/ChatPanel.js';
import { PlannerPanel } from './panels/PlannerPanel.js';
import { MemoryPanel } from './panels/MemoryPanel.js';
import { SkillsPanel } from './panels/SkillsPanel.js';
import { McpPanel } from './panels/McpPanel.js';
import { ModelsPanel } from './panels/ModelsPanel.js';
import { LogsPanel } from './panels/LogsPanel.js';
import { SettingsPanel } from './panels/SettingsPanel.js';

export function Sidebar() {
  const { activeView, sidebarVisible } = useAppStore();
  const { theme } = useTheme();

  if (!sidebarVisible) return null;

  return (
    <div
      style={{
        width: '300px',
        minWidth: '200px',
        background: theme.colors.bgSecondary,
        borderRight: `1px solid ${theme.colors.border}`,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {activeView === 'explorer' && <ExplorerPanel />}
      {activeView === 'chat' && <ChatPanel />}
      {activeView === 'planner' && <PlannerPanel />}
      {activeView === 'memory' && <MemoryPanel />}
      {activeView === 'skills' && <SkillsPanel />}
      {activeView === 'mcp' && <McpPanel />}
      {activeView === 'models' && <ModelsPanel />}
      {activeView === 'logs' && <LogsPanel />}
      {activeView === 'settings' && <SettingsPanel />}
    </div>
  );
}
