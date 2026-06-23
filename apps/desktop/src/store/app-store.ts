import { create } from 'zustand';
import type {
  Workspace,
  Project,
  FileTab,
  FileTreeNode,
  AgentSession,
  ChatMessage,
  Task,
  MemoryEntry,
  Skill,
  MCPServer,
  ModelProvider,
  ModelProfile,
  LogEntry,
  AppSetting,
  UUID,
  ISODateString,
} from '@avhos/core';
import { uuid, isoNow } from '@avhos/core';

/**
 * Global UI state store using Zustand.
 * This is UI-only state — domain state lives in the service layer.
 * The store bridges the service layer and React components.
 */

export type ActivityView =
  | 'explorer'
  | 'chat'
  | 'planner'
  | 'memory'
  | 'skills'
  | 'mcp'
  | 'models'
  | 'logs'
  | 'settings';

export interface CommandPaletteEntry {
  id: string;
  label: string;
  hint?: string;
  action: () => void;
}

export type ActivityCategory = 'workspace' | 'editor' | 'explorer' | 'system';
export type ActivityLevel = 'info' | 'warn' | 'error';

export interface ActivityEntry {
  id: string;
  timestamp: ISODateString;
  category: ActivityCategory;
  level: ActivityLevel;
  message: string;
}

/** Estado de carga del contenido de un archivo para una pestaña abierta. */
export interface TabContentState {
  content: string;
  loading: boolean;
  error: string | null;
  loaded: boolean;
  saving: boolean;
  saveError: string | null;
}

interface AppStore {
  // Workspace
  workspace: Workspace | null;
  projects: Project[];

  // Editor
  openTabs: FileTab[];
  activeTabId: UUID | null;

  // Activity bar
  activeView: ActivityView;
  sidebarVisible: boolean;
  rightPanelVisible: boolean;
  bottomPanelVisible: boolean;

  // Command palette
  paletteOpen: boolean;
  paletteEntries: CommandPaletteEntry[];

  // Agent sessions
  sessions: AgentSession[];
  activeSessionId: UUID | null;

  // Tasks
  tasks: Task[];

  // Memory
  memoryEntries: MemoryEntry[];

  // Skills
  skills: Skill[];

  // MCP
  mcpServers: MCPServer[];

  // Models
  providers: ModelProvider[];
  profiles: ModelProfile[];
  activeProfileId: UUID | null;

  // Logs
  logs: LogEntry[];

  // Settings
  settings: AppSetting[];

  // Activity log (real events)
  activityLog: ActivityEntry[];

  // File tree (real filesystem-backed)
  fileTree: FileTreeNode[];
  treeLoading: boolean;
  treeError: string | null;
  workspaceRoot: string | null;

  // File contents (real, loaded from disk via adapter)
  tabContents: Record<string, TabContentState>;

  // Ollama real state
  ollamaStatus: 'checking' | 'online' | 'offline';
  ollamaModels: string[];
  activeModel: string | null;

  // Actions
  setWorkspace: (ws: Workspace) => void;
  setProjects: (projects: Project[]) => void;
  setFileTree: (nodes: FileTreeNode[]) => void;
  setTreeLoading: (loading: boolean) => void;
  setTreeError: (error: string | null) => void;
  setWorkspaceRoot: (root: string) => void;
  updateNode: (path: string, updater: (node: FileTreeNode) => FileTreeNode) => void;
  setTabContent: (tabId: UUID, state: TabContentState) => void;
  markTabDirty: (tabId: UUID) => void;
  markTabClean: (tabId: UUID) => void;
  openTab: (tab: FileTab) => void;
  closeTab: (id: UUID) => void;
  closeAllTabs: () => void;
  setActiveTab: (id: UUID) => void;
  setActiveView: (view: ActivityView) => void;
  toggleSidebar: () => void;
  toggleRightPanel: () => void;
  toggleBottomPanel: () => void;
  openPalette: () => void;
  closePalette: () => void;
  setPaletteEntries: (entries: CommandPaletteEntry[]) => void;
  setSessions: (sessions: AgentSession[]) => void;
  setActiveSession: (id: UUID) => void;
  addMessage: (sessionId: UUID, message: ChatMessage) => void;
  setTasks: (tasks: Task[]) => void;
  setMemoryEntries: (entries: MemoryEntry[]) => void;
  setSkills: (skills: Skill[]) => void;
  setMcpServers: (servers: MCPServer[]) => void;
  setProviders: (providers: ModelProvider[]) => void;
  setProfiles: (profiles: ModelProfile[]) => void;
  setActiveProfile: (id: UUID) => void;
  setLogs: (logs: LogEntry[]) => void;
  setSettings: (settings: AppSetting[]) => void;
  setOllamaStatus: (status: 'checking' | 'online' | 'offline') => void;
  setOllamaModels: (models: string[]) => void;
  setActiveModel: (model: string | null) => void;
  pushActivity: (category: ActivityCategory, level: ActivityLevel, message: string) => void;
  clearActivity: () => void;
}

export const useAppStore = create<AppStore>((set) => ({
  workspace: null,
  projects: [],
  openTabs: [],
  activeTabId: null,
  activeView: 'explorer',
  sidebarVisible: true,
  rightPanelVisible: true,
  bottomPanelVisible: true,
  paletteOpen: false,
  paletteEntries: [],
  sessions: [],
  activeSessionId: null,
  tasks: [],
  memoryEntries: [],
  skills: [],
  mcpServers: [],
  providers: [],
  profiles: [],
  activeProfileId: null,
  logs: [],
  settings: [],
  ollamaStatus: 'checking',
  ollamaModels: [],
  activeModel: null,
  activityLog: [],
  fileTree: [],
  treeLoading: false,
  treeError: null,
  workspaceRoot: null,
  tabContents: {},

  setWorkspace: (ws) => set({ workspace: ws }),
  setProjects: (projects) => set({ projects }),
  setFileTree: (nodes) => set({ fileTree: nodes }),
  setTreeLoading: (loading) => set({ treeLoading: loading }),
  setTreeError: (error) => set({ treeError: error }),
  setWorkspaceRoot: (root) => set({ workspaceRoot: root }),
  updateNode: (path, updater) =>
    set((s) => ({
      fileTree: updateNodeInTree(s.fileTree, path, updater),
    })),
  setTabContent: (tabId, state) =>
    set((s) => ({
      tabContents: { ...s.tabContents, [tabId]: state },
    })),
  markTabDirty: (tabId) =>
    set((s) => ({
      openTabs: s.openTabs.map((t) => (t.id === tabId ? { ...t, isDirty: true } : t)),
    })),
  markTabClean: (tabId) =>
    set((s) => ({
      openTabs: s.openTabs.map((t) => (t.id === tabId ? { ...t, isDirty: false } : t)),
    })),
  openTab: (tab) =>
    set((s) => {
      const existing = s.openTabs.find((t) => t.filePath === tab.filePath);
      if (existing) {
        return { openTabs: s.openTabs.map((t) => ({ ...t, isActive: t.id === existing.id })), activeTabId: existing.id };
      }
      return {
        openTabs: [...s.openTabs.map((t) => ({ ...t, isActive: false })), { ...tab, isActive: true }],
        activeTabId: tab.id,
      };
    }),
  closeTab: (id) =>
    set((s) => {
      const tabs = s.openTabs.filter((t) => t.id !== id);
      const newActive = tabs.length > 0 ? tabs[tabs.length - 1].id : null;
      return {
        openTabs: tabs.map((t) => ({ ...t, isActive: t.id === newActive })),
        activeTabId: newActive,
        tabContents: Object.fromEntries(Object.entries(s.tabContents).filter(([k]) => k !== id)),
      };
    }),
  closeAllTabs: () =>
    set({
      openTabs: [],
      activeTabId: null,
      tabContents: {},
    }),
  setActiveTab: (id) =>
    set((s) => ({
      openTabs: s.openTabs.map((t) => ({ ...t, isActive: t.id === id })),
      activeTabId: id,
    })),
  setActiveView: (view) => set({ activeView: view }),
  toggleSidebar: () => set((s) => ({ sidebarVisible: !s.sidebarVisible })),
  toggleRightPanel: () => set((s) => ({ rightPanelVisible: !s.rightPanelVisible })),
  toggleBottomPanel: () => set((s) => ({ bottomPanelVisible: !s.bottomPanelVisible })),
  openPalette: () => set({ paletteOpen: true }),
  closePalette: () => set({ paletteOpen: false }),
  setPaletteEntries: (entries) => set({ paletteEntries: entries }),
  setSessions: (sessions) => set({ sessions }),
  setActiveSession: (id) => set({ activeSessionId: id }),
  addMessage: (sessionId, message) =>
    set((s) => ({
      sessions: s.sessions.map((sess) =>
        sess.id === sessionId
          ? { ...sess, messages: [...sess.messages, message], updatedAt: isoNow() }
          : sess,
      ),
    })),
  setTasks: (tasks) => set({ tasks }),
  setMemoryEntries: (entries) => set({ memoryEntries: entries }),
  setSkills: (skills) => set({ skills }),
  setMcpServers: (servers) => set({ mcpServers: servers }),
  setProviders: (providers) => set({ providers }),
  setProfiles: (profiles) => set({ profiles }),
  setActiveProfile: (id) => set({ activeProfileId: id }),
  setLogs: (logs) => set({ logs }),
  setSettings: (settings) => set({ settings }),
  setOllamaStatus: (status) => set({ ollamaStatus: status }),
  setOllamaModels: (models) => set({ ollamaModels: models }),
  setActiveModel: (model) => set({ activeModel: model }),
  pushActivity: (category, level, message) =>
    set((s) => ({
      activityLog: [
        ...s.activityLog.slice(-199),
        { id: crypto.randomUUID(), timestamp: isoNow(), category, level, message },
      ],
    })),
  clearActivity: () => set({ activityLog: [] }),
}));

/** Helper to create a new file tab. */
export function createFileTab(projectId: UUID, filePath: string, language: string): FileTab {
  return {
    id: uuid(crypto.randomUUID()),
    projectId,
    filePath,
    language,
    isDirty: false,
    isActive: true,
    cursorPosition: null,
    scrollTop: null,
    openedAt: isoNow(),
  };
}

/** Recursively update a node in the tree by its path. */
function updateNodeInTree(
  nodes: FileTreeNode[],
  path: string,
  updater: (node: FileTreeNode) => FileTreeNode,
): FileTreeNode[] {
  return nodes.map((node) => {
    if (node.path === path) {
      return updater(node);
    }
    if (node.children && node.path && path.startsWith(node.path)) {
      return {
        ...node,
        children: updateNodeInTree(node.children, path, updater),
      };
    }
    return node;
  });
}
