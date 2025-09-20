import { useSettings } from "@/hooks/useSettings";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { IpcClient } from "@/ipc/ipc_client";
import type { ReleaseChannel } from "@/lib/schemas";
import { useLanguage } from "@/i18n";

export function ReleaseChannelSelector() {
  const { settings, updateSettings } = useSettings();
  const { t } = useLanguage();

  if (!settings) {
    return null;
  }

  const handleReleaseChannelChange = (value: ReleaseChannel) => {
    updateSettings({ releaseChannel: value });
    if (value === "stable") {
      toast(t("settings.general.usingStableChannel"), {
        description: t("settings.general.usingStableChannelDescription"),
        action: {
          label: t("settings.general.downloadStable"),
          onClick: () => {
            IpcClient.getInstance().openExternalUrl(
              "https://codeduet.com/download",
            );
          },
        },
      });
    } else {
      toast(t("settings.general.usingBetaChannel"), {
        description: t("settings.general.usingBetaChannelDescription"),
        action: {
          label: t("settings.general.restartCodeDuet"),
          onClick: () => {
            IpcClient.getInstance().restartCodeDuet();
          },
        },
      });
    }
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center space-x-2">
        <label
          htmlFor="release-channel"
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {t("settings.general.releaseChannel")}
        </label>
        <Select
          value={settings.releaseChannel}
          onValueChange={handleReleaseChannelChange}
        >
          <SelectTrigger className="w-32" id="release-channel">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="stable">{t("settings.general.releaseChannelStable")}</SelectItem>
            <SelectItem value="beta">{t("settings.general.releaseChannelBeta")}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="text-sm text-gray-500 dark:text-gray-400">
        <p>{t("settings.general.releaseChannelStableDescription")} </p>
        <p>{t("settings.general.releaseChannelBetaDescription")}</p>
      </div>
    </div>
  );
}
