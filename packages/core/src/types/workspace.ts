import { UUID, ISODateString } from './branded.js';

/** A workspace is the top-level container for a set of projects. */
export interface Workspace {
  id: UUID;
  name: string;
  rootPath: string;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  settings: WorkspaceSettings;
}

export interface WorkspaceSettings {
  defaultModelProfileId: UUID | null;
  autoSave: boolean;
  terminalShell: string;
  excludedGlobs: string[];
}

/** A project lives inside a workspace and maps to a directory. */
export interface Project {
  id: UUID;
  workspaceId: UUID;
  name: string;
  path: string;
  language: string | null;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

/** Represents an open file tab in the editor area. */
export interface FileTab {
  id: UUID;
  projectId: UUID;
  filePath: string;
  language: string;
  isDirty: boolean;
  isActive: boolean;
  cursorPosition: { line: number; column: number } | null;
  scrollTop: number | null;
  openedAt: ISODateString;
}
