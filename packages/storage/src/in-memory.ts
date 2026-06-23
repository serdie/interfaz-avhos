import type { StorageAdapter } from './adapter.js';

/**
 * In-memory storage adapter for tests and development.
 * Mirrors the StorageAdapter interface so production code can swap
 * to the SQLite-backed Tauri adapter without changes.
 */
export class InMemoryStorageAdapter implements StorageAdapter {
  private tables = new Map<string, Map<string, { id: string } & Record<string, unknown>>>();

  async init(): Promise<void> {
    // No-op for in-memory
  }

  async close(): Promise<void> {
    this.tables.clear();
  }

  private getTable(name: string): Map<string, { id: string } & Record<string, unknown>> {
    let table = this.tables.get(name);
    if (!table) {
      table = new Map();
      this.tables.set(name, table);
    }
    return table;
  }

  async insert<T extends { id: string }>(table: string, row: T): Promise<void> {
    const t = this.getTable(table);
    t.set(row.id, { ...row });
  }

  async update<T extends { id: string }>(table: string, id: string, patch: Partial<T>): Promise<T> {
    const t = this.getTable(table);
    const existing = t.get(id);
    if (!existing) {
      throw new Error(`Row not found: ${table}/${id}`);
    }
    const updated = { ...existing, ...patch, id } as T;
    t.set(id, updated);
    return updated;
  }

  async delete(table: string, id: string): Promise<void> {
    const t = this.getTable(table);
    t.delete(id);
  }

  async getById<T>(table: string, id: string): Promise<T | null> {
    const t = this.getTable(table);
    const row = t.get(id);
    return (row as T) ?? null;
  }

  async getAll<T>(table: string): Promise<T[]> {
    const t = this.getTable(table);
    return Array.from(t.values()) as T[];
  }

  async query<T>(table: string, predicate: (row: T) => boolean): Promise<T[]> {
    const t = this.getTable(table);
    return Array.from(t.values()).filter((row) => predicate(row as T)) as T[];
  }

  async clear(table: string): Promise<void> {
    const t = this.getTable(table);
    t.clear();
  }
}
