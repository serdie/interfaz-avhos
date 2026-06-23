import { UUID, ISODateString } from './branded.js';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export type EventCategory =
  | 'agent'
  | 'tool'
  | 'model'
  | 'mcp'
  | 'skill'
  | 'memory'
  | 'storage'
  | 'ui'
  | 'system';

/** A structured log entry in the event log. */
export interface LogEntry {
  id: UUID;
  level: LogLevel;
  category: EventCategory;
  message: string;
  data: Record<string, unknown> | null;
  traceId: UUID | null;
  createdAt: ISODateString;
}

/** A trace groups related events into a causal chain. */
export interface Trace {
  id: UUID;
  name: string;
  rootSpanId: UUID | null;
  status: 'running' | 'completed' | 'error';
  startTime: ISODateString;
  endTime: ISODateString | null;
  durationMs: number | null;
}

/** A span within a trace. */
export interface TraceSpan {
  id: UUID;
  traceId: UUID;
  parentSpanId: UUID | null;
  name: string;
  startTime: ISODateString;
  endTime: ISODateString | null;
  durationMs: number | null;
  attributes: Record<string, unknown>;
}

/** Records every interaction event for audit and future learning. */
export type InteractionEventType =
  | 'user_message'
  | 'agent_response'
  | 'tool_call'
  | 'tool_result'
  | 'model_request'
  | 'model_response'
  | 'skill_invoked'
  | 'memory_written'
  | 'memory_retrieved'
  | 'task_created'
  | 'task_updated'
  | 'plan_step_executed'
  | 'correction_recorded';

export interface InteractionEvent {
  id: UUID;
  sessionId: UUID | null;
  type: InteractionEventType;
  payload: Record<string, unknown>;
  traceId: UUID | null;
  createdAt: ISODateString;
}
