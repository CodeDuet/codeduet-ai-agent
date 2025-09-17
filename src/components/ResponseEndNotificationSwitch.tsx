import { useSettings } from "@/hooks/useSettings";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { showError, showSuccess } from "@/lib/toast";

export function ResponseEndNotificationSwitch() {
  const { settings, updateSettings } = useSettings();
  
  const handleToggle = async (checked: boolean) => {
    if (checked) {
      // Request notification permission when enabling
      try {
        if (!("Notification" in window)) {
          showError("This browser does not support notifications");
          return;
        }

        if (Notification.permission === "denied") {
          showError("Notifications are blocked. Please enable them in your browser settings.");
          return;
        }

        if (Notification.permission === "default") {
          const permission = await Notification.requestPermission();
          if (permission !== "granted") {
            showError("Notification permission was denied");
            return;
          }
        }

        // Show a test notification
        try {
          new Notification("CodeDuet", {
            body: "Notifications are now enabled! You'll be notified when the assistant finishes replying.",
            icon: "/icon.png",
          });
          showSuccess("Notifications enabled successfully");
        } catch (error) {
          console.warn("Test notification failed:", error);
        }
      } catch (error) {
        console.error("Error requesting notification permission:", error);
        showError("Failed to enable notifications");
        return;
      }
    }

    updateSettings({
      enableResponseEndNotification: checked,
    });
  };
  
  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="response-end-notification"
        checked={settings?.enableResponseEndNotification ?? false}
        onCheckedChange={handleToggle}
      />
      <Label htmlFor="response-end-notification">Response end notifications</Label>
    </div>
  );
}