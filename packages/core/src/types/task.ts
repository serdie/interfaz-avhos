import { UUID, ISODateString } from './branded.js';

export type TaskStatus =
  | 'pending'
  | 'in_progress'
  | 'blocked'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

/** A task belongs to an agent session and may have ordered plan steps. */
export interface Task {
  id: UUID;
  sessionId: UUID;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  order: number;
  parentTaskId: UUID | null;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  completedAt: ISODateString | null;
}

/** A plan step is a granular action within a task. */
export type PlanStepType =
  | 'analysis'
  | 'code_change'
  | 'tool_invocation'
  | 'verification'
  | 'review'
  | 'custom';

export type PlanStepStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped';

export interface PlanStep {
  id: UUID;
  taskId: UUID;
  type: PlanStepType;
  title: string;
  description: string;
  status: PlanStepStatus;
  order: number;
  toolExecutionId: UUID | null;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}
