import { useState } from "react";
import { IpcClient } from "@/ipc/ipc_client";
import { showError, showSuccess } from "@/lib/toast";

export function useOpenInIde() {
  const [isLoading, setIsLoading] = useState(false);

  const openInIde = async (appId: number, ide: "vscode" | "cursor") => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const ipcClient = IpcClient.getInstance();
      // First, get the app details to get the path
      const app = await ipcClient.getApp(appId);
      if (!app) {
        throw new Error("App not found");
      }

      await ipcClient.openInIde({
        projectPath: app.path,
        ide,
      });

      const ideName = ide === "vscode" ? "VS Code" : "Cursor";
      showSuccess(`Opening project in ${ideName}...`);
    } catch (error) {
      console.error(`Failed to open in ${ide}:`, error);
      const ideName = ide === "vscode" ? "VS Code" : "Cursor";
      const errorMessage =
        error instanceof Error ? error.message : `Failed to open in ${ideName}`;
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const openInVSCode = (appId: number) => openInIde(appId, "vscode");
  const openInCursor = (appId: number) => openInIde(appId, "cursor");

  return {
    openInVSCode,
    openInCursor,
    isLoading,
  };
}
