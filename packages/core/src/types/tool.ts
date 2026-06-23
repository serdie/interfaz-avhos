import { UUID, ISODateString } from './branded.js';

export type ToolExecutionStatus = 'pending' | 'approved' | 'running' | 'completed' | 'failed' | 'denied';

export type ToolCategory =
  | 'file'
  | 'terminal'
  | 'search'
  | 'web'
  | 'mcp'
  | 'system'
  | 'custom';

/** Describes a tool the agent can invoke. */
export interface ToolDefinition {
  id: UUID;
  name: string;
  category: ToolCategory;
  description: string;
  inputSchema: Record<string, unknown>;
  requiresApproval: boolean;
  allowlisted: boolean;
  enabled: boolean;
}

/** Records a single execution of a tool. */
export interface ToolExecution {
  id: UUID;
  toolId: UUID;
  sessionId: UUID | null;
  taskId: UUID | null;
  status: ToolExecutionStatus;
  input: Record<string, unknown>;
  output: string | null;
  errorMessage: string | null;
  durationMs: number | null;
  approvedBy: 'user' | 'auto' | null;
  createdAt: ISODateString;
  completedAt: ISODateString | null;
}

/** Command execution abstraction for terminal workflows. */
export interface CommandExecution {
  id: UUID;
  command: string;
  cwd: string;
  exitCode: number | null;
  stdout: string;
  stderr: string;
  durationMs: number | null;
  createdAt: ISODateString;
  completedAt: ISODateString | null;
}
