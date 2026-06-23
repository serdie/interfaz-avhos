import { UUID, ISODateString } from './branded.js';

export type ModelProviderType = 'ollama' | 'cloud' | 'custom';

export type ModelCapability = 'chat' | 'completion' | 'embedding' | 'vision' | 'tool_use';

/** A provider is a backend that serves models (e.g. Ollama, a cloud API). */
export interface ModelProvider {
  id: UUID;
  name: string;
  type: ModelProviderType;
  baseUrl: string;
  apiKey: string | null;
  capabilities: ModelCapability[];
  enabled: boolean;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

/** A profile binds a specific model from a provider with generation parameters. */
export interface ModelProfile {
  id: UUID;
  providerId: UUID;
  name: string;
  modelId: string;
  displayName: string;
  contextWindow: number;
  temperature: number;
  maxTokens: number;
  systemPrompt: string | null;
  isDefault: boolean;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

/** Normalized request sent to any provider. */
export interface ModelRequest {
  profileId: UUID;
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[];
  temperature?: number;
  maxTokens?: number;
  stream: boolean;
}

/** Normalized response from any provider. */
export interface ModelResponse {
  profileId: UUID;
  content: string;
  finishReason: 'stop' | 'length' | 'tool_call' | 'error';
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  } | null;
  raw: unknown;
}

/** Streaming chunk from a provider. */
export interface ModelStreamChunk {
  delta: string;
  done: boolean;
}
