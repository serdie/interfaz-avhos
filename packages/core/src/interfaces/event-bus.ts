import { UUID } from '../types/branded.js';

/**
 * Event bus interface for internal coordination between modules.
 * Implementations can be in-process or bridge to Tauri events.
 */
export interface EventBus {
  emit<T>(event: string, payload: T): void;
  on<T>(event: string, handler: (payload: T) => void): () => void;
  off(event: string, handler: (...args: unknown[]) => void): void;
  clear(): void;
}

/** Standard result type for operations that can fail. */
export type Result<T, E = string> =
  | { ok: true; value: T }
  | { ok: false; error: E };

export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

export function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}

/** Paginated result wrapper. */
export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/** Generic repository interface for CRUD operations. */
export interface Repository<T, ID = UUID> {
  getById(id: ID): Promise<T | null>;
  getAll(): Promise<T[]>;
  create(entity: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>;
  update(id: ID, patch: Partial<T>): Promise<T>;
  delete(id: ID): Promise<void>;
}
