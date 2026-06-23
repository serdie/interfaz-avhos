import type { ModelProvider, ModelRequest, ModelResponse, ModelStreamChunk, UUID } from '@avhos/core';
import type { ModelProviderClient } from './provider.js';

/**
 * Cloud provider client — designed for cloud-hosted coding models.
 * PLACEHOLDER: HTTP calls are stubbed. When ready, this will support
 * OpenAI-compatible APIs, Anthropic, or Devin-supported model endpoints.
 *
 * The architecture supports streaming, tool use, and multi-provider routing.
 * Network calls are not yet wired.
 */
export class CloudProviderClient implements ModelProviderClient {
  readonly providerId: UUID;
  readonly providerType = 'cloud';
  private _baseUrl: string;
  private _apiKey: string | null;

  constructor(provider: ModelProvider) {
    this.providerId = provider.id;
    this._baseUrl = provider.baseUrl;
    this._apiKey = provider.apiKey;
    // Fields reserved for future HTTP implementation
    void this._baseUrl; void this._apiKey;
  }

  async listModels(): Promise<string[]> {
    // PLACEHOLDER: GET /v1/models with Authorization header
    return ['gpt-4o', 'claude-3.5-sonnet', 'devin-pro'];
  }

  async complete(request: ModelRequest): Promise<ModelResponse> {
    // PLACEHOLDER: POST /v1/chat/completions
    return {
      profileId: request.profileId,
      content: '[Cloud placeholder] Respuesta no implementada — configura las credenciales del proveedor.',
      finishReason: 'stop',
      usage: null,
      raw: null,
    };
  }

  async *stream(request: ModelRequest): AsyncGenerator<ModelStreamChunk> {
    // PLACEHOLDER: POST /v1/chat/completions with stream: true
    void request;
    yield {
      delta: '[Cloud placeholder] Streaming no implementado.',
      done: true,
    };
  }

  async healthCheck(): Promise<boolean> {
    // PLACEHOLDER: GET /v1/models with auth
    return false;
  }
}
