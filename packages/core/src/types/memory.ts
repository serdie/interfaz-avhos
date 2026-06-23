import { UUID, ISODateString } from './branded.js';

export type MemoryEntryType =
  | 'preference'
  | 'project_fact'
  | 'decision'
  | 'summary'
  | 'correction'
  | 'verified_outcome'
  | 'pattern'
  | 'note';

export type MemoryImportance = 'low' | 'medium' | 'high' | 'critical';

/** A single piece of structured memory the system can retrieve and use. */
export interface MemoryEntry {
  id: UUID;
  workspaceId: UUID;
  type: MemoryEntryType;
  title: string;
  content: string;
  tags: string[];
  importance: MemoryImportance;
  source: 'user' | 'agent' | 'system';
  embedding: number[] | null;
  metadata: Record<string, unknown>;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

/** A retrieval query against the memory store. */
export interface MemoryQuery {
  workspaceId: UUID;
  text: string;
  types?: MemoryEntryType[];
  tags?: string[];
  limit?: number;
  minImportance?: MemoryImportance;
}

/** A retrieval result with relevance scoring. */
export interface MemoryResult {
  entry: MemoryEntry;
  score: number;
}

/** User-level preference, separate from project memory. */
export interface UserPreference {
  id: UUID;
  key: string;
  value: unknown;
  category: string;
  description: string;
  updatedAt: ISODateString;
}
