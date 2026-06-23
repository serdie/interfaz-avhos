import { UUID, ISODateString } from './branded.js';

export type SkillCategory =
  | 'code_generation'
  | 'refactoring'
  | 'testing'
  | 'analysis'
  | 'documentation'
  | 'deployment'
  | 'custom';

export type SkillParameterType = 'string' | 'number' | 'boolean' | 'file' | 'select';

export interface SkillParameter {
  name: string;
  type: SkillParameterType;
  description: string;
  required: boolean;
  defaultValue: string | null;
  options: string[] | null;
}

/** A skill is a reusable, declarative capability the agent can invoke. */
export interface Skill {
  id: UUID;
  name: string;
  version: string;
  description: string;
  category: SkillCategory;
  parameters: SkillParameter[];
  promptTemplate: string;
  sourcePath: string | null;
  enabled: boolean;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

/** Records a single execution of a skill. */
export type SkillRunStatus = 'running' | 'completed' | 'failed' | 'cancelled';

export interface SkillRun {
  id: UUID;
  skillId: UUID;
  sessionId: UUID;
  status: SkillRunStatus;
  input: Record<string, unknown>;
  output: string | null;
  errorMessage: string | null;
  durationMs: number | null;
  createdAt: ISODateString;
  completedAt: ISODateString | null;
}
