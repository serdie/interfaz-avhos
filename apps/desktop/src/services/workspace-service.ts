import type { FilesystemAdapter, FileTreeNode } from '@avhos/core';
import { uuid } from '@avhos/core';

/**
 * Default globs excluded from the file tree.
 * These are standard directories that should never appear in the explorer.
 */
const DEFAULT_EXCLUDED = new Set([
  'node_modules',
  'dist',
  '.git',
  'target',
  '.turbo',
  '.cache',
  'pnpm-lock.yaml',
]);

/**
 * WorkspaceService — domain service that manages the file tree.
 * Uses a FilesystemAdapter to read disk and builds typed FileTreeNode trees.
 * The UI layer calls this service; it never touches the adapter directly.
 */
export class WorkspaceService {
  constructor(
    private fs: FilesystemAdapter,
    private excluded: Set<string> = DEFAULT_EXCLUDED,
  ) {}

  /** Discover the workspace root path. */
  async getRootPath(): Promise<string> {
    return this.fs.getRootPath();
  }

  /** Load the root directory and return top-level nodes. */
  async loadRoot(rootPath: string): Promise<FileTreeNode[]> {
    return this.loadDirectory(rootPath, rootPath);
  }

  /** Load children of a directory node. Returns typed nodes. */
  async loadDirectory(absolutePath: string, rootPath: string): Promise<FileTreeNode[]> {
    const result = await this.fs.readDir(absolutePath);

    if (result.error) {
      throw new Error(`Cannot read directory: ${result.error}`);
    }

    return result.entries
      .filter((entry) => !this.excluded.has(entry.name))
      .map((entry) => this.createNode(entry, rootPath));
  }

  /** Read the real contents of a file from disk via the adapter. */
  async loadFileContent(absolutePath: string): Promise<{ content: string; error: string | null }> {
    return this.fs.readFile(absolutePath);
  }

  /** Recursively scan the project and return a flat list of file paths (relative to root). */
  async loadFileInventory(rootPath: string, maxDepth = 10): Promise<string[]> {
    const results: string[] = [];
    await this.scanDir(rootPath, rootPath, 0, maxDepth, results);
    return results;
  }

  private async scanDir(
    absolutePath: string,
    rootPath: string,
    depth: number,
    maxDepth: number,
    results: string[],
  ): Promise<void> {
    if (depth >= maxDepth) return;
    const result = await this.fs.readDir(absolutePath);
    if (result.error) return;

    for (const entry of result.entries) {
      if (this.excluded.has(entry.name)) continue;

      if (entry.isDirectory) {
        const childAbs = this.joinPath(rootPath, entry.path);
        await this.scanDir(childAbs, rootPath, depth + 1, maxDepth, results);
      } else {
        results.push(entry.path);
      }
    }
  }

  /** Write real content to a file on disk via the adapter. */
  async saveFileContent(absolutePath: string, content: string): Promise<{ error: string | null }> {
    return this.fs.writeFile(absolutePath, content);
  }

  /** Create a FileTreeNode from a DirEntry. */
  private createNode(
    entry: { name: string; path: string; isDirectory: boolean },
    rootPath: string,
  ): FileTreeNode {
    const absolutePath = this.joinPath(rootPath, entry.path);
    const ext = entry.isDirectory ? null : this.getExtension(entry.name);

    return {
      id: uuid(crypto.randomUUID()),
      name: entry.name,
      path: entry.path,
      absolutePath,
      type: entry.isDirectory ? 'directory' : 'file',
      children: null,
      loaded: false,
      expanded: false,
      extension: ext,
      error: null,
    };
  }

  private joinPath(root: string, rel: string): string {
    const separator = root.includes('\\') ? '\\' : '/';
    const cleanRel = rel.replace(/\//g, separator).replace(/\\/g, separator);
    return `${root}${separator}${cleanRel}`;
  }

  private getExtension(filename: string): string | null {
    const idx = filename.lastIndexOf('.');
    if (idx <= 0) return null;
    return filename.slice(idx + 1).toLowerCase();
  }
}
