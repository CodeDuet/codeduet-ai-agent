import { EventEmitter } from "events";

let Client: any, StdioClientTransport: any, SSEClientTransport: any;

try {
  const sdkModule = require("@modelcontextprotocol/sdk/client/index.js");
  Client = sdkModule.Client;

  const stdioModule = require("@modelcontextprotocol/sdk/client/stdio.js");
  StdioClientTransport = stdioModule.StdioClientTransport;

  const sseModule = require("@modelcontextprotocol/sdk/client/sse.js");
  SSEClientTransport = sseModule.SSEClientTransport;

  console.log("MCP SDK loaded successfully");
} catch (error) {
  console.error("Failed to load MCP SDK:", error);
  console.log("MCP functionality will be disabled");
}

export interface McpServerConfig {
  id: number;
  name: string;
  transport: "stdio" | "http";
  command?: string;
  args?: string[];
  env?: Record<string, string>;
  url?: string;
  isEnabled: boolean;
}

export interface McpTool {
  name: string;
  description?: string;
  inputSchema: any;
}

export class McpManager extends EventEmitter {
  private servers = new Map<number, { client: any }>();

  async addServer(config: McpServerConfig): Promise<void> {
    if (!config.isEnabled) {
      return;
    }

    if (!Client || !StdioClientTransport || !SSEClientTransport) {
      throw new Error("MCP SDK is not available");
    }

    try {
      let client: any;

      if (config.transport === "stdio") {
        if (!config.command) {
          throw new Error("Command is required for stdio transport");
        }

        const transport = new StdioClientTransport({
          command: config.command,
          args: config.args,
          env: {
            ...(Object.fromEntries(
              Object.entries(process.env).filter(
                ([, value]) => value !== undefined,
              ),
            ) as Record<string, string>),
            ...config.env,
          },
        });

        client = new Client(
          {
            name: "codeduet",
            version: "1.0.0",
          },
          {
            capabilities: {
              tools: {},
            },
          },
        );

        await client.connect(transport);
      } else if (config.transport === "http") {
        if (!config.url) {
          throw new Error("URL is required for http transport");
        }

        const transport = new SSEClientTransport(new URL(config.url));

        client = new Client(
          {
            name: "codeduet",
            version: "1.0.0",
          },
          {
            capabilities: {
              tools: {},
            },
          },
        );

        await client.connect(transport);
      } else {
        throw new Error(`Unsupported transport: ${config.transport}`);
      }

      this.servers.set(config.id, { client });
      this.emit("serverAdded", config.id);
    } catch (error) {
      this.emit("serverError", config.id, error);
      throw error;
    }
  }

  async removeServer(serverId: number): Promise<void> {
    const server = this.servers.get(serverId);
    if (!server) {
      return;
    }

    try {
      await server.client.close();
      this.servers.delete(serverId);
      this.emit("serverRemoved", serverId);
    } catch (error) {
      this.emit("serverError", serverId, error);
      throw error;
    }
  }

  async getTools(serverId?: number): Promise<McpTool[]> {
    const tools: McpTool[] = [];

    const serverIds = serverId ? [serverId] : Array.from(this.servers.keys());

    for (const id of serverIds) {
      const server = this.servers.get(id);
      if (!server) continue;

      try {
        const response = await server.client.listTools();
        tools.push(
          ...response.tools.map((tool: any) => ({
            name: tool.name,
            description: tool.description,
            inputSchema: tool.inputSchema,
          })),
        );
      } catch (error) {
        this.emit("serverError", id, error);
      }
    }

    return tools;
  }

  async callTool(serverId: number, toolName: string, args: any): Promise<any> {
    const server = this.servers.get(serverId);
    if (!server) {
      throw new Error(`Server ${serverId} not found`);
    }

    try {
      const response = await server.client.callTool({
        name: toolName,
        arguments: args,
      });
      return response;
    } catch (error) {
      this.emit("serverError", serverId, error);
      throw error;
    }
  }

  async testConnection(config: McpServerConfig): Promise<boolean> {
    if (!Client || !StdioClientTransport || !SSEClientTransport) {
      console.error("MCP SDK is not available for testing");
      return false;
    }

    try {
      let client: any;

      if (config.transport === "stdio") {
        if (!config.command) {
          throw new Error("Command is required for stdio transport");
        }

        const transport = new StdioClientTransport({
          command: config.command,
          args: config.args,
          env: {
            ...(Object.fromEntries(
              Object.entries(process.env).filter(
                ([, value]) => value !== undefined,
              ),
            ) as Record<string, string>),
            ...config.env,
          },
        });

        client = new Client(
          {
            name: "codeduet-test",
            version: "1.0.0",
          },
          {
            capabilities: {
              tools: {},
            },
          },
        );

        await client.connect(transport);
      } else if (config.transport === "http") {
        if (!config.url) {
          throw new Error("URL is required for http transport");
        }

        const transport = new SSEClientTransport(new URL(config.url));

        client = new Client(
          {
            name: "codeduet-test",
            version: "1.0.0",
          },
          {
            capabilities: {
              tools: {},
            },
          },
        );

        await client.connect(transport);
      } else {
        throw new Error(`Unsupported transport: ${config.transport}`);
      }

      await client.close();

      return true;
    } catch (error) {
      return false;
    }
  }

  getConnectedServers(): number[] {
    return Array.from(this.servers.keys());
  }

  async shutdown(): Promise<void> {
    const serverIds = Array.from(this.servers.keys());
    await Promise.all(serverIds.map((id) => this.removeServer(id)));
  }
}

export const mcpManager = new McpManager();
