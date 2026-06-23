/**
 * Storage adapter interface — abstracts the persistence layer.
 * In the desktop app, this is backed by SQLite via Tauri commands.
 * In tests, an in-memory implementation is used.
 *
 * Each table is addressed by name, rows are JSON-serializable objects
 * with a stringified UUID primary key.
 */
export interface StorageAdapter {
  init(): Promise<void>;
  close(): Promise<void>;

  insert<T extends { id: string }>(table: string, row: T): Promise<void>;
  update<T extends { id: string }>(table: string, id: string, patch: Partial<T>): Promise<T>;
  delete(table: string, id: string): Promise<void>;
  getById<T>(table: string, id: string): Promise<T | null>;
  getAll<T>(table: string): Promise<T[]>;
  query<T>(table: string, predicate: (row: T) => boolean): Promise<T[]>;
  clear(table: string): Promise<void>;
}

/** Schema definition for a table. */
export interface TableSchema {
  name: string;
  columns: { name: string; type: 'TEXT' | 'INTEGER' | 'REAL' | 'BLOB' | 'JSON'; primaryKey?: boolean; nullable?: boolean }[];
  indexes?: { name: string; columns: string[]; unique?: boolean }[];
}

/** All table names used in the system. */
export const TABLES = {
  WORKSPACES: 'workspaces',
  PROJECTS: 'projects',
  FILE_TABS: 'file_tabs',
  AGENT_SESSIONS: 'agent_sessions',
  CHAT_MESSAGES: 'chat_messages',
  TASKS: 'tasks',
  PLAN_STEPS: 'plan_steps',
  SKILLS: 'skills',
  SKILL_RUNS: 'skill_runs',
  MCP_SERVERS: 'mcp_servers',
  MCP_TOOLS: 'mcp_tools',
  MCP_PROMPTS: 'mcp_prompts',
  MCP_RESOURCES: 'mcp_resources',
  MODEL_PROVIDERS: 'model_providers',
  MODEL_PROFILES: 'model_profiles',
  MEMORY_ENTRIES: 'memory_entries',
  USER_PREFERENCES: 'user_preferences',
  INTERACTION_EVENTS: 'interaction_events',
  LOG_ENTRIES: 'log_entries',
  TRACES: 'traces',
  TRACE_SPANS: 'trace_spans',
  TOOL_DEFINITIONS: 'tool_definitions',
  TOOL_EXECUTIONS: 'tool_executions',
  COMMAND_EXECUTIONS: 'command_executions',
  APP_SETTINGS: 'app_settings',
} as const;

export type TableName = (typeof TABLES)[keyof typeof TABLES];
