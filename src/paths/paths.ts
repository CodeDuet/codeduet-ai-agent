import path from "node:path";
import os from "node:os";
import { IS_TEST_BUILD } from "../ipc/utils/test_utils";

export function getCodeDuetAppPath(appPath: string): string {
  if (IS_TEST_BUILD) {
    const electron = getElectron();
    return path.join(
      electron!.app.getPath("userData"),
      "codeduet-apps",
      appPath,
    );
  }
  return path.join(os.homedir(), "codeduet-apps", appPath);
}

/**
 * Resolves the app path to the actual file system path.
 * For new imported apps, the path is already absolute.
 * For legacy apps, we need to resolve using getCodeDuetAppPath.
 */
export function resolveAppPath(appPath: string): string {
  // If the path is already absolute, use it directly
  if (path.isAbsolute(appPath)) {
    return appPath;
  }

  // Otherwise, it's a legacy relative path, resolve it using the old logic
  return getCodeDuetAppPath(appPath);
}

export function getTypeScriptCachePath(): string {
  const electron = getElectron();
  return path.join(electron!.app.getPath("sessionData"), "typescript-cache");
}

/**
 * Gets the user data path, handling both Electron and non-Electron environments
 * In Electron: returns the app's userData directory
 * In non-Electron: returns "./userData" in the current directory
 */

export function getUserDataPath(): string {
  const electron = getElectron();

  // When running in Electron and app is ready
  if (process.env.NODE_ENV !== "development" && electron) {
    return electron!.app.getPath("userData");
  }

  // For development or when the Electron app object isn't available
  return path.resolve("./userData");
}

/**
 * Get a reference to electron in a way that won't break in non-electron environments
 */
export function getElectron(): typeof import("electron") | undefined {
  let electron: typeof import("electron") | undefined;
  try {
    // Check if we're in an Electron environment
    if (process.versions.electron) {
      electron = require("electron");
    }
  } catch {
    // Not in Electron environment
  }
  return electron;
}
