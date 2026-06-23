import type { ModelProvider, ModelRequest, ModelResponse, ModelStreamChunk, UUID } from '@avhos/core';
import type { ModelProviderClient } from './provider.js';

/**
 * Ollama provider client — designed for local Ollama API.
 * PLACEHOLDER: HTTP calls are stubbed. When ready, use fetch() against
 * the Ollama REST API (default: http://localhost:11434).
 *
 * Architecture is real; network calls are not yet wired.
 */
export class OllamaProviderClient implements ModelProviderClient {
  readonly providerId: UUID;
  readonly providerType = 'ollama';
  private _baseUrl: string;

  constructor(provider: ModelProvider) {
    this.providerId = provider.id;
    this._baseUrl = provider.baseUrl || 'http://localhost:11434';
    void this._baseUrl;
  }

  async listModels(): Promise<string[]> {
    // PLACEHOLDER: GET /api/tags
    // const res = await fetch(`${this.baseUrl}/api/tags`);
    // const data = await res.json();
    // return data.models.map((m: { name: string }) => m.name);
    return ['llama3.1:8b', 'qwen2.5-coder:7b', 'deepseek-coder:6.7b'];
  }

  async complete(request: ModelRequest): Promise<ModelResponse> {
    // PLACEHOLDER: POST /api/chat
    // const res = await fetch(`${this.baseUrl}/api/chat`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ model, messages: request.messages, stream: false }),
    // });
    // return parseResponse(res, request.profileId);
    return {
      profileId: request.profileId,
      content: '[Ollama placeholder] Respuesta no implementada — configura el backend para usar Ollama.',
      finishReason: 'stop',
      usage: null,
      raw: null,
    };
  }

  async *stream(request: ModelRequest): AsyncGenerator<ModelStreamChunk> {
    // PLACEHOLDER: POST /api/chat with stream: true
    void request;
    yield {
      delta: '[Ollama placeholder] Streaming no implementado.',
      done: true,
    };
  }

  async healthCheck(): Promise<boolean> {
    // PLACEHOLDER: GET /api/tags and check 200
    return false;
  }
}
