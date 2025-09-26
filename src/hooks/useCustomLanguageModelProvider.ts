import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IpcClient } from "@/ipc/ipc_client";
import type {
  CreateCustomLanguageModelProviderParams,
  LanguageModelProvider,
} from "@/ipc/ipc_types";
import { showError } from "@/lib/toast";

export function useCustomLanguageModelProvider() {
  const queryClient = useQueryClient();
  const ipcClient = IpcClient.getInstance();

  const createProviderMutation = useMutation({
    mutationFn: async (
      params: CreateCustomLanguageModelProviderParams,
    ): Promise<LanguageModelProvider> => {
      if (!params.id.trim()) {
        throw new Error("Provider ID is required");
      }
      if (!params.name.trim()) {
        throw new Error("Provider name is required");
      }
      
      // Validate based on provider type
      if (params.type === "cli") {
        if (!params.cliType) {
          throw new Error("CLI type is required for CLI providers");
        }
        if (!params.cliCommand?.trim()) {
          throw new Error("CLI command is required for CLI providers");
        }
      } else if (!params.apiBaseUrl?.trim()) {
        throw new Error("API base URL is required for non-CLI providers");
      }

      return ipcClient.createCustomLanguageModelProvider({
        id: params.id.trim(),
        name: params.name.trim(),
        apiBaseUrl: params.type === "cli" ? undefined : params.apiBaseUrl?.trim(),
        envVarName: params.envVarName?.trim() || undefined,
        type: params.type,
        cliType: params.cliType,
        cliCommand: params.cliCommand?.trim(),
      });
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["languageModelProviders"] });
    },
    onError: (error) => {
      showError(error);
    },
  });

  const deleteProviderMutation = useMutation({
    mutationFn: async (providerId: string): Promise<void> => {
      if (!providerId) {
        throw new Error("Provider ID is required");
      }

      return ipcClient.deleteCustomLanguageModelProvider(providerId);
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["languageModelProviders"] });
    },
    onError: (error) => {
      showError(error);
    },
  });

  const createProvider = async (
    params: CreateCustomLanguageModelProviderParams,
  ): Promise<LanguageModelProvider> => {
    return createProviderMutation.mutateAsync(params);
  };

  const deleteProvider = async (providerId: string): Promise<void> => {
    return deleteProviderMutation.mutateAsync(providerId);
  };

  return {
    createProvider,
    deleteProvider,
    isCreating: createProviderMutation.isPending,
    isDeleting: deleteProviderMutation.isPending,
    error: createProviderMutation.error || deleteProviderMutation.error,
  };
}
