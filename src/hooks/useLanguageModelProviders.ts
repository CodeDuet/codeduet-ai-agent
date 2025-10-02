import { useQuery } from "@tanstack/react-query";
import { IpcClient } from "@/ipc/ipc_client";
import type { LanguageModelProvider } from "@/ipc/ipc_types";
import { useSettings } from "./useSettings";
import { cloudProviders, VertexProviderSetting } from "@/lib/schemas";

export function useLanguageModelProviders() {
  const ipcClient = IpcClient.getInstance();
  const { settings, envVars } = useSettings();

  const queryResult = useQuery<LanguageModelProvider[], Error>({
    queryKey: ["languageModelProviders"],
    queryFn: async () => {
      return ipcClient.getLanguageModelProviders();
    },
  });

  const isProviderSetup = (provider: string) => {
    const providerSettings = settings?.providerSettings[provider];
    if (queryResult.isLoading) {
      return false;
    }
    
    const providerData = queryResult.data?.find((p) => p.id === provider);
    
    // Local providers are always considered "setup" 
    if (providerData?.type === "local") {
      return true;
    }
    
    // Vertex uses service account credentials instead of an API key
    if (provider === "vertex") {
      const vertexSettings = providerSettings as VertexProviderSetting;
      if (
        vertexSettings?.serviceAccountKey?.value &&
        vertexSettings?.projectId &&
        vertexSettings?.location
      ) {
        return true;
      }
      return false;
    }
    
    // Cloud and custom providers need API keys
    if (providerSettings?.apiKey?.value) {
      return true;
    }
    
    if (providerData?.envVarName && envVars[providerData.envVarName]) {
      return true;
    }
    
    return false;
  };

  const isAnyProviderSetup = () => {
    // Check if any cloud provider is set up
    const hasCloudProvider = cloudProviders.some((provider) =>
      isProviderSetup(provider),
    );

    // Check if a local model is selected (ollama or lmstudio)
    const hasLocalModel =
      settings?.selectedModel?.provider === "ollama" ||
      settings?.selectedModel?.provider === "lmstudio";

    return hasCloudProvider || hasLocalModel;
  };

  return {
    ...queryResult,
    isProviderSetup,
    isAnyProviderSetup,
  };
}
