import React from "react";
import { Button } from "@/components/ui/button";
import { CreditCard, Database, Plus, Zap } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAtomValue } from "jotai";
import { chatInputValueAtom } from "@/atoms/chatAtoms";
import { useAtom } from "jotai";
import { useLanguage } from "@/contexts/LanguageContext";

interface IntegrationShortcut {
  id: string;
  name: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  descriptionKey: string;
  tag: string;
  color: string;
}

export function IntegrationShortcuts() {
  const [inputValue, setInputValue] = useAtom(chatInputValueAtom);
  const { t } = useLanguage();

  const integrationShortcuts: IntegrationShortcut[] = [
    {
      id: "stripe",
      name: "Stripe",
      icon: CreditCard,
      descriptionKey: "chat.integrations.stripe.description",
      tag: '<codeduet-add-integration provider="stripe">Add Stripe payments to handle checkout and subscriptions</codeduet-add-integration>',
      color: "text-purple-600",
    },
    {
      id: "supabase",
      name: "Supabase",
      icon: Database,
      descriptionKey: "chat.integrations.supabase.description",
      tag: '<codeduet-add-integration provider="supabase">Add Supabase backend with authentication and database</codeduet-add-integration>',
      color: "text-green-600",
    },
  ];

  const handleIntegrationClick = (integration: IntegrationShortcut) => {
    // Add the integration tag to the current input value
    const newValue = inputValue ? `${inputValue}\n\n${integration.tag}` : integration.tag;
    setInputValue(newValue);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1.5 px-2 py-1 h-8 text-xs bg-background hover:bg-accent"
        >
          <Zap size={14} />
          {t("chat.integrations.title")}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-2" align="start">
        <div className="space-y-1">
          <div className="px-2 py-1 text-xs font-medium text-muted-foreground">
            {t("chat.integrations.quickSetup")}
          </div>
          {integrationShortcuts.map((integration) => {
            const IconComponent = integration.icon;
            return (
              <button
                key={integration.id}
                onClick={() => handleIntegrationClick(integration)}
                className="w-full flex items-center gap-3 px-2 py-2 text-left hover:bg-accent rounded-md transition-colors"
              >
                <div className={`p-1.5 rounded-md bg-gray-100 dark:bg-gray-800 ${integration.color}`}>
                  <IconComponent size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground">
                    {integration.name}
                  </div>
                  <div className="text-xs text-muted-foreground line-clamp-2">
                    {t(integration.descriptionKey)}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}