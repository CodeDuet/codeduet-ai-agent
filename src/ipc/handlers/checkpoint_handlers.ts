import { ipcMain } from "electron";
import { db } from "../../db";
import { chats } from "../../db/schema";
import { eq } from "drizzle-orm";
import { resolveAppPath } from "../../paths/paths";
import {
  undoMessage,
  restoreToCheckpoint,
  getChatCheckpoints,
  cleanupOldCheckpoints,
} from "../utils/checkpoint_utils";
import log from "electron-log";
import { createLoggedHandler } from "./safe_handle";

const logger = log.scope("checkpoint_handlers");
const handle = createLoggedHandler(logger);

export function registerCheckpointHandlers() {
  handle("checkpoint:undo-message", async (_, messageId: number, chatId: number) => {
    logger.log(`Undoing message ${messageId} in chat ${chatId}`);

    // Get the app path for this chat
    const chat = await db.query.chats.findFirst({
      where: eq(chats.id, chatId),
      with: {
        app: true,
      },
    });

    if (!chat?.app) {
      throw new Error(`Chat or app not found for chat ID: ${chatId}`);
    }

    const appPath = resolveAppPath(chat.app.path);

    const result = await undoMessage({
      messageId,
      chatId,
      appPath,
    });

    if (!result.success) {
      throw new Error(`Failed to undo message: ${result.error}`);
    }

    logger.log(`Successfully undid message ${messageId}`);
    return result;
  });

  handle("checkpoint:restore", async (_, checkpointHash: string, chatId: number) => {
    logger.log(`Restoring to checkpoint ${checkpointHash} in chat ${chatId}`);

    // Get the app path for this chat
    const chat = await db.query.chats.findFirst({
      where: eq(chats.id, chatId),
      with: {
        app: true,
      },
    });

    if (!chat?.app) {
      throw new Error(`Chat or app not found for chat ID: ${chatId}`);
    }

    const appPath = resolveAppPath(chat.app.path);

    const result = await restoreToCheckpoint({
      appPath,
      checkpointHash,
      createCommit: true,
      commitMessage: `[restore] Manual restore to checkpoint ${checkpointHash.slice(0, 7)}`,
    });

    if (!result.success) {
      throw new Error(`Failed to restore checkpoint: ${result.error}`);
    }

    logger.log(`Successfully restored to checkpoint ${checkpointHash}`);
    return result;
  });

  handle("checkpoint:get-chat-checkpoints", async (_, chatId: number) => {
    logger.log(`Getting checkpoints for chat ${chatId}`);
    return await getChatCheckpoints(chatId);
  });

  handle("checkpoint:cleanup", async (_, chatId: number, keepLatest: number = 10) => {
    logger.log(`Cleaning up old checkpoints for chat ${chatId}, keeping latest ${keepLatest}`);
    await cleanupOldCheckpoints(chatId, keepLatest);
    return { success: true };
  });
}