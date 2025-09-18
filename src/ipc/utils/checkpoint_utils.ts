import { db } from "../../db";
import { messages } from "../../db/schema";
import { eq } from "drizzle-orm";
import { gitCommit, gitStageToRevert } from "./git_utils";
import { resolveAppPath } from "../../paths/paths";
import git from "isomorphic-git";
import fs from "node:fs";
import log from "electron-log";

const logger = log.scope("checkpoint_utils");

interface CheckpointOptions {
  appPath: string;
  chatId: number;
  messageId?: number;
  description?: string;
}

interface CheckpointResult {
  checkpointHash: string;
  success: boolean;
  error?: string;
}

/**
 * Creates a checkpoint (commit) before AI changes are applied
 * This allows for easy rollback to the state before the AI interaction
 */
export async function createCheckpoint({
  appPath,
  chatId,
  messageId,
  description,
}: CheckpointOptions): Promise<CheckpointResult> {
  try {
    logger.log(`Creating checkpoint for chat ${chatId}`);

    // Check if there are any uncommitted changes to include in checkpoint
    const statusMatrix = await git.statusMatrix({ fs, dir: appPath });
    const hasUncommittedChanges = statusMatrix.some(
      (row) => row[1] !== 1 || row[2] !== 1 || row[3] !== 1
    );

    let checkpointHash: string;

    if (hasUncommittedChanges) {
      // Stage all changes before creating checkpoint
      await git.add({
        fs,
        dir: appPath,
        filepath: ".",
      });

      // Create commit with pending changes
      const commitMessage = description
        ? `[checkpoint] ${description}`
        : `[checkpoint] Before AI changes - Chat ${chatId}`;

      checkpointHash = await gitCommit({
        path: appPath,
        message: commitMessage,
      });

      logger.log(
        `Created checkpoint with uncommitted changes: ${checkpointHash}`
      );
    } else {
      // No uncommitted changes, use current HEAD as checkpoint
      checkpointHash = await git.resolveRef({
        fs,
        dir: appPath,
        ref: "HEAD",
      });

      logger.log(`Using current HEAD as checkpoint: ${checkpointHash}`);
    }

    // Store checkpoint hash in message if messageId provided
    if (messageId) {
      await db
        .update(messages)
        .set({
          checkpointHash,
          isCheckpoint: true,
        })
        .where(eq(messages.id, messageId));

      logger.log(`Stored checkpoint hash in message ${messageId}`);
    }

    return {
      checkpointHash,
      success: true,
    };
  } catch (error) {
    logger.error("Error creating checkpoint:", error);
    return {
      checkpointHash: "",
      success: false,
      error: (error as Error).message,
    };
  }
}

interface RestoreCheckpointOptions {
  appPath: string;
  checkpointHash: string;
  createCommit?: boolean;
  commitMessage?: string;
}

/**
 * Restores the codebase to a specific checkpoint
 */
export async function restoreToCheckpoint({
  appPath,
  checkpointHash,
  createCommit = true,
  commitMessage,
}: RestoreCheckpointOptions): Promise<CheckpointResult> {
  try {
    logger.log(`Restoring to checkpoint: ${checkpointHash}`);

    // Use existing gitStageToRevert function to revert to checkpoint
    await gitStageToRevert({
      path: appPath,
      targetOid: checkpointHash,
    });

    let resultHash = checkpointHash;

    if (createCommit) {
      // Create a commit to record the restoration
      const message =
        commitMessage ||
        `[restore] Restored to checkpoint ${checkpointHash.slice(0, 7)}`;

      resultHash = await gitCommit({
        path: appPath,
        message,
      });

      logger.log(`Created restoration commit: ${resultHash}`);
    }

    return {
      checkpointHash: resultHash,
      success: true,
    };
  } catch (error) {
    logger.error("Error restoring checkpoint:", error);
    return {
      checkpointHash: "",
      success: false,
      error: (error as Error).message,
    };
  }
}

interface UndoMessageOptions {
  messageId: number;
  chatId: number;
  appPath: string;
}

/**
 * Undoes changes made by a specific AI message by restoring to its checkpoint
 */
export async function undoMessage({
  messageId,
  chatId,
  appPath,
}: UndoMessageOptions): Promise<CheckpointResult> {
  try {
    logger.log(`Undoing message ${messageId} in chat ${chatId}`);

    // Get the message and its checkpoint
    const message = await db.query.messages.findFirst({
      where: eq(messages.id, messageId),
    });

    if (!message) {
      throw new Error(`Message ${messageId} not found`);
    }

    if (!message.checkpointHash) {
      throw new Error(`No checkpoint found for message ${messageId}`);
    }

    // Restore to the checkpoint
    const result = await restoreToCheckpoint({
      appPath,
      checkpointHash: message.checkpointHash,
      createCommit: true,
      commitMessage: `[undo] Undid changes from message ${messageId}`,
    });

    if (result.success) {
      logger.log(`Successfully undid message ${messageId}`);
    }

    return result;
  } catch (error) {
    logger.error("Error undoing message:", error);
    return {
      checkpointHash: "",
      success: false,
      error: (error as Error).message,
    };
  }
}

/**
 * Gets checkpoint information for a chat's messages
 */
export async function getChatCheckpoints(chatId: number) {
  const chatMessages = await db.query.messages.findMany({
    where: eq(messages.chatId, chatId),
    columns: {
      id: true,
      role: true,
      checkpointHash: true,
      commitHash: true,
      isCheckpoint: true,
      createdAt: true,
    },
    orderBy: (messages, { asc }) => [asc(messages.createdAt)],
  });

  return chatMessages.filter(
    (msg) => msg.checkpointHash && msg.role === "assistant"
  );
}

/**
 * Cleans up old checkpoints to prevent git history bloat
 * This is optional and can be called periodically
 */
export async function cleanupOldCheckpoints(
  chatId: number,
  keepLatest: number = 10
) {
  try {
    const checkpoints = await getChatCheckpoints(chatId);

    if (checkpoints.length <= keepLatest) {
      return; // Nothing to clean up
    }

    // Keep the most recent checkpoints, mark others for cleanup
    const toCleanup = checkpoints.slice(0, -keepLatest);

    logger.log(
      `Cleaning up ${toCleanup.length} old checkpoints for chat ${chatId}`
    );

    // Remove checkpoint flags from old messages
    for (const checkpoint of toCleanup) {
      await db
        .update(messages)
        .set({
          isCheckpoint: false,
          checkpointHash: null,
        })
        .where(eq(messages.id, checkpoint.id));
    }

    logger.log(`Cleaned up old checkpoints for chat ${chatId}`);
  } catch (error) {
    logger.error("Error cleaning up checkpoints:", error);
  }
}