import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useNavigate } from "@tanstack/react-router";
import { providerSettingsRoute } from "@/routes/settings/providers/$provider";
import type { LanguageModelProvider } from "@/ipc/ipc_types";

import { useLanguageModelProviders } from "@/hooks/useLanguageModelProviders";
import { useCustomLanguageModelProvider } from "@/hooks/useCustomLanguageModelProvider";
import { PlusIcon, MoreVertical, Trash2, Terminal } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { AlertTriangle } from "lucide-react";
import { useState } from "react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { CreateCliProviderDialog } from "../CreateCliProviderDialog";

export function CliProvidersSection() {
  const navigate = useNavigate();
  const [isCliDialogOpen, setIsCliDialogOpen] = useState(false);
  const [providerToDelete, setProviderToDelete] = useState<string | null>(null);

  const {
    data: providers,
    isLoading,
    error,
    isProviderSetup,
    refetch,
  } = useLanguageModelProviders();

  const { deleteProvider, isDeleting } = useCustomLanguageModelProvider();

  const handleProviderClick = (providerId: string) => {
    navigate({
      to: providerSettingsRoute.id,
      params: { provider: providerId },
    });
  };

  const handleDeleteProvider = async () => {
    if (providerToDelete) {
      await deleteProvider(providerToDelete);
      setProviderToDelete(null);
      refetch();
    }
  };

  // Filter only CLI providers
  const cliProviders = providers?.filter((p) => p.type === "cli") || [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Terminal className="h-5 w-5" />
          <h3 className="text-lg font-medium">CLI Providers</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2].map((i) => (
            <Card key={i} className="border-border">
              <CardHeader className="p-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Terminal className="h-5 w-5" />
          <h3 className="text-lg font-medium">CLI Providers</h3>
        </div>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load CLI providers: {error.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Terminal className="h-5 w-5" />
        <h3 className="text-lg font-medium">CLI Providers</h3>
        <span className="text-sm text-muted-foreground">
          ({cliProviders.length} configured)
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cliProviders.map((provider: LanguageModelProvider) => (
          <Card
            key={provider.id}
            className="relative transition-all hover:shadow-md border-border"
          >
            <CardHeader
              className="p-4 cursor-pointer"
              onClick={() => handleProviderClick(provider.id)}
            >
              <CardTitle className="text-lg font-medium flex items-center justify-between">
                {provider.name}
                {isProviderSetup(provider.id) ? (
                  <span className="ml-3 text-sm font-medium text-green-500 bg-green-50 dark:bg-green-900/30 border border-green-500/50 dark:border-green-500/50 px-2 py-1 rounded-full">
                    Ready
                  </span>
                ) : (
                  <span className="text-sm text-gray-500 bg-gray-50 dark:bg-gray-900 dark:text-gray-300 px-2 py-1 rounded-full">
                    Needs Setup
                  </span>
                )}
              </CardTitle>
              <CardDescription className="flex items-center gap-1">
                <Terminal className="h-3 w-3" />
                CLI: {provider.cliType || provider.cliCommand || "Unknown"}
              </CardDescription>
            </CardHeader>

            <div
              className="absolute top-2 right-2"
              onClick={(e) => e.stopPropagation()}
            >
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1 hover:bg-muted rounded-full focus:outline-none"
                    data-testid="cli-provider-more-options"
                  >
                    <MoreVertical className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-48 p-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => setProviderToDelete(provider.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Provider
                  </Button>
                </PopoverContent>
              </Popover>
            </div>
          </Card>
        ))}

        {/* Add CLI provider button */}
        <Card
          className="cursor-pointer transition-all hover:shadow-md border-border border-dashed hover:border-primary/70"
          onClick={() => setIsCliDialogOpen(true)}
        >
          <CardHeader className="p-4 flex flex-col items-center justify-center h-full">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 mb-2">
              <Terminal className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-lg font-medium text-center">
              Add CLI Provider
            </CardTitle>
            <CardDescription className="text-center">
              Connect to a CLI-based AI coding tool
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      <CreateCliProviderDialog
        isOpen={isCliDialogOpen}
        onClose={() => setIsCliDialogOpen(false)}
        onSuccess={() => {
          setIsCliDialogOpen(false);
          refetch();
        }}
      />

      <AlertDialog
        open={!!providerToDelete}
        onOpenChange={(open) => !open && setProviderToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete CLI Provider</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this CLI provider and all its
              associated models. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProvider}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Provider"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}