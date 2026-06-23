import type { ReadDirResult } from '../types/file-tree.js';

/**
 * Filesystem adapter — abstracts filesystem access so the UI never
 * touches disk directly. Implementations:
 * - ViteDevFsAdapter: reads real disk via Vite dev server middleware (browser dev)
 * - TauriFsAdapter: reads real disk via Tauri fs plugin (desktop production)
 *
 * Both implement the same interface, so the workspace service and UI
 * never need to know which runtime they're in.
 */
export interface FilesystemAdapter {
  /** Read the entries of a directory at the given absolute path. */
  readDir(absolutePath: string): Promise<ReadDirResult>;

  /** Check whether a path exists and whether it is a directory. */
  stat(absolutePath: string): Promise<{ exists: boolean; isDirectory: boolean }>;

  /** Read the contents of a file as UTF-8 text. */
  readFile(absolutePath: string): Promise<{ content: string; error: string | null }>;

  /** Write UTF-8 text content to a file, creating it if it does not exist. */
  writeFile(absolutePath: string, content: string): Promise<{ error: string | null }>;

  /** Get the root path of the workspace. */
  getRootPath(): Promise<string>;
}
