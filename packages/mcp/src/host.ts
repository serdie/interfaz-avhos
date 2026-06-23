import type { MCPServer, MCPTool, MCPPrompt, MCPResource, UUID } from '@avhos/core';

/**
 * MCPClient — represents a single connection to an MCP server.
 * The host manages multiple clients. Each client handles the protocol
 * for its assigned server (stdio, SSE, or websocket).
 *
 * PLACEHOLDER: The actual MCP protocol implementation is not yet wired.
 * This interface defines the contract for future implementation.
 */
export interface MCPClient {
  readonly serverId: UUID;
  readonly serverName: string;

  /** Connect to the MCP server. */
  connect(): Promise<void>;

  /** Disconnect from the MCP server. */
  disconnect(): Promise<void>;

  /** Check if currently connected. */
  isConnected(): boolean;

  /** List tools exposed by the server. */
  listTools(): Promise<MCPTool[]>;

  /** List prompts exposed by the server. */
  listPrompts(): Promise<MCPPrompt[]>;

  /** List resources exposed by the server. */
  listResources(): Promise<MCPResource[]>;

  /** Invoke a tool on the server. */
  callTool(toolName: string, args: Record<string, unknown>): Promise<unknown>;

  /** Get a resource by URI. */
  getResource(uri: string): Promise<unknown>;

  /** Render a prompt template with arguments. */
  renderPrompt(promptName: string, args: Record<string, string>): Promise<string>;
}

/** Factory for creating MCP clients based on transport type. */
export type MCPClientFactory = (server: MCPServer) => MCPClient;

/**
 * MCPHost — the central manager for all MCP server connections.
 * This is the host in the host-client-server model.
 * It registers servers, manages client lifecycles, and aggregates
 * tools, prompts, and resources from all connected servers.
 */
export class MCPHost {
  private clients = new Map<string, MCPClient>();
  private factories = new Map<string, MCPClientFactory>();

  registerTransportFactory(transport: string, factory: MCPClientFactory): void {
    this.factories.set(transport, factory);
  }

  async addServer(server: MCPServer): Promise<MCPClient> {
    const factory = this.factories.get(server.transport);
    if (!factory) {
      throw new Error(`No factory registered for transport: ${server.transport}`);
    }
    const client = factory(server);
    this.clients.set(server.id, client);
    if (server.autoConnect) {
      await client.connect();
    }
    return client;
  }

  async removeServer(serverId: UUID): Promise<void> {
    const client = this.clients.get(serverId);
    if (client) {
      await client.disconnect();
      this.clients.delete(serverId);
    }
  }

  getClient(serverId: UUID): MCPClient | null {
    return this.clients.get(serverId) ?? null;
  }

  getAllClients(): MCPClient[] {
    return Array.from(this.clients.values());
  }

  async connectAll(): Promise<void> {
    for (const client of this.clients.values()) {
      if (!client.isConnected()) {
        await client.connect();
      }
    }
  }

  async disconnectAll(): Promise<void> {
    for (const client of this.clients.values()) {
      if (client.isConnected()) {
        await client.disconnect();
      }
    }
  }

  /** Aggregate all tools from all connected servers. */
  async getAllTools(): Promise<MCPTool[]> {
    const tools: MCPTool[] = [];
    for (const client of this.clients.values()) {
      if (client.isConnected()) {
        tools.push(...(await client.listTools()));
      }
    }
    return tools;
  }

  /** Aggregate all prompts from all connected servers. */
  async getAllPrompts(): Promise<MCPPrompt[]> {
    const prompts: MCPPrompt[] = [];
    for (const client of this.clients.values()) {
      if (client.isConnected()) {
        prompts.push(...(await client.listPrompts()));
      }
    }
    return prompts;
  }

  /** Aggregate all resources from all connected servers. */
  async getAllResources(): Promise<MCPResource[]> {
    const resources: MCPResource[] = [];
    for (const client of this.clients.values()) {
      if (client.isConnected()) {
        resources.push(...(await client.listResources()));
      }
    }
    return resources;
  }
}
