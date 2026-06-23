import type { StorageAdapter } from './adapter.js';
import { InMemoryStorageAdapter } from './in-memory.js';

/**
 * Tauri SQLite storage adapter — delegates to Rust backend via Tauri invoke.
 * This is the production adapter; it calls into the Rust side which uses
 * the `rusqlite` crate for actual SQLite operations.
 *
 * PLACEHOLDER: The Tauri command handlers are not yet implemented in Rust.
 * When ready, uncomment and wire up the invoke calls.
 */
export class TauriSqliteAdapter implements StorageAdapter {
  // private invoke: <T>(cmd: string, args?: Record<string, unknown>) => Promise<T>;

  constructor(
    // invoke: <T>(cmd: string, args?: Record<string, unknown>) => Promise<T>
  ) {
    // this.invoke = invoke;
    throw new Error(
      'TauriSqliteAdapter is not yet implemented. Use InMemoryStorageAdapter for now. ' +
        'The Rust backend with rusqlite needs to be built first.',
    );
  }

  async init(): Promise<void> {
    // await this.invoke('storage_init');
  }
  async close(): Promise<void> {
    // await this.invoke('storage_close');
  }
  async insert<T extends { id: string }>(_table: string, _row: T): Promise<void> {
    // await this.invoke('storage_insert', { table, row });
  }
  async update<T extends { id: string }>(_table: string, _id: string, _patch: Partial<T>): Promise<T> {
    // return await this.invoke('storage_update', { table, id, patch });
    throw new Error('Not implemented');
  }
  async delete(_table: string, _id: string): Promise<void> {
    // await this.invoke('storage_delete', { table, id });
  }
  async getById<T>(_table: string, _id: string): Promise<T | null> {
    // return await this.invoke('storage_get', { table, id });
    throw new Error('Not implemented');
  }
  async getAll<T>(_table: string): Promise<T[]> {
    // return await this.invoke('storage_get_all', { table });
    throw new Error('Not implemented');
  }
  async query<T>(_table: string, _predicate: (row: T) => boolean): Promise<T[]> {
    // Predicates can't cross the Tauri boundary; use a query DSL instead.
    throw new Error('Not implemented — use a query DSL for Tauri adapter');
  }
  async clear(_table: string): Promise<void> {
    // await this.invoke('storage_clear', { table });
  }
}

/** Factory: returns the appropriate adapter for the current environment. */
export function createStorage(): StorageAdapter {
  // In the future: detect Tauri environment and return TauriSqliteAdapter
  // For now, always return in-memory
  return new InMemoryStorageAdapter();
}
