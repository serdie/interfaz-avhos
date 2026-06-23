import type {
  ModelProvider,
  ModelRequest,
  ModelResponse,
  ModelStreamChunk,
  UUID,
} from '@avhos/core';

/**
 * ModelProviderClient — interface that each provider backend must implement.
 * This is the core abstraction: Ollama, cloud APIs, or custom backends
 * all implement this interface. The orchestrator never knows which provider it's talking to.
 */
export interface ModelProviderClient {
  readonly providerId: UUID;
  readonly providerType: string;

  /** List available models from this provider. */
  listModels(): Promise<string[]>;

  /** Send a chat request and get a full response. */
  complete(request: ModelRequest): Promise<ModelResponse>;

  /** Send a streaming chat request, yielding chunks. */
  stream(request: ModelRequest): AsyncGenerator<ModelStreamChunk>;

  /** Check if the provider is reachable. */
  healthCheck(): Promise<boolean>;
}

/** Factory function type for creating provider clients. */
export type ProviderClientFactory = (provider: ModelProvider) => ModelProviderClient;

/** Registry of provider factories by type. */
export class ProviderRegistry {
  private factories = new Map<string, ProviderClientFactory>();
  private clients = new Map<string, ModelProviderClient>();

  register(type: string, factory: ProviderClientFactory): void {
    this.factories.set(type, factory);
  }

  getOrCreate(provider: ModelProvider): ModelProviderClient {
    const existing = this.clients.get(provider.id);
    if (existing) return existing;

    const factory = this.factories.get(provider.type);
    if (!factory) {
      throw new Error(`No provider factory registered for type: ${provider.type}`);
    }

    const client = factory(provider);
    this.clients.set(provider.id, client);
    return client;
  }

  clear(): void {
    this.clients.clear();
  }
}
