interface ElectronAPI {
  ipcRenderer: {
    invoke: (channel: string, ...args: unknown[]) => Promise<any>;
    on: (channel: string, listener: (...args: unknown[]) => void) => () => void;
    removeAllListeners: (channel: string) => void;
    removeListener: (channel: string, listener: (...args: unknown[]) => void) => void;
  };
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}

export {};