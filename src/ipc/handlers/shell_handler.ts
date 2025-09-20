import { shell } from "electron";
import { spawn } from "child_process";
import log from "electron-log";
import { createLoggedHandler } from "./safe_handle";
import * as path from "node:path";
import { existsSync } from "node:fs";
import { resolveAppPath } from "../../paths/paths";
import type { IdeAvailability } from "../ipc_types";

const logger = log.scope("shell_handlers");
const handle = createLoggedHandler(logger);

export function registerShellHandlers() {
  handle("open-external-url", async (_event, url: string) => {
    if (!url) {
      throw new Error("No URL provided.");
    }
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      throw new Error("Attempted to open invalid or non-http URL: " + url);
    }
    await shell.openExternal(url);
    logger.debug("Opened external URL:", url);
  });

  handle("show-item-in-folder", async (_event, fullPath: string) => {
    // Validate that a path was provided
    if (!fullPath) {
      throw new Error("No file path provided.");
    }

    shell.showItemInFolder(fullPath);
    logger.debug("Showed item in folder:", fullPath);
  });

  handle(
    "open-in-ide",
    async (
      _event,
      { projectPath, ide }: { projectPath: string; ide: "vscode" | "cursor" },
    ) => {
      if (!projectPath) {
        throw new Error("No project path provided.");
      }

      // Resolve the app path to get the actual file system path
      const resolvedPath = resolveAppPath(projectPath);

      if (!existsSync(resolvedPath)) {
        throw new Error(`Project path does not exist: ${resolvedPath}`);
      }

      let command: string;
      let args: string[];

      // Define commands for different IDEs
      if (ide === "vscode") {
        // Try different possible VSCode commands (prioritize direct app path)
        const possibleCommands = [
          "/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code",
          "/usr/local/bin/code",
          "/opt/homebrew/bin/code",
          "code",
        ];

        let foundCommand = null;
        for (const cmd of possibleCommands) {
          try {
            // First check if the full path exists
            if (cmd.includes("/") && existsSync(cmd)) {
              foundCommand = cmd;
              break;
            }
            
            // Then check using which command
            await new Promise<void>((resolve, reject) => {
              const testProcess = spawn(
                "which",
                [cmd.split("/").pop() || cmd],
                { stdio: "pipe" },
              );
              testProcess.on("close", (code) => {
                if (code === 0) resolve();
                else reject();
              });
              testProcess.on("error", reject);
            });
            foundCommand = cmd;
            break;
          } catch {
            continue;
          }
        }

        if (!foundCommand) {
          throw new Error(
            "VSCode not found. Please install VSCode and ensure 'code' command is available in PATH.",
          );
        }

        command = foundCommand;
        args = [resolvedPath];
      } else if (ide === "cursor") {
        // Try different possible Cursor commands (prioritize direct app path)
        const possibleCommands = [
          "/Applications/Cursor.app/Contents/Resources/app/bin/code",
          "/usr/local/bin/cursor",
          "/opt/homebrew/bin/cursor",
          "cursor",
        ];

        let foundCommand = null;
        for (const cmd of possibleCommands) {
          try {
            // First check if the full path exists
            if (cmd.includes("/") && existsSync(cmd)) {
              foundCommand = cmd;
              break;
            }
            
            // Then check using which command
            await new Promise<void>((resolve, reject) => {
              const testProcess = spawn(
                "which",
                [cmd.split("/").pop() || cmd],
                { stdio: "pipe" },
              );
              testProcess.on("close", (code) => {
                if (code === 0) resolve();
                else reject();
              });
              testProcess.on("error", reject);
            });
            foundCommand = cmd;
            break;
          } catch {
            continue;
          }
        }

        if (!foundCommand) {
          throw new Error(
            "Cursor not found. Please install Cursor and ensure 'cursor' command is available in PATH.",
          );
        }

        command = foundCommand;
        args = [resolvedPath];
      } else {
        throw new Error(`Unsupported IDE: ${ide}`);
      }

      return new Promise<void>((resolve, reject) => {
        const process = spawn(command, args, {
          stdio: "ignore",
          detached: true,
        });

        process.unref();

        process.on("error", (err) => {
          logger.error(`Failed to launch ${ide}:`, err);
          reject(new Error(`Failed to launch ${ide}: ${err.message}`));
        });

        // Give it a moment to start
        setTimeout(() => {
          logger.info(
            `Successfully launched ${ide} with project: ${resolvedPath}`,
          );
          resolve();
        }, 500);
      });
    },
  );

  handle("check-ide-availability", async (): Promise<IdeAvailability> => {
    const checkCommand = async (commands: string[], name: string): Promise<boolean> => {
      for (const cmd of commands) {
        try {
          // First check if the full path exists
          if (cmd.includes("/") && existsSync(cmd)) {
            logger.debug(`${name} found at full path: ${cmd}`);
            return true;
          }
          
          // Then check using which command
          const commandToCheck = cmd.split("/").pop() || cmd;
          logger.debug(`Checking ${name} command: ${commandToCheck} (from ${cmd})`);
          
          await new Promise<void>((resolve, reject) => {
            const testProcess = spawn("which", [commandToCheck], {
              stdio: "pipe",
            });
            
            testProcess.on("close", (code) => {
              logger.debug(`Command ${commandToCheck} check result: exit code ${code}`);
              if (code === 0) {
                logger.debug(`${name} found via which: ${commandToCheck}`);
                resolve();
              } else {
                reject(new Error(`Command not found: ${commandToCheck}`));
              }
            });
            
            testProcess.on("error", (err) => {
              logger.debug(`Error checking ${commandToCheck}:`, err);
              reject(err);
            });
          });
          return true;
        } catch (error) {
          logger.debug(`Failed to find ${name} command ${cmd}:`, error);
          continue;
        }
      }
      logger.debug(`${name} not found in any of the checked locations`);
      return false;
    };

    const vscodeCommands = [
      "/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code",
      "/usr/local/bin/code",
      "/opt/homebrew/bin/code",
      "code",
    ];
    const cursorCommands = [
      "/Applications/Cursor.app/Contents/Resources/app/bin/code",
      "/usr/local/bin/cursor",
      "/opt/homebrew/bin/cursor",
      "cursor",
    ];

    const [vscode, cursor] = await Promise.all([
      checkCommand(vscodeCommands, "VS Code"),
      checkCommand(cursorCommands, "Cursor"),
    ]);

    logger.debug("IDE availability check:", { vscode, cursor });

    return { vscode, cursor };
  });
}
