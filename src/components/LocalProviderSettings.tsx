import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { useNavigate } from "@tanstack/react-router";
import { providerSettingsRoute } from "@/routes/settings/providers/$provider";
import type { LanguageModelProvider } from "@/ipc/ipc_types";

import { useLanguageModelProviders } from "@/hooks/useLanguageModelProviders";
import { ExternalLink, Play, Square, AlertCircle } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import { IpcClient } from "@/ipc/ipc_client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { LocalModel } from "@/ipc/ipc_types";

interface ProviderStatus {
  isRunning: boolean;
  models: LocalModel[];
  error?: string;
}

export function LocalProviderSettings() {
  const navigate = useNavigate();
  const [ollamaStatus, setOllamaStatus] = useState<ProviderStatus>({
    isRunning: false,
    models: [],
  });
  const [lmstudioStatus, setLMStudioStatus] = useState<ProviderStatus>({
    isRunning: false,
    models: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  const {
    data: providers,
    isLoading: providersLoading,
    error,
  } = useLanguageModelProviders();

  const localProviders = providers?.filter((p) => p.type === "local") || [];

  const checkProviderStatus = async () => {
    setIsLoading(true);
    const ipcClient = IpcClient.getInstance();

    // Check Ollama status
    try {
      const ollamaModels = await ipcClient.listLocalOllamaModels();
      setOllamaStatus({
        isRunning: true,
        models: ollamaModels,
      });
    } catch (error) {
      setOllamaStatus({
        isRunning: false,
        models: [],
        error: error instanceof Error ? error.message : "Connection failed",
      });
    }

    // Check LM Studio status
    try {
      const lmstudioModels = await ipcClient.listLocalLMStudioModels();
      setLMStudioStatus({
        isRunning: true,
        models: lmstudioModels,
      });
    } catch (error) {
      setLMStudioStatus({
        isRunning: false,
        models: [],
        error: error instanceof Error ? error.message : "Connection failed",
      });
    }

    setIsLoading(false);
  };

  useEffect(() => {
    checkProviderStatus();
  }, []);

  const handleProviderClick = (providerId: string) => {
    navigate({
      to: providerSettingsRoute.id,
      params: { provider: providerId },
    });
  };

  const openExternalLink = (url: string) => {
    IpcClient.getInstance().openExternalUrl(url);
  };

  if (providersLoading || isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium">Local AI Providers</h2>
          <Skeleton className="h-8 w-20" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <Card key={i} className="border-border">
              <CardHeader className="p-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h2 className="text-lg font-medium mb-6">Local AI Providers</h2>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load local providers: {error.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const getProviderStatus = (providerId: string) => {
    if (providerId === "ollama") return ollamaStatus;
    if (providerId === "lmstudio") return lmstudioStatus;
    return { isRunning: false, models: [] };
  };

  const getProviderInfo = (providerId: string) => {
    const info = {
      ollama: {
        website: "https://ollama.ai",
        description: "Run large language models locally",
        installText: "Install Ollama",
        port: "11434",
      },
      lmstudio: {
        website: "https://lmstudio.ai",
        description: "Discover, download, and run local LLMs",
        installText: "Download LM Studio",
        port: "1234",
      },
    };
    return info[providerId as keyof typeof info];
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-medium">Local AI Providers</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Run AI models locally for privacy and cost efficiency
          </p>
        </div>
        <Button
          onClick={checkProviderStatus}
          variant="outline"
          size="sm"
          disabled={isLoading}
        >
          {isLoading ? "Checking..." : "Refresh"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {localProviders.map((provider: LanguageModelProvider) => {
          const status = getProviderStatus(provider.id);
          const info = getProviderInfo(provider.id);

          return (
            <Card
              key={provider.id}
              className="relative transition-all hover:shadow-md border-border"
            >
              <CardHeader className="p-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-medium flex items-center gap-2">
                    {provider.name}
                    {status.isRunning ? (
                      <Badge
                        variant="secondary"
                        className="text-green-600 bg-green-50 dark:bg-green-900/30"
                      >
                        <Play className="h-3 w-3 mr-1" />
                        Running
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="text-gray-500 bg-gray-100 dark:bg-gray-800"
                      >
                        <Square className="h-3 w-3 mr-1" />
                        Stopped
                      </Badge>
                    )}
                  </CardTitle>
                </div>
                <CardDescription className="text-sm">
                  {info?.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="p-4 pt-0 space-y-3">
                {status.isRunning ? (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {status.models.length} model(s) available
                    </p>
                    {status.models.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {status.models.slice(0, 3).map((model) => (
                          <Badge
                            key={model.modelName}
                            variant="outline"
                            className="text-xs"
                          >
                            {model.displayName}
                          </Badge>
                        ))}
                        {status.models.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{status.models.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}
                    <Button
                      onClick={() => handleProviderClick(provider.id)}
                      className="w-full"
                      size="sm"
                    >
                      Configure Models
                    </Button>
                  </div>
                ) : (
                  <div>
                    {status.error && (
                      <Alert className="mb-3">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-sm">
                          {status.error.includes("fetch failed") ||
                          status.error.includes("Connection")
                            ? `${provider.name} is not running or not accessible on port ${info?.port}`
                            : status.error}
                        </AlertDescription>
                      </Alert>
                    )}
                    <div className="space-y-2">
                      <Button
                        onClick={() =>
                          info?.website && openExternalLink(info.website)
                        }
                        variant="outline"
                        className="w-full"
                        size="sm"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        {info?.installText}
                      </Button>
                      <p className="text-xs text-muted-foreground text-center">
                        Expected port: {info?.port}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {localProviders.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No local providers configured</p>
        </div>
      )}
    </div>
  );
}
