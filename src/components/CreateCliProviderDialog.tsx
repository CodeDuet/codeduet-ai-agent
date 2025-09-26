import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useCustomLanguageModelProvider } from "@/hooks/useCustomLanguageModelProvider";

interface CreateCliProviderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CLI_PROVIDERS = [
  {
    id: "claude-code",
    name: "Claude Code CLI",
    websiteUrl: "https://claude.com/product/claude-code",
    defaultCommand: "claude code",
  },
  {
    id: "codex",
    name: "Codex CLI",
    websiteUrl: "https://developers.openai.com/codex/cli/",
    defaultCommand: "codex",
  },
  {
    id: "codeduet",
    name: "CodeDuet CLI",
    websiteUrl: "https://github.com/CodeDuet/codeduet-cli",
    defaultCommand: "codeduet",
  },
  {
    id: "qwen",
    name: "QWEN CLI",
    websiteUrl: "https://github.com/QwenLM/qwen-code",
    defaultCommand: "qwen-code",
  },
] as const;

export function CreateCliProviderDialog({
  isOpen,
  onClose,
  onSuccess,
}: CreateCliProviderDialogProps) {
  const [selectedCliType, setSelectedCliType] = useState<string>("");
  const [name, setName] = useState("");
  const [cliCommand, setCliCommand] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const { createProvider, isCreating, error } =
    useCustomLanguageModelProvider();

  const handleCliTypeChange = (cliType: string) => {
    setSelectedCliType(cliType);
    const provider = CLI_PROVIDERS.find((p) => p.id === cliType);
    if (provider) {
      setName(provider.name);
      setCliCommand(provider.defaultCommand);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!selectedCliType) {
      setErrorMessage("Please select a CLI provider type");
      return;
    }

    try {
      const providerId = `cli-${selectedCliType}`;
      
      await createProvider({
        id: providerId,
        name: name.trim(),
        type: "cli",
        cliType: selectedCliType as "claude-code" | "codex" | "codeduet" | "qwen",
        cliCommand: cliCommand.trim(),
      });

      // Reset form
      setSelectedCliType("");
      setName("");
      setCliCommand("");

      onSuccess();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to create CLI provider",
      );
    }
  };

  const handleClose = () => {
    if (!isCreating) {
      setErrorMessage("");
      onClose();
    }
  };

  const selectedProvider = CLI_PROVIDERS.find((p) => p.id === selectedCliType);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add CLI Provider</DialogTitle>
          <DialogDescription>
            Connect to a CLI-based AI coding tool
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="cliType">CLI Provider</Label>
            <Select value={selectedCliType} onValueChange={handleCliTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a CLI provider" />
              </SelectTrigger>
              <SelectContent>
                {CLI_PROVIDERS.map((provider) => (
                  <SelectItem key={provider.id} value={provider.id}>
                    {provider.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Choose the CLI tool you want to integrate.
            </p>
          </div>

          {selectedProvider && (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">Display Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="E.g., Claude Code CLI"
                  required
                  disabled={isCreating}
                />
                <p className="text-xs text-muted-foreground">
                  The name that will be displayed in the UI.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cliCommand">CLI Command</Label>
                <Input
                  id="cliCommand"
                  value={cliCommand}
                  onChange={(e) => setCliCommand(e.target.value)}
                  placeholder={selectedProvider.defaultCommand}
                  required
                  disabled={isCreating}
                />
                <p className="text-xs text-muted-foreground">
                  The command to execute this CLI tool.
                </p>
              </div>

              <div className="text-xs text-muted-foreground bg-muted p-3 rounded-md">
                <strong>Note:</strong> Make sure the{" "}
                <a
                  href={selectedProvider.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:no-underline"
                >
                  {selectedProvider.name}
                </a>{" "}
                is installed and available in your system PATH.
              </div>
            </>
          )}

          {(errorMessage || error) && (
            <div className="text-sm text-red-500">
              {errorMessage ||
                (error instanceof Error
                  ? error.message
                  : "Failed to create CLI provider")}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating || !selectedCliType}>
              {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isCreating ? "Adding..." : "Add Provider"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}