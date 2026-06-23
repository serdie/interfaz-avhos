import { UUID, ISODateString } from './branded.js';

export type MCPServerStatus = 'connected' | 'disconnected' | 'error' | 'connecting';

export type MCPTransportType = 'stdio' | 'sse' | 'websocket';

/** An MCP server registration in the host. */
export interface MCPServer {
  id: UUID;
  name: string;
  transport: MCPTransportType;
  command: string | null;
  args: string[];
  env: Record<string, string>;
  url: string | null;
  status: MCPServerStatus;
  autoConnect: boolean;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

/** A tool exposed by an MCP server. */
export interface MCPTool {
  id: UUID;
  serverId: UUID;
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  enabled: boolean;
}

/** A prompt template exposed by an MCP server. */
export interface MCPPrompt {
  id: UUID;
  serverId: UUID;
  name: string;
  description: string;
  arguments: { name: string; description: string; required: boolean }[];
}

/** A resource exposed by an MCP server. */
export interface MCPResource {
  id: UUID;
  serverId: UUID;
  uri: string;
  name: string;
  description: string | null;
  mimeType: string | null;
}
