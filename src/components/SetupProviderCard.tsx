import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

type SetupProviderVariant = "google" | "openrouter" | "runpod" | "anthropic" | "openai";

export function SetupProviderCard({
  variant,
  title,
  subtitle,
  leadingIcon,
  onClick,
  tabIndex = 0,
  className,
}: {
  variant: SetupProviderVariant;
  title: string;
  subtitle?: ReactNode;
  leadingIcon: ReactNode;
  onClick: () => void;
  tabIndex?: number;
  className?: string;
}) {
  const styles = getVariantStyles(variant);

  return (
    <div
      className={cn(
        "p-3 border rounded-lg cursor-pointer transition-colors",
        styles.container,
        className,
      )}
      onClick={onClick}
      role="button"
      tabIndex={tabIndex}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className={cn("p-1.5 rounded-full", styles.iconWrapper)}>
            {leadingIcon}
          </div>
          <div>
            <h4 className={cn("font-medium text-sm", styles.titleColor)}>
              {title}
            </h4>
            {subtitle ? (
              <div
                className={cn(
                  "text-xs flex items-center gap-1",
                  styles.subtitleColor,
                )}
              >
                {subtitle}
              </div>
            ) : null}
          </div>
        </div>
        <ChevronRight className={cn("w-4 h-4", styles.chevronColor)} />
      </div>
    </div>
  );
}

function getVariantStyles(variant: SetupProviderVariant) {
  switch (variant) {
    case "openai":
      return {
        container:
          "bg-teal-50 dark:bg-teal-900/50 border-teal-200 dark:border-teal-700 hover:bg-teal-100 dark:hover:bg-teal-900/70",
        iconWrapper: "bg-teal-100 dark:bg-teal-800",
        titleColor: "text-teal-800 dark:text-teal-300",
        subtitleColor: "text-teal-600 dark:text-teal-400",
        chevronColor: "text-teal-600 dark:text-teal-400",
      } as const;
    case "google":
      return {
        container:
          "bg-blue-50 dark:bg-blue-900/50 border-blue-200 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/70",
        iconWrapper: "bg-blue-100 dark:bg-blue-800",
        titleColor: "text-blue-800 dark:text-blue-300",
        subtitleColor: "text-blue-600 dark:text-blue-400",
        chevronColor: "text-blue-600 dark:text-blue-400",
      } as const;
    case "openrouter":
      return {
        container:
          "bg-purple-50 dark:bg-purple-900/50 border-purple-200 dark:border-purple-700 hover:bg-purple-100 dark:hover:bg-purple-900/70",
        iconWrapper: "bg-purple-100 dark:bg-purple-800",
        titleColor: "text-purple-800 dark:text-purple-300",
        subtitleColor: "text-purple-600 dark:text-purple-400",
        chevronColor: "text-purple-600 dark:text-purple-400",
      } as const;
    case "runpod":
      return {
        container:
          "bg-green-50 dark:bg-green-900/50 border-green-200 dark:border-green-700 hover:bg-green-100 dark:hover:bg-green-900/70",
        iconWrapper: "bg-green-100 dark:bg-green-800",
        titleColor: "text-green-800 dark:text-green-300",
        subtitleColor: "text-green-600 dark:text-green-400",
        chevronColor: "text-green-600 dark:text-green-400",
      } as const;
    case "anthropic":
      return {
        container:
          "bg-orange-50 dark:bg-orange-900/50 border-orange-200 dark:border-orange-700 hover:bg-orange-100 dark:hover:bg-orange-900/70",
        iconWrapper: "bg-orange-100 dark:bg-orange-800",
        titleColor: "text-orange-800 dark:text-orange-300",
        subtitleColor: "text-orange-600 dark:text-orange-400",
        chevronColor: "text-orange-600 dark:text-orange-400",
      } as const;
  }
}

export default SetupProviderCard;
