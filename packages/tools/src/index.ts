import type { ToolDefinition, ToolExecution, CommandExecution, UUID } from '@avhos/core';
import type { StorageAdapter } from '@avhos/storage';
import { TABLES } from '@avhos/storage';
import { uuid, isoNow } from '@avhos/core';

/**
 * ToolExecutor — manages tool definitions and execution records.
 * Supports approval flows, allowlists, and auditing.
 *
 * The actual tool implementations (file ops, terminal, search, etc.)
 * register themselves via ToolHandler. The executor routes invocations.
 */
export interface ToolHandler {
  readonly toolName: string;
  execute(input: Record<string, unknown>): Promise<{ output: string; error?: string }>;
}

export class ToolExecutor {
  private handlers = new Map<string, ToolHandler>();
  private definitions = new Map<string, ToolDefinition>();

  constructor(private storage: StorageAdapter) {}

  registerDefinition(def: ToolDefinition): void {
    this.definitions.set(def.name, def);
  }

  registerHandler(handler: ToolHandler): void {
    this.handlers.set(handler.toolName, handler);
  }

  getDefinition(name: string): ToolDefinition | null {
    return this.definitions.get(name) ?? null;
  }

  getAllDefinitions(): ToolDefinition[] {
    return Array.from(this.definitions.values());
  }

  /**
   * Execute a tool. If the tool requires approval, it returns a pending
   * ToolExecution that must be approved before execution proceeds.
   */
  async execute(
    toolName: string,
    input: Record<string, unknown>,
    sessionId?: UUID,
    taskId?: UUID,
  ): Promise<ToolExecution> {
    const def = this.definitions.get(toolName);
    if (!def) {
      throw new Error(`Tool not found: ${toolName}`);
    }
    if (!def.enabled) {
      throw new Error(`Tool is disabled: ${toolName}`);
    }

    const execution: ToolExecution = {
      id: uuid(crypto.randomUUID()),
      toolId: def.id,
      sessionId: sessionId ?? null,
      taskId: taskId ?? null,
      status: def.requiresApproval ? 'pending' : 'running',
      input,
      output: null,
      errorMessage: null,
      durationMs: null,
      approvedBy: null,
      createdAt: isoNow(),
      completedAt: null,
    };

    await this.storage.insert(TABLES.TOOL_EXECUTIONS, execution);

    if (def.requiresApproval) {
      return execution; // Wait for approval
    }

    return this.runExecution(execution, toolName);
  }

  /** Approve and run a pending execution. */
  async approve(executionId: UUID, approvedBy: 'user' | 'auto'): Promise<ToolExecution> {
    const exec = await this.storage.getById<ToolExecution>(TABLES.TOOL_EXECUTIONS, executionId);
    if (!exec) throw new Error(`Execution not found: ${executionId}`);
    if (exec.status !== 'pending') throw new Error(`Execution is not pending: ${exec.status}`);

    const def = this.definitions.get(exec.toolId);
    if (!def) throw new Error(`Tool definition not found: ${exec.toolId}`);

    const updated = await this.storage.update<ToolExecution>(TABLES.TOOL_EXECUTIONS, executionId, {
      status: 'running',
      approvedBy,
    });

    return this.runExecution(updated, def.name);
  }

  private async runExecution(exec: ToolExecution, toolName: string): Promise<ToolExecution> {
    const handler = this.handlers.get(toolName);
    if (!handler) {
      return this.storage.update<ToolExecution>(TABLES.TOOL_EXECUTIONS, exec.id, {
        status: 'failed',
        errorMessage: `No handler registered for tool: ${toolName}`,
        completedAt: isoNow(),
      });
    }

    const startTime = Date.now();
    try {
      const result = await handler.execute(exec.input);
      const durationMs = Date.now() - startTime;
      return this.storage.update<ToolExecution>(TABLES.TOOL_EXECUTIONS, exec.id, {
        status: result.error ? 'failed' : 'completed',
        output: result.output,
        errorMessage: result.error ?? null,
        durationMs,
        completedAt: isoNow(),
      });
    } catch (err) {
      const durationMs = Date.now() - startTime;
      return this.storage.update<ToolExecution>(TABLES.TOOL_EXECUTIONS, exec.id, {
        status: 'failed',
        errorMessage: err instanceof Error ? err.message : String(err),
        durationMs,
        completedAt: isoNow(),
      });
    }
  }

  async getExecutions(sessionId?: UUID): Promise<ToolExecution[]> {
    if (sessionId) {
      return this.storage.query<ToolExecution>(TABLES.TOOL_EXECUTIONS, (e) => e.sessionId === sessionId);
    }
    return this.storage.getAll<ToolExecution>(TABLES.TOOL_EXECUTIONS);
  }
}

/**
 * CommandRunner — abstraction for terminal command execution.
 * Records every command for auditing. Supports allowlists and sandbox rules.
 *
 * PLACEHOLDER: Actual command execution goes through Tauri's shell plugin.
 */
export class CommandRunner {
  constructor(private storage: StorageAdapter) {}

  async run(command: string, cwd: string): Promise<CommandExecution> {
    const exec: CommandExecution = {
      id: uuid(crypto.randomUUID()),
      command,
      cwd,
      exitCode: null,
      stdout: '',
      stderr: '',
      durationMs: null,
      createdAt: isoNow(),
      completedAt: null,
    };
    await this.storage.insert(TABLES.COMMAND_EXECUTIONS, exec);

    // PLACEHOLDER: Use Tauri Shell plugin to execute commands
    // const result = await invoke('run_command', { command, cwd });
    const completed = await this.storage.update<CommandExecution>(TABLES.COMMAND_EXECUTIONS, exec.id, {
      exitCode: 0,
      stdout: '[Placeholder] Comando no ejecutado — integra el plugin de shell de Tauri.',
      stderr: '',
      durationMs: 0,
      completedAt: isoNow(),
    });

    return completed;
  }

  async getHistory(limit = 50): Promise<CommandExecution[]> {
    const all = await this.storage.getAll<CommandExecution>(TABLES.COMMAND_EXECUTIONS);
    return all.slice(-limit).reverse();
  }
}
