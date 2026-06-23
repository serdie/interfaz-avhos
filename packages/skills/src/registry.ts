import type { Skill, SkillParameter, UUID } from '@avhos/core';
import { uuid, isoNow } from '@avhos/core';

/**
 * Skill definition file format — what a .skill.json or .skill.yaml looks like.
 * Skills are loaded from the filesystem and validated against this schema.
 */
export interface SkillDefinitionFile {
  name: string;
  version: string;
  description: string;
  category: string;
  parameters: SkillParameter[];
  promptTemplate: string;
  enabled?: boolean;
}

/** Validates a skill definition file. Returns errors if invalid. */
export function validateSkillDefinition(def: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (typeof def !== 'object' || def === null) {
    return { valid: false, errors: ['Definition must be an object'] };
  }

  const d = def as Record<string, unknown>;

  if (typeof d.name !== 'string' || d.name.trim().length === 0) {
    errors.push('name must be a non-empty string');
  }
  if (typeof d.version !== 'string') {
    errors.push('version must be a string');
  }
  if (typeof d.description !== 'string') {
    errors.push('description must be a string');
  }
  if (typeof d.category !== 'string') {
    errors.push('category must be a string');
  }
  if (typeof d.promptTemplate !== 'string' || d.promptTemplate.trim().length === 0) {
    errors.push('promptTemplate must be a non-empty string');
  }
  if (!Array.isArray(d.parameters)) {
    errors.push('parameters must be an array');
  }

  return { valid: errors.length === 0, errors };
}

/** Converts a skill definition file into a Skill domain entity. */
export function skillFromDefinition(
  def: SkillDefinitionFile,
  sourcePath: string | null,
): Skill {
  return {
    id: uuid(crypto.randomUUID()),
    name: def.name,
    version: def.version,
    description: def.description,
    category: def.category as Skill['category'],
    parameters: def.parameters,
    promptTemplate: def.promptTemplate,
    sourcePath,
    enabled: def.enabled ?? true,
    createdAt: isoNow(),
    updatedAt: isoNow(),
  };
}

/**
 * Skill registry — holds all loaded skills, indexed by id and name.
 * The registry is the single source of truth for available skills.
 */
export class SkillRegistry {
  private byId = new Map<string, Skill>();
  private byName = new Map<string, Skill>();

  register(skill: Skill): void {
    this.byId.set(skill.id, skill);
    this.byName.set(skill.name, skill);
  }

  unregister(id: string): void {
    const skill = this.byId.get(id);
    if (skill) {
      this.byName.delete(skill.name);
      this.byId.delete(id);
    }
  }

  getById(id: UUID): Skill | null {
    return this.byId.get(id) ?? null;
  }

  getByName(name: string): Skill | null {
    return this.byName.get(name) ?? null;
  }

  getAll(): Skill[] {
    return Array.from(this.byId.values());
  }

  getEnabled(): Skill[] {
    return this.getAll().filter((s) => s.enabled);
  }

  getByCategory(category: Skill['category']): Skill[] {
    return this.getAll().filter((s) => s.category === category);
  }

  clear(): void {
    this.byId.clear();
    this.byName.clear();
  }
}

/**
 * Skill loader interface — abstracts how skills are loaded.
 * Implementations: FileSystemSkillLoader (Tauri), InMemorySkillLoader (tests/seed).
 */
export interface SkillLoader {
  loadAll(): Promise<Skill[]>;
}

/** In-memory skill loader for seeding and testing. */
export class InMemorySkillLoader implements SkillLoader {
  constructor(private skills: Skill[]) {}

  async loadAll(): Promise<Skill[]> {
    return [...this.skills];
  }
}
