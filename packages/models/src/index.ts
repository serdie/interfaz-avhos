export * from './provider.js';
export * from './ollama.js';
export * from './cloud.js';

import { ProviderRegistry } from './provider.js';
import { OllamaProviderClient } from './ollama.js';
import { CloudProviderClient } from './cloud.js';

/** Pre-configured registry with all built-in provider types. */
export function createDefaultProviderRegistry(): ProviderRegistry {
  const registry = new ProviderRegistry();
  registry.register('ollama', (p) => new OllamaProviderClient(p));
  registry.register('cloud', (p) => new CloudProviderClient(p));
  return registry;
}
