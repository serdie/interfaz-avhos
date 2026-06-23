import { useAppStore } from '../store/app-store.js';

/**
 * Detecta si Ollama está disponible y lista los modelos reales.
 * Actualiza el store con el estado y los modelos encontrados.
 */
export async function detectOllama(): Promise<void> {
  const store = useAppStore.getState();
  const url = store.ollamaUrl;
  store.setOllamaStatus('checking');

  try {
    const res = await fetch(`${url}/api/tags`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) {
      store.setOllamaStatus('offline');
      store.setOllamaModels([]);
      store.pushActivity('system', 'warn', 'Ollama respondió con error');
      return;
    }

    const data = await res.json();
    const models = (data.models as { name: string }[]).map((m) => m.name);

    store.setOllamaStatus('online');
    store.setOllamaModels(models);

    if (models.length > 0) {
      const current = useAppStore.getState().activeModel;
      if (!current || !models.includes(current)) {
        store.setActiveModel(models[0]);
      }
      store.pushActivity('system', 'info', `Ollama: ${models.length} modelos disponibles`);
    } else {
      store.pushActivity('system', 'warn', 'Ollama online pero sin modelos instalados');
    }
  } catch {
    store.setOllamaStatus('offline');
    store.setOllamaModels([]);
    store.pushActivity('system', 'info', `Ollama no detectado en ${url}`);
  }
}

/**
 * Envía un mensaje al modelo activo vía Ollama streaming.
 * Llama onChunk para cada trozo de respuesta.
 */
export async function streamChat(
  model: string,
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[],
  onChunk: (delta: string) => void,
  signal?: AbortSignal,
): Promise<void> {
  const url = useAppStore.getState().ollamaUrl;
  const res = await fetch(`${url}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, messages, stream: true }),
    signal,
  });

  if (!res.ok || !res.body) {
    throw new Error(`Ollama respondió ${res.status}`);
  }

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
          onChunk(chunk.message.content);
        }
      } catch {
        // partial JSON
      }
    }
  }
}
