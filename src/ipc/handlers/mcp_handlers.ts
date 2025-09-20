import { ipcMain } from "electron";
import { eq } from "drizzle-orm";
import { db } from "../../db";
import { mcpServers } from "../../db/schema";
import { mcpManager, McpServerConfig } from "../utils/mcp_manager";
import { z } from "zod";

const McpServerConfigSchema = z
  .object({
    name: z.string().min(1),
    transport: z.enum(["stdio", "http"]),
    command: z.string().optional(),
    args: z.array(z.string()).optional(),
    env: z.record(z.string()).optional(),
    url: z.string().url().optional(),
    isEnabled: z.boolean().default(true),
  })
  .refine(
    (data) => {
      if (data.transport === "stdio" && !data.command) {
        return false;
      }
      if (data.transport === "http" && !data.url) {
        return false;
      }
      return true;
    },
    {
      message: "Invalid configuration for transport type",
    },
  );

export function registerMcpHandlers() {
  console.log("Registering MCP handlers...");

  ipcMain.handle("mcp:listServers", async () => {
    try {
      console.log("Listing MCP servers...");
      const servers = await db.select().from(mcpServers);
      console.log(`Found ${servers.length} MCP servers`);
      return servers;
    } catch (error) {
      console.error("Error listing MCP servers:", error);
      // Return empty array instead of throwing to prevent UI errors on fresh installs
      return [];
    }
  });

  ipcMain.handle("mcp:addServer", async (_, config: unknown) => {
    try {
      const validatedConfig = McpServerConfigSchema.parse(config);

      const [server] = await db
        .insert(mcpServers)
        .values({
          name: validatedConfig.name,
          transport: validatedConfig.transport,
          command: validatedConfig.command,
          args: validatedConfig.args || [],
          env: validatedConfig.env || {},
          url: validatedConfig.url,
          isEnabled: validatedConfig.isEnabled,
        })
        .returning();

      if (server.isEnabled) {
        await mcpManager.addServer({
          id: server.id,
          name: server.name,
          transport: server.transport as "stdio" | "http",
          command: server.command || undefined,
          args: (server.args as string[]) || undefined,
          env: (server.env as Record<string, string>) || undefined,
          url: server.url || undefined,
          isEnabled: server.isEnabled,
        });
      }

      return server;
    } catch (error) {
      console.error("Error adding MCP server:", error);
      throw error;
    }
  });

  ipcMain.handle("mcp:updateServer", async (_, id: number, config: unknown) => {
    try {
      const validatedConfig = McpServerConfigSchema.parse(config);

      await mcpManager.removeServer(id);

      const [server] = await db
        .update(mcpServers)
        .set({
          name: validatedConfig.name,
          transport: validatedConfig.transport,
          command: validatedConfig.command,
          args: validatedConfig.args || [],
          env: validatedConfig.env || {},
          url: validatedConfig.url,
          isEnabled: validatedConfig.isEnabled,
          updatedAt: new Date(),
        })
        .where(eq(mcpServers.id, id))
        .returning();

      if (server?.isEnabled) {
        await mcpManager.addServer({
          id: server.id,
          name: server.name,
          transport: server.transport as "stdio" | "http",
          command: server.command || undefined,
          args: (server.args as string[]) || undefined,
          env: (server.env as Record<string, string>) || undefined,
          url: server.url || undefined,
          isEnabled: server.isEnabled,
        });
      }

      return server;
    } catch (error) {
      console.error("Error updating MCP server:", error);
      throw error;
    }
  });

  ipcMain.handle("mcp:deleteServer", async (_, id: number) => {
    try {
      await mcpManager.removeServer(id);
      await db.delete(mcpServers).where(eq(mcpServers.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting MCP server:", error);
      throw error;
    }
  });

  ipcMain.handle(
    "mcp:toggleServer",
    async (_, id: number, enabled: boolean) => {
      try {
        const [server] = await db
          .update(mcpServers)
          .set({
            isEnabled: enabled,
            updatedAt: new Date(),
          })
          .where(eq(mcpServers.id, id))
          .returning();

        if (!server) {
          throw new Error(`Server ${id} not found`);
        }

        if (enabled) {
          await mcpManager.addServer({
            id: server.id,
            name: server.name,
            transport: server.transport as "stdio" | "http",
            command: server.command || undefined,
            args: (server.args as string[]) || undefined,
            env: (server.env as Record<string, string>) || undefined,
            url: server.url || undefined,
            isEnabled: server.isEnabled,
          });
        } else {
          await mcpManager.removeServer(id);
        }

        return server;
      } catch (error) {
        console.error("Error toggling MCP server:", error);
        throw error;
      }
    },
  );

  ipcMain.handle("mcp:testConnection", async (_, config: unknown) => {
    try {
      const validatedConfig = McpServerConfigSchema.parse(config);

      const testConfig: McpServerConfig = {
        id: -1,
        name: "test",
        transport: validatedConfig.transport,
        command: validatedConfig.command,
        args: validatedConfig.args,
        env: validatedConfig.env,
        url: validatedConfig.url,
        isEnabled: true,
      };

      return await mcpManager.testConnection(testConfig);
    } catch (error) {
      console.error("Error testing MCP connection:", error);
      return false;
    }
  });

  ipcMain.handle("mcp:getTools", async (_, serverId?: number) => {
    try {
      return await mcpManager.getTools(serverId);
    } catch (error) {
      console.error("Error getting MCP tools:", error);
      throw error;
    }
  });

  ipcMain.handle(
    "mcp:callTool",
    async (_, serverId: number, toolName: string, args: any) => {
      try {
        return await mcpManager.callTool(serverId, toolName, args);
      } catch (error) {
        console.error("Error calling MCP tool:", error);
        throw error;
      }
    },
  );

  ipcMain.handle("mcp:getConnectedServers", async () => {
    try {
      console.log("Getting connected MCP servers...");
      const connected = mcpManager.getConnectedServers();
      console.log(`Found ${connected.length} connected MCP servers`);
      return connected;
    } catch (error) {
      console.error("Error getting connected MCP servers:", error);
      // Return empty array instead of throwing to prevent UI errors
      return [];
    }
  });
}

export async function initializeMcpServers() {
  try {
    console.log("Initializing MCP servers...");
    const servers = await db
      .select()
      .from(mcpServers)
      .where(eq(mcpServers.isEnabled, true));
    console.log(`Found ${servers.length} enabled MCP servers`);

    // If no servers are configured, skip initialization
    if (servers.length === 0) {
      console.log("No MCP servers configured, skipping initialization");
      return;
    }

    for (const server of servers) {
      try {
        console.log(`Initializing MCP server: ${server.name}`);
        await mcpManager.addServer({
          id: server.id,
          name: server.name,
          transport: server.transport as "stdio" | "http",
          command: server.command || undefined,
          args: (server.args as string[]) || undefined,
          env: (server.env as Record<string, string>) || undefined,
          url: server.url || undefined,
          isEnabled: server.isEnabled,
        });
        console.log(`Successfully initialized MCP server: ${server.name}`);
      } catch (error) {
        console.error(`Failed to initialize MCP server ${server.name}:`, error);
      }
    }
    console.log("MCP server initialization complete");
  } catch (error) {
    console.error("Error initializing MCP servers:", error);
    // Don't throw the error, just log it to prevent app startup failure
  }
}
