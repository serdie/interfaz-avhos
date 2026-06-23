import type {
  AgentSession,
  ChatMessage,
  Task,
  PlanStep,
  UUID,
} from '@avhos/core';
import { uuid, isoNow } from '@avhos/core';
import type { ModelProviderClient } from '@avhos/models';
import type { MemoryStore } from '@avhos/memory';
import type { ToolExecutor } from '@avhos/tools';
import type { SkillRegistry } from '@avhos/skills';
import type { Logger, EventLog } from '@avhos/observability';

/**
 * Orchestrator — the main agent runtime.
 * Coordinates model calls, tool execution, skill invocation, memory,
 * and task planning. This is the brain of the agent system.
 *
 * Architecture supports:
 * - planner/executor separation
 * - specialized subagents (future)
 * - result evaluation hooks
 * - self-review and replay workflows (future)
 *
 * CURRENT: Basic single-turn orchestration. Multi-step planning is scaffolded.
 */
export class Orchestrator {
  constructor(
    private logger: Logger,
    private eventLog: EventLog,
    private memory: MemoryStore,
    private tools: ToolExecutor,
    private skills: SkillRegistry,
  ) {
    // tools and skills are wired for future multi-step orchestration
    void this.tools;
    void this.skills;
  }

  /**
   * Process a user message: retrieve relevant memory, call the model,
   * log the interaction, and return the assistant response.
   *
   * This is the main entry point for agent chat.
   */
  async processMessage(
    session: AgentSession,
    userContent: string,
    provider: ModelProviderClient,
    modelId: string,
  ): Promise<ChatMessage> {
    const traceId = uuid(crypto.randomUUID());

    // Log user message
    await this.eventLog.record('user_message', { content: userContent }, session.id, traceId);

    // Retrieve relevant memory
    const memories = await this.memory.search({
      workspaceId: session.workspaceId,
      text: userContent,
      limit: 5,
    });
    const memoryContext = memories.length > 0
      ? '\n\n[Memoria relevante]\n' + memories.map((m: { entry: { title: string; content: string } }) => `- ${m.entry.title}: ${m.entry.content}`).join('\n')
      : '';

    // Build messages for the model
    const systemPrompt = session.systemPrompt ?? 'Eres un asistente de programación experto.';
    const messages = [
      { role: 'system' as const, content: systemPrompt + memoryContext },
      ...session.messages.map((m: ChatMessage) => ({
        role: m.role === 'tool' || m.role === 'error' ? 'system' as const : m.role,
        content: m.content,
      })),
      { role: 'user' as const, content: userContent },
    ];

    await this.logger.info('agent', 'Llamando al modelo', { modelId, messageCount: messages.length, traceId });

    // Call the model
    const response = await provider.complete({
      profileId: session.modelProfileId ?? uuid(''),
      messages,
      stream: false,
    });

    // Create assistant message
    const assistantMsg: ChatMessage = {
      id: uuid(crypto.randomUUID()),
      sessionId: session.id,
      role: 'assistant',
      content: response.content,
      modelProfileId: session.modelProfileId,
      toolCallId: null,
      metadata: { usage: response.usage, finishReason: response.finishReason },
      createdAt: isoNow(),
    };

    await this.eventLog.record(
      'agent_response',
      { content: response.content, finishReason: response.finishReason },
      session.id,
      traceId,
    );

    return assistantMsg;
  }

  /**
   * Create a task within a session. The planner will break this into steps.
   * SCAFFOLDED: Automatic plan generation is not yet implemented.
   */
  async createTask(
    sessionId: UUID,
    title: string,
    description: string,
  ): Promise<Task> {
    const task: Task = {
      id: uuid(crypto.randomUUID()),
      sessionId,
      title,
      description,
      status: 'pending',
      priority: 'medium',
      order: 0,
      parentTaskId: null,
      createdAt: isoNow(),
      updatedAt: isoNow(),
      completedAt: null,
    };
    await this.eventLog.record('task_created', { taskId: task.id, title }, sessionId);
    return task;
  }

  /**
   * Create a plan step within a task.
   */
  async createPlanStep(
    taskId: UUID,
    type: PlanStep['type'],
    title: string,
    description: string,
  ): Promise<PlanStep> {
    const step: PlanStep = {
      id: uuid(crypto.randomUUID()),
      taskId,
      type,
      title,
      description,
      status: 'pending',
      order: 0,
      toolExecutionId: null,
      createdAt: isoNow(),
      updatedAt: isoNow(),
    };
    return step;
  }

  /**
   * Record a user correction — the system learns from these.
   * This feeds into the self-improvement loop.
   */
  async recordCorrection(
    workspaceId: UUID,
    originalAction: string,
    correction: string,
    context: string,
  ): Promise<void> {
    await this.memory.add({
      workspaceId,
      type: 'correction',
      title: `Corrección: ${originalAction}`,
      content: `Acción original: ${originalAction}\nCorrección: ${correction}\nContexto: ${context}`,
      tags: ['correction', 'learning'],
      importance: 'high',
      source: 'user',
      embedding: null,
      metadata: { originalAction, correction },
    });
    await this.logger.info('agent', 'Corrección registrada', { originalAction, correction });
  }
}

/**
 * Planner — separates planning from execution.
 * The planner decomposes tasks into plan steps and determines execution order.
 *
 * SCAFFOLDED: Currently creates manual steps. Future: LLM-driven planning.
 */
export class Planner {
  constructor(private logger: Logger) {}

  async plan(task: Task): Promise<PlanStep[]> {
    await this.logger.info('agent', `Planificando tarea: ${task.title}`, { taskId: task.id });

    // SCAFFOLDED: In the future, this will call the model to decompose the task.
    // For now, return a simple analysis + execution + verification plan.
    const steps: PlanStep[] = [
      {
        id: uuid(crypto.randomUUID()),
        taskId: task.id,
        type: 'analysis',
        title: 'Analizar requisitos',
        description: `Analizar la tarea: ${task.title}`,
        status: 'pending',
        order: 0,
        toolExecutionId: null,
        createdAt: isoNow(),
        updatedAt: isoNow(),
      },
      {
        id: uuid(crypto.randomUUID()),
        taskId: task.id,
        type: 'code_change',
        title: 'Implementar cambios',
        description: `Ejecutar la implementación para: ${task.title}`,
        status: 'pending',
        order: 1,
        toolExecutionId: null,
        createdAt: isoNow(),
        updatedAt: isoNow(),
      },
      {
        id: uuid(crypto.randomUUID()),
        taskId: task.id,
        type: 'verification',
        title: 'Verificar resultados',
        description: `Verificar que la tarea se completó correctamente: ${task.title}`,
        status: 'pending',
        order: 2,
        toolExecutionId: null,
        createdAt: isoNow(),
        updatedAt: isoNow(),
      },
    ];

    return steps;
  }
}
