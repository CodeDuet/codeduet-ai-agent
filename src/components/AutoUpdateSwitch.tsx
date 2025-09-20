import { useSettings } from "@/hooks/useSettings";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { IpcClient } from "@/ipc/ipc_client";
import { useLanguage } from "@/i18n";

export function AutoUpdateSwitch() {
  const { settings, updateSettings } = useSettings();
  const { t } = useLanguage();

  if (!settings) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="enable-auto-update"
        checked={settings.enableAutoUpdate}
        onCheckedChange={(checked) => {
          updateSettings({ enableAutoUpdate: checked });
          toast(t("settings.general.autoUpdateSettingsChanged"), {
            description: t("settings.general.autoUpdateSettingsChangedDescription"),
            action: {
              label: t("settings.general.restartCodeDuet"),
              onClick: () => {
                IpcClient.getInstance().restartCodeDuet();
              },
            },
          });
        }}
      />
      <Label htmlFor="enable-auto-update">{t("settings.general.autoUpdate")}</Label>
    </div>
  );
}
