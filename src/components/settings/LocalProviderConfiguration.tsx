import { useState, useEffect } from "react";
import { Info, ExternalLink, RefreshCw, Server, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IpcClient } from "@/ipc/ipc_client";
import type { LocalModel } from "@/ipc/ipc_types";

interface LocalProviderConfigurationProps {
  provider: string;
  providerDisplayName: string;
}

interface ProviderStatus {
  isConnected: boolean;
  models: LocalModel[];
  error?: string;
  baseUrl?: string;
}

export function LocalProviderConfiguration({
  provider,
  providerDisplayName,
}: LocalProviderConfigurationProps) {
  const [status, setStatus] = useState<ProviderStatus>({
    isConnected: false,
    models: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [customUrl, setCustomUrl] = useState("");

  const defaultUrls = {
    ollama: "http://localhost:11434",
    lmstudio: "http://localhost:1234",
  };

  const providerInfo = {
    ollama: {
      description: "Connect to your local Ollama installation to use open-source models",
      website: "https://ollama.ai",
      defaultPort: "11434",
      setupInstructions: [
        "Install Ollama from ollama.ai",
        "Run 'ollama serve' to start the server",
        "Pull models with 'ollama pull model-name'",
      ],
    },
    lmstudio: {
      description: "Connect to LM Studio for a user-friendly local model interface",
      website: "https://lmstudio.ai", 
      defaultPort: "1234",
      setupInstructions: [
        "Download and install LM Studio",
        "Start a local server in LM Studio",
        "Load a model in the Local Server tab",
      ],
    },
  };

  const currentProviderInfo = providerInfo[provider as keyof typeof providerInfo];
  const defaultUrl = defaultUrls[provider as keyof typeof defaultUrls];

  const checkConnection = async () => {
    setIsLoading(true);
    const ipcClient = IpcClient.getInstance();

    try {
      let models: LocalModel[] = [];
      
      if (provider === "ollama") {
        models = await ipcClient.listLocalOllamaModels();
      } else if (provider === "lmstudio") {
        models = await ipcClient.listLocalLMStudioModels();
      }

      setStatus({
        isConnected: true,
        models,
        baseUrl: customUrl || defaultUrl,
      });
    } catch (error) {
      setStatus({
        isConnected: false,
        models: [],
        error: error instanceof Error ? error.message : "Connection failed",
        baseUrl: customUrl || defaultUrl,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkConnection();
  }, [provider]);

  const openExternalLink = (url: string) => {
    IpcClient.getInstance().openExternalUrl(url);
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Connection Status
          </CardTitle>
          <CardDescription>
            {currentProviderInfo?.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Status:</span>
              {status.isConnected ? (
                <Badge className="bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
                  Connected
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700">
                  Disconnected
                </Badge>
              )}
            </div>
            <Button
              onClick={checkConnection}
              disabled={isLoading}
              size="sm"
              variant="outline"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              {isLoading ? "Checking..." : "Refresh"}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Server URL:</span>
              <p className="text-muted-foreground mt-1">{status.baseUrl}</p>
            </div>
            <div>
              <span className="font-medium">Models Available:</span>
              <p className="text-muted-foreground mt-1">{status.models.length} model(s)</p>
            </div>
          </div>

          {status.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Connection Error</AlertTitle>
              <AlertDescription>
                {status.error.includes("fetch failed") || status.error.includes("connect")
                  ? `Could not connect to ${providerDisplayName}. Make sure it's running on port ${currentProviderInfo?.defaultPort}.`
                  : status.error}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Available Models */}
      {status.isConnected && status.models.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Available Models</CardTitle>
            <CardDescription>
              Models currently available in your {providerDisplayName} installation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {status.models.map((model) => (
                <div
                  key={model.modelName}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <div className="font-medium">{model.displayName}</div>
                    <div className="text-sm text-muted-foreground">{model.modelName}</div>
                  </div>
                  <Badge variant="outline">{model.provider}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Setup Instructions */}
      {!status.isConnected && (
        <Card>
          <CardHeader>
            <CardTitle>Setup Instructions</CardTitle>
            <CardDescription>
              Follow these steps to set up {providerDisplayName}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {currentProviderInfo?.setupInstructions.map((instruction, index) => (
                <div key={index} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                    {index + 1}
                  </span>
                  <span className="text-sm">{instruction}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-3">
              <Button
                onClick={() => currentProviderInfo?.website && openExternalLink(currentProviderInfo.website)}
                variant="outline"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Visit {providerDisplayName} Website
              </Button>
              <Button
                onClick={checkConnection}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                Test Connection
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
            Customize the connection settings for {providerDisplayName}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="custom-url">Custom Server URL</Label>
            <Input
              id="custom-url"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder={defaultUrl}
            />
            <p className="text-xs text-muted-foreground">
              Leave empty to use the default URL: {defaultUrl}
            </p>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Note</AlertTitle>
            <AlertDescription>
              Custom URLs will be saved as environment variables. The {providerDisplayName} server must be accessible from this application.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}