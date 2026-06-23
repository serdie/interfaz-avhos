import type { FilesystemAdapter, ReadDirResult } from '@avhos/core';

/**
 * Browser-side filesystem adapter for dev mode.
 * Talks to the Vite dev server middleware at /__fs__/* which reads
 * the REAL filesystem via Node.js. This is not a mock — it provides
 * genuine directory listings and file contents from disk.
 *
 * In production (Tauri), this is replaced by TauriFsAdapter which
 * uses the Tauri fs plugin directly.
 */
export class ViteDevFsAdapter implements FilesystemAdapter {
  private rootPath: string | null = null;

  async readDir(absolutePath: string): Promise<ReadDirResult> {
    try {
      const relPath = await this.toRelative(absolutePath);
      const res = await fetch(`/__fs__/readdir?path=${encodeURIComponent(relPath)}`);
      const data = await res.json();
      return {
        entries: data.entries ?? [],
        error: data.error ?? null,
      };
    } catch (err) {
      return {
        entries: [],
        error: err instanceof Error ? err.message : 'Network error',
      };
    }
  }

  async stat(absolutePath: string): Promise<{ exists: boolean; isDirectory: boolean }> {
    try {
      const relPath = await this.toRelative(absolutePath);
      const res = await fetch(`/__fs__/stat?path=${encodeURIComponent(relPath)}`);
      const data = await res.json();
      return {
        exists: data.exists ?? false,
        isDirectory: data.isDirectory ?? false,
      };
    } catch {
      return { exists: false, isDirectory: false };
    }
  }

  async readFile(absolutePath: string): Promise<{ content: string; error: string | null }> {
    try {
      const relPath = await this.toRelative(absolutePath);
      const res = await fetch(`/__fs__/readfile?path=${encodeURIComponent(relPath)}`);
      const data = await res.json();
      return {
        content: data.content ?? '',
        error: data.error ?? null,
      };
    } catch (err) {
      return {
        content: '',
        error: err instanceof Error ? err.message : 'Error de red',
      };
    }
  }

  async writeFile(absolutePath: string, content: string): Promise<{ error: string | null }> {
    try {
      const relPath = await this.toRelative(absolutePath);
      const res = await fetch('/__fs__/writefile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: relPath, content }),
      });
      const data = await res.json();
      return { error: data.error ?? null };
    } catch (err) {
      return {
        error: err instanceof Error ? err.message : 'Error de red al guardar',
      };
    }
  }

  async getRootPath(): Promise<string> {
    if (this.rootPath) return this.rootPath;
    try {
      const res = await fetch('/__fs__/root');
      const data = await res.json();
      this.rootPath = data.root as string;
      return this.rootPath;
    } catch {
      throw new Error('Could not determine project root from dev server');
    }
  }

  private async toRelative(absolutePath: string): Promise<string> {
    const root = await this.getRootPath();
    if (absolutePath.startsWith(root)) {
      return absolutePath.slice(root.length).replace(/\\/g, '/').replace(/^\//, '');
    }
    return absolutePath.replace(/\\/g, '/').replace(/^\//, '');
  }
}
