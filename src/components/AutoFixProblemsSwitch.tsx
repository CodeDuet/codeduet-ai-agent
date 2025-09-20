import { useSettings } from "@/hooks/useSettings";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

import { showInfo } from "@/lib/toast";
import { useLanguage } from "@/i18n";

export function AutoFixProblemsSwitch({
  showToast = false,
}: {
  showToast?: boolean;
}) {
  const { settings, updateSettings } = useSettings();
  const { t } = useLanguage();
  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="auto-fix-problems"
        checked={settings?.enableAutoFixProblems}
        onCheckedChange={() => {
          updateSettings({
            enableAutoFixProblems: !settings?.enableAutoFixProblems,
          });
          if (!settings?.enableAutoFixProblems && showToast) {
            showInfo("You can disable Auto-fix problems in the Settings page.");
          }
        }}
      />
      <Label htmlFor="auto-fix-problems">{t("settings.workflow.autoFixProblems")}</Label>
    </div>
  );
}
