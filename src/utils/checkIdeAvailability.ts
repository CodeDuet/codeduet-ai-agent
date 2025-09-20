import { IpcClient } from "@/ipc/ipc_client";

export type { IdeAvailability } from "@/ipc/ipc_types";

/**
 * Check availability of both IDEs via IPC
 */
export async function checkIdeAvailability() {
  const ipcClient = IpcClient.getInstance();
  return await ipcClient.checkIdeAvailability();
}
