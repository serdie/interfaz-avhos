import type { LogEntry, LogLevel, EventCategory, Trace, TraceSpan, InteractionEvent, UUID } from '@avhos/core';
import type { EventBus } from '@avhos/core';
import type { StorageAdapter } from '@avhos/storage';
import { TABLES } from '@avhos/storage';
import { uuid, isoNow } from '@avhos/core';

/**
 * Logger — structured logging with categories and trace correlation.
 * All logs are persisted to the event log and broadcast via the event bus.
 */
export class Logger {
  constructor(
    private storage: StorageAdapter,
    private eventBus: EventBus,
  ) {}

  async log(
    level: LogLevel,
    category: EventCategory,
    message: string,
    data?: Record<string, unknown>,
    traceId?: UUID,
  ): Promise<LogEntry> {
    const entry: LogEntry = {
      id: uuid(crypto.randomUUID()),
      level,
      category,
      message,
      data: data ?? null,
      traceId: traceId ?? null,
      createdAt: isoNow(),
    };
    await this.storage.insert(TABLES.LOG_ENTRIES, entry);
    this.eventBus.emit('log:entry', entry);
    return entry;
  }

  async debug(category: EventCategory, message: string, data?: Record<string, unknown>): Promise<LogEntry> {
    return this.log('debug', category, message, data);
  }

  async info(category: EventCategory, message: string, data?: Record<string, unknown>): Promise<LogEntry> {
    return this.log('info', category, message, data);
  }

  async warn(category: EventCategory, message: string, data?: Record<string, unknown>): Promise<LogEntry> {
    return this.log('warn', category, message, data);
  }

  async error(category: EventCategory, message: string, data?: Record<string, unknown>): Promise<LogEntry> {
    return this.log('error', category, message, data);
  }

  async getAll(limit = 100): Promise<LogEntry[]> {
    const all = await this.storage.getAll<LogEntry>(TABLES.LOG_ENTRIES);
    return all.slice(-limit).reverse();
  }

  async clear(): Promise<void> {
    await this.storage.clear(TABLES.LOG_ENTRIES);
  }
}

/**
 * Tracer — creates traces and spans for distributed operation tracking.
 * Used to correlate agent actions, tool calls, and model requests.
 */
export class Tracer {
  constructor(private storage: StorageAdapter) {}

  async startTrace(name: string): Promise<Trace> {
    const trace: Trace = {
      id: uuid(crypto.randomUUID()),
      name,
      rootSpanId: null,
      status: 'running',
      startTime: isoNow(),
      endTime: null,
      durationMs: null,
    };
    await this.storage.insert(TABLES.TRACES, trace);
    return trace;
  }

  async endTrace(traceId: UUID, status: 'completed' | 'error'): Promise<Trace> {
    const trace = await this.storage.getById<Trace>(TABLES.TRACES, traceId);
    if (!trace) throw new Error(`Trace not found: ${traceId}`);
    const endTime = isoNow();
    const durationMs = new Date(endTime).getTime() - new Date(trace.startTime).getTime();
    return this.storage.update<Trace>(TABLES.TRACES, traceId, {
      status,
      endTime,
      durationMs,
    });
  }

  async startSpan(
    traceId: UUID,
    parentSpanId: UUID | null,
    name: string,
    attributes?: Record<string, unknown>,
  ): Promise<TraceSpan> {
    const span: TraceSpan = {
      id: uuid(crypto.randomUUID()),
      traceId,
      parentSpanId,
      name,
      startTime: isoNow(),
      endTime: null,
      durationMs: null,
      attributes: attributes ?? {},
    };
    await this.storage.insert(TABLES.TRACE_SPANS, span);
    return span;
  }

  async endSpan(spanId: UUID): Promise<TraceSpan> {
    const span = await this.storage.getById<TraceSpan>(TABLES.TRACE_SPANS, spanId);
    if (!span) throw new Error(`Span not found: ${spanId}`);
    const endTime = isoNow();
    const durationMs = new Date(endTime).getTime() - new Date(span.startTime).getTime();
    return this.storage.update<TraceSpan>(TABLES.TRACE_SPANS, spanId, {
      endTime,
      durationMs,
    });
  }
}

/**
 * EventLog — records every interaction event for audit and future learning.
 * This is the foundation for self-improvement: the system can replay
 * past interactions, analyze corrections, and learn from verified outcomes.
 */
export class EventLog {
  constructor(
    private storage: StorageAdapter,
    private eventBus: EventBus,
  ) {}

  async record(
    type: InteractionEvent['type'],
    payload: Record<string, unknown>,
    sessionId?: UUID,
    traceId?: UUID,
  ): Promise<InteractionEvent> {
    const event: InteractionEvent = {
      id: uuid(crypto.randomUUID()),
      sessionId: sessionId ?? null,
      type,
      payload,
      traceId: traceId ?? null,
      createdAt: isoNow(),
    };
    await this.storage.insert(TABLES.INTERACTION_EVENTS, event);
    this.eventBus.emit('event:interaction', event);
    return event;
  }

  async getBySession(sessionId: UUID): Promise<InteractionEvent[]> {
    return this.storage.query<InteractionEvent>(TABLES.INTERACTION_EVENTS, (e) => e.sessionId === sessionId);
  }

  async getAll(limit = 100): Promise<InteractionEvent[]> {
    const all = await this.storage.getAll<InteractionEvent>(TABLES.INTERACTION_EVENTS);
    return all.slice(-limit).reverse();
  }
}
