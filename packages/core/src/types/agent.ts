import { UUID, ISODateString } from './branded.js';

export type AgentSessionStatus =
  | 'idle'
  | 'planning'
  | 'executing'
  | 'waiting_approval'
  | 'completed'
  | 'error'
  | 'cancelled';

export type MessageRole = 'system' | 'user' | 'assistant' | 'tool' | 'error';

export interface ChatMessage {
  id: UUID;
  sessionId: UUID;
  role: MessageRole;
  content: string;
  modelProfileId: UUID | null;
  toolCallId: UUID | null;
  metadata: Record<string, unknown>;
  createdAt: ISODateString;
}

/** An agent session represents a conversation + execution context. */
export interface AgentSession {
  id: UUID;
  workspaceId: UUID;
  title: string;
  status: AgentSessionStatus;
  modelProfileId: UUID | null;
  systemPrompt: string | null;
  messages: ChatMessage[];
  activeTaskId: UUID | null;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}
