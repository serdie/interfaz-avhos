import type { ModelProvider, ModelRequest, ModelResponse, ModelStreamChunk, UUID } from '@avhos/core';
import type { ModelProviderClient } from './provider.js';

/**
 * Ollama provider client — real HTTP calls against local Ollama API.
 * Default endpoint: http://localhost:11434
 */
export class OllamaProviderClient implements ModelProviderClient {
  readonly providerId: UUID;
  readonly providerType = 'ollama';
  private baseUrl: string;

  constructor(provider: ModelProvider) {
    this.providerId = provider.id;
    this.baseUrl = (provider.baseUrl || 'http://localhost:11434').replace(/\/$/, '');
  }

  async healthCheck(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/api/tags`, { signal: AbortSignal.timeout(3000) });
      return res.ok;
    } catch {
      return false;
    }
  }

  async listModels(): Promise<string[]> {
    const res = await fetch(`${this.baseUrl}/api/tags`);
    if (!res.ok) throw new Error(`Ollama respondió ${res.status}`);
    const data = await res.json();
    return (data.models as { name: string }[]).map((m) => m.name);
  }

  async complete(request: ModelRequest): Promise<ModelResponse> {
    const model = request.modelId || request.profileId;
    const res = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: request.messages,
        stream: false,
        options: request.temperature != null ? { temperature: request.temperature } : undefined,
      }),
    });
    if (!res.ok) throw new Error(`Ollama respondió ${res.status}`);
    const data = await res.json();
    return {
      profileId: request.profileId,
      content: data.message?.content ?? '',
      finishReason: 'stop',
      usage: data.eval_count ? { promptTokens: data.prompt_eval_count ?? 0, completionTokens: data.eval_count, totalTokens: (data.prompt_eval_count ?? 0) + data.eval_count } : null,
      raw: data,
    };
  }

  async *stream(request: ModelRequest): AsyncGenerator<ModelStreamChunk> {
    const model = request.modelId || request.profileId;
    const res = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: request.messages,
        stream: true,
        options: request.temperature != null ? { temperature: request.temperature } : undefined,
      }),
    });
    if (!res.ok || !res.body) throw new Error(`Ollama respondió ${res.status}`);

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const chunk = JSON.parse(line);
          if (chunk.message?.content) {
            yield { delta: chunk.message.content, done: false };
          }
          if (chunk.done) {
            yield { delta: '', done: true };
            return;
          }
        } catch {
          // partial JSON, skip
        }
      }
    }
  }
}
