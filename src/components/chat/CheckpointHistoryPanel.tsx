import { useState } from "react";
import { useCheckpoints } from "@/hooks/useCheckpoints";
import { formatDistanceToNow } from "date-fns";
import { History, RotateCcw, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface CheckpointHistoryPanelProps {
  chatId: number | null;
  className?: string;
}

export function CheckpointHistoryPanel({ chatId, className }: CheckpointHistoryPanelProps) {
  const { checkpoints, isLoading, undoMessage, restoreToCheckpoint, cleanupOldCheckpoints } = useCheckpoints(chatId);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleUndoMessage = async (messageId: number) => {
    setActionLoading(`undo-${messageId}`);
    try {
      const result = await undoMessage(messageId);
      if (!result.success) {
        console.error('Failed to undo message:', result.error);
        // You could show a toast error here
      }
    } catch (error) {
      console.error('Error undoing message:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRestoreCheckpoint = async (checkpointHash: string) => {
    setActionLoading(`restore-${checkpointHash}`);
    try {
      const result = await restoreToCheckpoint(checkpointHash);
      if (!result.success) {
        console.error('Failed to restore checkpoint:', result.error);
        // You could show a toast error here
      }
    } catch (error) {
      console.error('Error restoring checkpoint:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCleanup = async () => {
    setActionLoading('cleanup');
    try {
      await cleanupOldCheckpoints(5); // Keep latest 5 checkpoints
    } catch (error) {
      console.error('Error cleaning up checkpoints:', error);
    } finally {
      setActionLoading(null);
    }
  };

  if (!chatId) {
    return (
      <div className={cn("p-4 text-center text-gray-500", className)}>
        No chat selected
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={cn("p-4 flex items-center justify-center", className)}>
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        Loading checkpoints...
      </div>
    );
  }

  if (checkpoints.length === 0) {
    return (
      <div className={cn("p-4 text-center text-gray-500", className)}>
        <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No checkpoints available</p>
        <p className="text-xs mt-1">Checkpoints are created automatically when AI makes changes</p>
      </div>
    );
  }

  return (
    <div className={cn("", className)}>
      <div className="p-3 border-b border-border flex items-center justify-between">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <History className="h-4 w-4" />
          Checkpoints ({checkpoints.length})
        </h3>
        {checkpoints.length > 5 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCleanup}
                disabled={actionLoading === 'cleanup'}
              >
                {actionLoading === 'cleanup' ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Trash2 className="h-3 w-3" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Clean up old checkpoints (keep latest 5)
            </TooltipContent>
          </Tooltip>
        )}
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {checkpoints.map((checkpoint, index) => (
          <div
            key={checkpoint.id}
            className="p-3 border-b border-border last:border-b-0 hover:bg-background-lightest"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                    Checkpoint {checkpoints.length - index}
                  </span>
                  <span className="text-xs text-gray-500">
                    {checkpoint.checkpointHash?.slice(0, 7)}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(checkpoint.createdAt), { addSuffix: true })}
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleUndoMessage(checkpoint.id)}
                      disabled={actionLoading === `undo-${checkpoint.id}`}
                      className="h-7 w-7 p-0"
                    >
                      {actionLoading === `undo-${checkpoint.id}` ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <RotateCcw className="h-3 w-3" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    Undo changes from this message
                  </TooltipContent>
                </Tooltip>
                
                {checkpoint.checkpointHash && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRestoreCheckpoint(checkpoint.checkpointHash!)}
                        disabled={actionLoading === `restore-${checkpoint.checkpointHash}`}
                        className="h-7 w-7 p-0"
                      >
                        {actionLoading === `restore-${checkpoint.checkpointHash}` ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <History className="h-3 w-3" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      Restore to this checkpoint
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}