import type { MCPServer, MCPTool, MCPPrompt, MCPResource, UUID } from '@avhos/core';
import type { MCPClient } from './host.js';

/**
 * Stub MCP client — placeholder implementation that returns empty results.
 * Used when no real MCP server is available. Clearly labeled as scaffolded.
 *
 * SCAFFOLDED: Replace with real protocol implementation (JSON-RPC over stdio/SSE/WS).
 */
export class StubMCPClient implements MCPClient {
  readonly serverId: UUID;
  readonly serverName: string;
  private connected = false;

  constructor(server: MCPServer) {
    this.serverId = server.id;
    this.serverName = server.name;
  }

  async connect(): Promise<void> {
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    this.connected = false;
  }

  isConnected(): boolean {
    return this.connected;
  }

  async listTools(): Promise<MCPTool[]> {
    return [];
  }

  async listPrompts(): Promise<MCPPrompt[]> {
    return [];
  }

  async listResources(): Promise<MCPResource[]> {
    return [];
  }

  async callTool(_toolName: string, _args: Record<string, unknown>): Promise<unknown> {
    throw new Error('StubMCPClient: callTool not implemented');
  }

  async getResource(_uri: string): Promise<unknown> {
    throw new Error('StubMCPClient: getResource not implemented');
  }

  async renderPrompt(_promptName: string, _args: Record<string, string>): Promise<string> {
    throw new Error('StubMCPClient: renderPrompt not implemented');
  }
}
