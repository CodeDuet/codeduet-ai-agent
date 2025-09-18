import { FileEditor } from "./FileEditor";
import { FileTree } from "./FileTree";
import { RefreshCw } from "lucide-react";
import { useLoadApp } from "@/hooks/useLoadApp";
import { useAtomValue } from "jotai";
import { selectedFileAtom } from "@/atoms/viewAtoms";
import { useOpenInIde } from "@/hooks/useOpenInIde";
import { VSCodeIcon } from "@/components/icons/VSCodeIcon";
import { CursorIcon } from "@/components/icons/CursorIcon";

interface App {
  id?: number;
  files?: string[];
}

export interface CodeViewProps {
  loading: boolean;
  app: App | null;
}

// Code view component that displays app files or status messages
export const CodeView = ({ loading, app }: CodeViewProps) => {
  const selectedFile = useAtomValue(selectedFileAtom);
  const { refreshApp } = useLoadApp(app?.id ?? null);
  const { openInVSCode, openInCursor, isLoading } = useOpenInIde();

  if (loading) {
    return <div className="text-center py-4">Loading files...</div>;
  }

  if (!app) {
    return (
      <div className="text-center py-4 text-gray-500">No app selected</div>
    );
  }

  if (app.files && app.files.length > 0) {
    return (
      <div className="flex flex-col h-full">
        {/* Toolbar */}
        <div className="flex items-center p-2 border-b space-x-3">
          <button
            onClick={() => refreshApp()}
            className="p-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading || !app.id}
            title="Refresh Files"
          >
            <RefreshCw size={16} />
          </button>
          
          <div className="h-6 w-px bg-gray-300"></div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => app.id && openInVSCode(app.id)}
              className="px-3 py-1.5 text-xs rounded-md bg-[#007ACC] text-white hover:bg-[#005a9e] disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1.5 shadow-sm transition-colors"
              disabled={isLoading || !app.id}
              title="Open in VS Code"
            >
              <VSCodeIcon size={14} />
              <span className="font-medium">VS Code</span>
            </button>
            
            <button
              onClick={() => app.id && openInCursor(app.id)}
              className="px-3 py-1.5 text-xs rounded-md bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1.5 shadow-sm transition-all"
              disabled={isLoading || !app.id}
              title="Open in Cursor"
            >
              <CursorIcon size={14} />
              <span className="font-medium">Cursor</span>
            </button>
          </div>
          
          <div className="text-sm text-gray-500">{app.files.length} files</div>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          <div className="w-1/3 overflow-auto border-r">
            <FileTree files={app.files} />
          </div>
          <div className="w-2/3">
            {selectedFile ? (
              <FileEditor appId={app.id ?? null} filePath={selectedFile.path} />
            ) : (
              <div className="text-center py-4 text-gray-500">
                Select a file to view
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return <div className="text-center py-4 text-gray-500">No files found</div>;
};
