export * from './host.js';
export * from './stub-client.js';

import { MCPHost } from './host.js';
import { StubMCPClient } from './stub-client.js';

/** Pre-configured MCP host with stub client factory for all transports. */
export function createDefaultMCPHost(): MCPHost {
  const host = new MCPHost();
  host.registerTransportFactory('stdio', (s) => new StubMCPClient(s));
  host.registerTransportFactory('sse', (s) => new StubMCPClient(s));
  host.registerTransportFactory('websocket', (s) => new StubMCPClient(s));
  return host;
}
