import { InMemoryStorageAdapter } from '@avhos/storage';
import { createDefaultProviderRegistry } from '@avhos/models';
import { SkillRegistry, InMemorySkillLoader } from '@avhos/skills';
import { createDefaultMCPHost } from '@avhos/mcp';
import { MemoryStore } from '@avhos/memory';
import { Logger, Tracer, EventLog } from '@avhos/observability';
import { ToolExecutor, CommandRunner } from '@avhos/tools';
import { Orchestrator, Planner } from '@avhos/orchestrator';
import type { EventBus } from '@avhos/core';

/**
 * Simple in-process event bus implementation.
 */
class InMemoryEventBus implements EventBus {
  private handlers = new Map<string, Set<(payload: unknown) => void>>();

  emit<T>(event: string, payload: T): void {
    const handlers = this.handlers.get(event);
    if (handlers) {
      handlers.forEach((h) => h(payload));
    }
  }

  on<T>(event: string, handler: (payload: T) => void): () => void {
    let set = this.handlers.get(event);
    if (!set) {
      set = new Set();
      this.handlers.set(event, set);
    }
    set.add(handler as (payload: unknown) => void);
    return () => set!.delete(handler as (payload: unknown) => void);
  }

  off(_event: string, _handler: (...args: unknown[]) => void): void {
    // Handled by the unsubscribe function returned by on()
  }

  clear(): void {
    this.handlers.clear();
  }
}

/**
 * ServiceContainer — the composition root for all services.
 * This is where all subsystems are wired together.
 * Components access services through this container, not directly.
 */
export interface ServiceContainer {
  storage: InMemoryStorageAdapter;
  eventBus: EventBus;
  logger: Logger;
  tracer: Tracer;
  eventLog: EventLog;
  memoryStore: MemoryStore;
  toolExecutor: ToolExecutor;
  commandRunner: CommandRunner;
  skillRegistry: SkillRegistry;
  mcpHost: ReturnType<typeof createDefaultMCPHost>;
  providerRegistry: ReturnType<typeof createDefaultProviderRegistry>;
  orchestrator: Orchestrator;
  planner: Planner;
}

let _container: ServiceContainer | null = null;

export async function initServices(): Promise<ServiceContainer> {
  if (_container) return _container;

  const storage = new InMemoryStorageAdapter();
  await storage.init();

  const eventBus = new InMemoryEventBus();
  const logger = new Logger(storage, eventBus);
  const tracer = new Tracer(storage);
  const eventLog = new EventLog(storage, eventBus);
  const memoryStore = new MemoryStore(storage);
  const toolExecutor = new ToolExecutor(storage);
  const commandRunner = new CommandRunner(storage);
  const skillRegistry = new SkillRegistry();
  const mcpHost = createDefaultMCPHost();
  const providerRegistry = createDefaultProviderRegistry();
  const orchestrator = new Orchestrator(logger, eventLog, memoryStore, toolExecutor, skillRegistry);
  const planner = new Planner(logger);

  _container = {
    storage,
    eventBus,
    logger,
    tracer,
    eventLog,
    memoryStore,
    toolExecutor,
    commandRunner,
    skillRegistry,
    mcpHost,
    providerRegistry,
    orchestrator,
    planner,
  };

  return _container;
}

export function getServices(): ServiceContainer {
  if (!_container) {
    throw new Error('Services not initialized. Call initServices() first.');
  }
  return _container;
}
