import type { MemoryEntry, MemoryQuery, MemoryResult, UUID } from '@avhos/core';
import type { StorageAdapter } from '@avhos/storage';
import { TABLES } from '@avhos/storage';
import { uuid, isoNow } from '@avhos/core';

/**
 * MemoryStore — manages structured memory entries in persistent storage.
 * Supports CRUD, tagging, importance filtering, and retrieval.
 *
 * The retrieval abstraction is designed so a vector store can be plugged in
 * later by implementing RetrievalProvider. For now, retrieval is keyword-based.
 */
export class MemoryStore {
  constructor(private storage: StorageAdapter) {}

  async init(): Promise<void> {
    // Tables are created by the storage adapter's init
  }

  async add(entry: Omit<MemoryEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<MemoryEntry> {
    const full: MemoryEntry = {
      ...entry,
      id: uuid(crypto.randomUUID()),
      createdAt: isoNow(),
      updatedAt: isoNow(),
    };
    await this.storage.insert(TABLES.MEMORY_ENTRIES, full);
    return full;
  }

  async getById(id: UUID): Promise<MemoryEntry | null> {
    return this.storage.getById<MemoryEntry>(TABLES.MEMORY_ENTRIES, id);
  }

  async getAll(workspaceId: UUID): Promise<MemoryEntry[]> {
    return this.storage.query<MemoryEntry>(TABLES.MEMORY_ENTRIES, (e) => e.workspaceId === workspaceId);
  }

  async update(id: UUID, patch: Partial<MemoryEntry>): Promise<MemoryEntry> {
    return this.storage.update<MemoryEntry>(TABLES.MEMORY_ENTRIES, id, {
      ...patch,
      updatedAt: isoNow(),
    });
  }

  async delete(id: UUID): Promise<void> {
    await this.storage.delete(TABLES.MEMORY_ENTRIES, id);
  }

  async search(query: MemoryQuery): Promise<MemoryResult[]> {
    const all = await this.storage.query<MemoryEntry>(TABLES.MEMORY_ENTRIES, (e) => {
      if (e.workspaceId !== query.workspaceId) return false;
      if (query.types && !query.types.includes(e.type)) return false;
      if (query.tags && !query.tags.some((t) => e.tags.includes(t))) return false;
      if (query.minImportance) {
        const order = ['low', 'medium', 'high', 'critical'];
        if (order.indexOf(e.importance) < order.indexOf(query.minImportance)) return false;
      }
      return true;
    });

    // Keyword-based scoring (placeholder for vector similarity)
    const lowerText = query.text.toLowerCase();
    const scored = all.map((entry) => {
      const titleMatch = entry.title.toLowerCase().includes(lowerText) ? 0.5 : 0;
      const contentMatch = entry.content.toLowerCase().includes(lowerText) ? 0.3 : 0;
      const tagMatch = entry.tags.some((t) => t.toLowerCase().includes(lowerText)) ? 0.2 : 0;
      const score = titleMatch + contentMatch + tagMatch;
      return { entry, score };
    });

    return scored
      .filter((r) => r.score > 0 || !query.text)
      .sort((a, b) => b.score - a.score)
      .slice(0, query.limit ?? 20)
      .map((r) => ({ entry: r.entry, score: r.score }));
  }
}

/**
 * RetrievalProvider — abstraction for vector-based retrieval.
 * Future implementations: local embeddings + SQLite-vec, or external vector DB.
 * SCAFFOLDED: Not yet implemented.
 */
export interface RetrievalProvider {
  index(entry: MemoryEntry): Promise<void>;
  query(text: string, limit: number): Promise<MemoryResult[]>;
  clear(): Promise<void>;
}
