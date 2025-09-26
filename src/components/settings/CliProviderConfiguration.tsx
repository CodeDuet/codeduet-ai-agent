import { useState, useEffect } from "react";
import {
  Info,
  ExternalLink,
  RefreshCw,
  Terminal,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IpcClient } from "@/ipc/ipc_client";
import type { LanguageModelProvider } from "@/ipc/ipc_types";

interface CliProviderConfigurationProps {
  provider: string;
  providerDisplayName: string;
  providerData?: LanguageModelProvider;
}

interface CliStatus {
  isAvailable: boolean;
  version?: string;
  error?: string;
  command?: string;
}

const CLI_INFO = {
  "claude-code": {
    description: "Use Claude Code CLI for AI-powered development",
    website: "https://claude.com/product/claude-code",
    installCommand: "Install via: https://claude.com/product/claude-code",
    checkCommand: "claude code --version",
    setupInstructions: [
      "Install Claude Code CLI from https://claude.com/product/claude-code",
      "Authenticate with your Claude account",
      "Verify installation by running 'claude code --version'",
    ],
  },
  codex: {
    description: "Use OpenAI's Codex CLI for code generation",
    website: "https://developers.openai.com/codex/cli/",
    installCommand: "Install via: npm install -g @openai/codex-cli",
    checkCommand: "codex --version",
    setupInstructions: [
      "Install Codex CLI via npm: npm install -g @openai/codex-cli",
      "Set your OpenAI API key",
      "Verify installation by running 'codex --version'",
    ],
  },
  codeduet: {
    description: "Use CodeDuet CLI for collaborative AI development",
    website: "https://github.com/CodeDuet/codeduet-cli",
    installCommand: "Install via: npm install -g codeduet-cli",
    checkCommand: "codeduet --version",
    setupInstructions: [
      "Install CodeDuet CLI via npm: npm install -g codeduet-cli",
      "Configure your preferred AI provider",
      "Verify installation by running 'codeduet --version'",
    ],
  },
  qwen: {
    description: "Use QWEN CLI for advanced code understanding",
    website: "https://github.com/QwenLM/qwen-code",
    installCommand: "Install from: https://github.com/QwenLM/qwen-code",
    checkCommand: "qwen-code --version",
    setupInstructions: [
      "Clone and install from https://github.com/QwenLM/qwen-code",
      "Set up the required dependencies",
      "Verify installation by running 'qwen-code --version'",
    ],
  },
};

export function CliProviderConfiguration({
  provider,
  providerDisplayName,
  providerData,
}: CliProviderConfigurationProps) {
  const [status, setStatus] = useState<CliStatus>({
    isAvailable: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [customCommand, setCustomCommand] = useState("");

  // Extract CLI type from provider ID (e.g., "cli-claude-code" -> "claude-code")
  const cliType = provider.replace("cli-", "") as keyof typeof CLI_INFO;
  const cliInfo = CLI_INFO[cliType];
  
  const defaultCommand = providerData?.cliCommand || cliInfo?.checkCommand?.split(" ")[0] || cliType;

  const checkCliAvailability = async () => {
    setIsLoading(true);
    
    try {
      const command = customCommand || defaultCommand;
      const result = await IpcClient.getInstance().checkCliAvailability({
        command,
        type: cliType,
      });
      
      setStatus(result);
    } catch (error: any) {
      console.error("Failed to check CLI availability:", error);
      setStatus({
        isAvailable: false,
        error: error.message || "Failed to check CLI availability",
        command: customCommand || defaultCommand,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkCliAvailability();
  }, [provider, customCommand]);

  const openExternalLink = (url: string) => {
    IpcClient.getInstance().openExternalUrl(url);
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Terminal className="h-5 w-5" />
            CLI Status
          </CardTitle>
          <CardDescription>{cliInfo?.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Status:</span>
              {status.isAvailable ? (
                <Badge className="bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Available
                </Badge>
              ) : (
                <Badge
                  variant="secondary"
                  className="bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700"
                >
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Not Available
                </Badge>
              )}
            </div>
            <Button
              onClick={checkCliAvailability}
              disabled={isLoading}
              size="sm"
              variant="outline"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
              />
              {isLoading ? "Checking..." : "Refresh"}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Command:</span>
              <p className="text-muted-foreground mt-1 font-mono">{status.command}</p>
            </div>
            <div>
              <span className="font-medium">Version:</span>
              <p className="text-muted-foreground mt-1">{status.version || "Unknown"}</p>
            </div>
          </div>

          {status.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>CLI Not Available</AlertTitle>
              <AlertDescription>
                {status.error.includes("command not found") ||
                status.error.includes("not recognized")
                  ? `${providerDisplayName} CLI is not installed or not in your PATH. Please install it first.`
                  : status.error}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Setup Instructions */}
      {!status.isAvailable && cliInfo && (
        <Card>
          <CardHeader>
            <CardTitle>Setup Instructions</CardTitle>
            <CardDescription>
              Follow these steps to set up {providerDisplayName}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {cliInfo.setupInstructions.map((instruction, index) => (
                <div key={index} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                    {index + 1}
                  </span>
                  <span className="text-sm">{instruction}</span>
                </div>
              ))}
            </div>

            <div className="bg-muted p-3 rounded-md">
              <p className="text-sm font-medium mb-1">Installation:</p>
              <code className="text-sm text-muted-foreground">{cliInfo.installCommand}</code>
            </div>

            <div className="flex gap-3 pt-3">
              <Button
                onClick={() => openExternalLink(cliInfo.website)}
                variant="outline"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Visit {providerDisplayName} Website
              </Button>
              <Button onClick={checkCliAvailability} disabled={isLoading}>
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
                />
                Test Installation
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Advanced Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Advanced Configuration</CardTitle>
          <CardDescription>
            Customize the CLI command for {providerDisplayName}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="custom-command">Custom CLI Command</Label>
            <Input
              id="custom-command"
              value={customCommand}
              onChange={(e) => setCustomCommand(e.target.value)}
              placeholder={defaultCommand}
            />
            <p className="text-xs text-muted-foreground">
              Leave empty to use the default command: {defaultCommand}
            </p>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Note</AlertTitle>
            <AlertDescription>
              The CLI command must be available in your system PATH or provide the full path to the executable.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}