import { useState, useEffect } from "react";
import { IpcClient } from "@/ipc/ipc_client";
import type { CheckpointInfo, CheckpointResult } from "@/ipc/ipc_types";

export function useCheckpoints(chatId: number | null) {
  const [checkpoints, setCheckpoints] = useState<CheckpointInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCheckpoints = async () => {
    if (!chatId) {
      setCheckpoints([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const result = await IpcClient.getInstance().getChatCheckpoints(chatId);
      setCheckpoints(result);
    } catch (err) {
      console.error("Failed to fetch checkpoints:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  const undoMessage = async (messageId: number): Promise<CheckpointResult> => {
    if (!chatId) {
      throw new Error("No chat ID provided");
    }

    const result = await IpcClient.getInstance().undoMessage(messageId, chatId);
    if (result.success) {
      // Refresh checkpoints after successful undo
      await fetchCheckpoints();
    }
    return result;
  };

  const restoreToCheckpoint = async (checkpointHash: string): Promise<CheckpointResult> => {
    if (!chatId) {
      throw new Error("No chat ID provided");
    }

    const result = await IpcClient.getInstance().restoreToCheckpoint(checkpointHash, chatId);
    if (result.success) {
      // Refresh checkpoints after successful restore
      await fetchCheckpoints();
    }
    return result;
  };

  const cleanupOldCheckpoints = async (keepLatest?: number): Promise<{ success: boolean }> => {
    if (!chatId) {
      throw new Error("No chat ID provided");
    }

    const result = await IpcClient.getInstance().cleanupCheckpoints(chatId, keepLatest);
    if (result.success) {
      // Refresh checkpoints after cleanup
      await fetchCheckpoints();
    }
    return result;
  };

  useEffect(() => {
    fetchCheckpoints();
  }, [chatId]);

  return {
    checkpoints,
    isLoading,
    error,
    fetchCheckpoints,
    undoMessage,
    restoreToCheckpoint,
    cleanupOldCheckpoints,
  };
}