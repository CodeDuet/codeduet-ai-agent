import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Play, Square, TestTube } from "lucide-react";
import { IpcClient } from "@/ipc/ipc_client";
import { showSuccess, showError } from "@/lib/toast";
import type { McpServer, McpServerConfig } from "@/ipc/ipc_types";

export function McpServerSettings() {
  const [servers, setServers] = useState<McpServer[]>([]);
  const [connectedServers, setConnectedServers] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingServer, setEditingServer] = useState<McpServer | null>(null);

  const loadServers = async () => {
    try {
      const ipcClient = IpcClient.getInstance();
      const [serverList, connected] = await Promise.all([
        ipcClient.listMcpServers(),
        ipcClient.getConnectedMcpServers(),
      ]);
      setServers(serverList || []);
      setConnectedServers(connected || []);
    } catch (error) {
      console.error("Error loading MCP servers:", error);
      // Only show error if we have servers configured but failed to load them
      setServers([]);
      setConnectedServers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServers();
  }, []);

  const handleAddServer = () => {
    setEditingServer(null);
    setIsDialogOpen(true);
  };

  const handleEditServer = (server: McpServer) => {
    setEditingServer(server);
    setIsDialogOpen(true);
  };

  const handleDeleteServer = async (id: number) => {
    try {
      const ipcClient = IpcClient.getInstance();
      await ipcClient.deleteMcpServer(id);
      await loadServers();
      showSuccess("MCP server deleted successfully");
    } catch (error) {
      console.error("Error deleting MCP server:", error);
      showError("Failed to delete MCP server");
    }
  };

  const handleToggleServer = async (id: number, enabled: boolean) => {
    try {
      const ipcClient = IpcClient.getInstance();
      await ipcClient.toggleMcpServer(id, enabled);
      await loadServers();
      showSuccess(`MCP server ${enabled ? "enabled" : "disabled"} successfully`);
    } catch (error) {
      console.error("Error toggling MCP server:", error);
      showError("Failed to toggle MCP server");
    }
  };

  if (loading) {
    return <div className="flex justify-center py-8">Loading MCP servers...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">MCP Servers</h3>
          <p className="text-sm text-gray-500">
            Manage Model Context Protocol servers for extending AI capabilities
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddServer} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Server
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingServer ? "Edit MCP Server" : "Add MCP Server"}
              </DialogTitle>
            </DialogHeader>
            <McpServerForm
              server={editingServer}
              onClose={() => setIsDialogOpen(false)}
              onSave={loadServers}
            />
          </DialogContent>
        </Dialog>
      </div>

      {servers.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-gray-500">
              <div className="text-lg mb-2">No MCP servers configured</div>
              <div className="text-sm">
                Add your first MCP server to extend AI capabilities with external tools
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {servers.map((server) => (
            <Card key={server.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-base">{server.name}</CardTitle>
                    <Badge variant={server.isEnabled ? "default" : "secondary"}>
                      {server.transport}
                    </Badge>
                    {connectedServers.includes(server.id) && (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        Connected
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={server.isEnabled}
                      onCheckedChange={(enabled) => handleToggleServer(server.id, enabled)}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditServer(server)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteServer(server.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  {server.transport === "stdio" && server.command && (
                    <span className="font-mono text-xs">{server.command}</span>
                  )}
                  {server.transport === "http" && server.url && (
                    <span className="font-mono text-xs">{server.url}</span>
                  )}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

interface McpServerFormProps {
  server?: McpServer | null;
  onClose: () => void;
  onSave: () => void;
}

function McpServerForm({ server, onClose, onSave }: McpServerFormProps) {
  const [formData, setFormData] = useState<McpServerConfig>({
    name: server?.name || "",
    transport: server?.transport || "stdio",
    command: server?.command || "",
    args: server?.args || [],
    env: server?.env || {},
    url: server?.url || "",
    isEnabled: server?.isEnabled ?? true,
  });

  const [argsText, setArgsText] = useState(
    server?.args ? server.args.join(" ") : ""
  );
  const [envText, setEnvText] = useState(
    server?.env ? Object.entries(server.env).map(([k, v]) => `${k}=${v}`).join("\n") : ""
  );

  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleTest = async () => {
    setTesting(true);
    try {
      const testConfig = {
        ...formData,
        args: argsText ? argsText.split(" ").filter(Boolean) : [],
        env: envText ? Object.fromEntries(
          envText.split("\n").filter(Boolean).map(line => {
            const [key, ...valueParts] = line.split("=");
            return [key.trim(), valueParts.join("=").trim()];
          })
        ) : {},
      };

      const ipcClient = IpcClient.getInstance();
      const success = await ipcClient.testMcpConnection(testConfig);
      
      if (success) {
        showSuccess("Connection test successful!");
      } else {
        showError("Connection test failed. Please check your configuration.");
      }
    } catch (error) {
      console.error("Error testing connection:", error);
      showError("Connection test failed");
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      showError("Server name is required");
      return;
    }

    if (formData.transport === "stdio" && !formData.command?.trim()) {
      showError("Command is required for stdio transport");
      return;
    }

    if (formData.transport === "http" && !formData.url?.trim()) {
      showError("URL is required for http transport");
      return;
    }

    setSaving(true);
    try {
      const config = {
        ...formData,
        args: argsText ? argsText.split(" ").filter(Boolean) : [],
        env: envText ? Object.fromEntries(
          envText.split("\n").filter(Boolean).map(line => {
            const [key, ...valueParts] = line.split("=");
            return [key.trim(), valueParts.join("=").trim()];
          })
        ) : {},
      };

      const ipcClient = IpcClient.getInstance();
      if (server) {
        await ipcClient.updateMcpServer(server.id, config);
        showSuccess("MCP server updated successfully");
      } else {
        await ipcClient.addMcpServer(config);
        showSuccess("MCP server added successfully");
      }

      onSave();
      onClose();
    } catch (error) {
      console.error("Error saving MCP server:", error);
      showError("Failed to save MCP server");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid w-full gap-1.5">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="My MCP Server"
        />
      </div>

      <div className="grid w-full gap-1.5">
        <Label htmlFor="transport">Transport</Label>
        <Select
          value={formData.transport}
          onValueChange={(value: "stdio" | "http") =>
            setFormData({ ...formData, transport: value })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="stdio">Standard I/O</SelectItem>
            <SelectItem value="http">HTTP</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {formData.transport === "stdio" && (
        <>
          <div className="grid w-full gap-1.5">
            <Label htmlFor="command">Command</Label>
            <Input
              id="command"
              value={formData.command}
              onChange={(e) => setFormData({ ...formData, command: e.target.value })}
              placeholder="python -m my_mcp_server"
            />
          </div>

          <div className="grid w-full gap-1.5">
            <Label htmlFor="args">Arguments (space-separated)</Label>
            <Input
              id="args"
              value={argsText}
              onChange={(e) => setArgsText(e.target.value)}
              placeholder="--config config.json --verbose"
            />
          </div>

          <div className="grid w-full gap-1.5">
            <Label htmlFor="env">Environment Variables (KEY=value, one per line)</Label>
            <textarea
              id="env"
              value={envText}
              onChange={(e) => setEnvText(e.target.value)}
              placeholder="API_KEY=your_key_here&#10;DEBUG=true"
              className="min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
        </>
      )}

      {formData.transport === "http" && (
        <div className="grid w-full gap-1.5">
          <Label htmlFor="url">URL</Label>
          <Input
            id="url"
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            placeholder="http://localhost:8000/sse"
          />
        </div>
      )}

      <div className="flex items-center space-x-2">
        <Switch
          id="enabled"
          checked={formData.isEnabled}
          onCheckedChange={(enabled) => setFormData({ ...formData, isEnabled: enabled })}
        />
        <Label htmlFor="enabled">Enable server</Label>
      </div>

      <div className="flex justify-between pt-4">
        <Button
          variant="outline"
          onClick={handleTest}
          disabled={testing || saving}
        >
          {testing ? (
            <>
              <TestTube className="h-4 w-4 mr-2 animate-spin" />
              Testing...
            </>
          ) : (
            <>
              <TestTube className="h-4 w-4 mr-2" />
              Test Connection
            </>
          )}
        </Button>

        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : server ? "Update" : "Add"}
          </Button>
        </div>
      </div>
    </div>
  );
}