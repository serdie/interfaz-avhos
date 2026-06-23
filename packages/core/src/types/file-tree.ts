import { UUID } from './branded.js';

/** Type of a file tree node. */
export type FileNodeType = 'file' | 'directory';

/** A node in the file tree. Directories may have children loaded lazily. */
export interface FileTreeNode {
  id: UUID;
  name: string;
  /** Full path relative to workspace root. */
  path: string;
  /** Absolute path on disk. */
  absolutePath: string;
  type: FileNodeType;
  /** Children — only populated for directories that have been expanded. */
  children: FileTreeNode[] | null;
  /** Whether this directory's children have been loaded. */
  loaded: boolean;
  /** Whether this directory is currently expanded in the UI. */
  expanded: boolean;
  /** File extension (e.g. 'ts', 'json') for files, null for directories. */
  extension: string | null;
  /** Error message if loading this directory failed. */
  error: string | null;
}

/** A flat directory entry returned by the filesystem adapter. */
export interface DirEntry {
  name: string;
  path: string;
  isDirectory: boolean;
}

/** Result of reading a directory. */
export interface ReadDirResult {
  entries: DirEntry[];
  error: string | null;
}
