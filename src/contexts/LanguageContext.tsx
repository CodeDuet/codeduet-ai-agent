import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import type {
  SupportedLanguage,
  Translations,
  TranslationParams,
} from "../i18n/types";
import { loadTranslations, translate, getBestLanguage } from "../i18n/utils";
import { useSettings } from "../hooks/useSettings";

interface LanguageContextType {
  currentLanguage: SupportedLanguage;
  setLanguage: (language: SupportedLanguage) => void;
  t: (key: string, params?: TranslationParams) => string;
  isLoading: boolean;
  translations: Translations | null;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

interface LanguageProviderProps {
  children: React.ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const { settings, updateSettings } = useSettings();
  const [currentLanguage, setCurrentLanguageState] =
    useState<SupportedLanguage>(() =>
      getBestLanguage(settings?.selectedLanguage),
    );
  const [translations, setTranslations] = useState<Translations | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load translations when language changes
  useEffect(() => {
    let cancelled = false;

    async function loadLanguage() {
      setIsLoading(true);
      try {
        const newTranslations = await loadTranslations(currentLanguage);
        if (!cancelled) {
          setTranslations(newTranslations);
        }
      } catch (error) {
        console.error("Failed to load translations:", error);
        if (!cancelled) {
          setTranslations(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadLanguage();

    return () => {
      cancelled = true;
    };
  }, [currentLanguage]);

  // Update language and persist to settings
  const setLanguage = useCallback(
    (language: SupportedLanguage) => {
      setCurrentLanguageState(language);
      updateSettings({ selectedLanguage: language });
    },
    [updateSettings],
  );

  // Translation function
  const t = useCallback(
    (key: string, params?: TranslationParams): string => {
      return translate(translations, key, params);
    },
    [translations],
  );

  // Update current language when settings change
  useEffect(() => {
    if (
      settings?.selectedLanguage &&
      settings.selectedLanguage !== currentLanguage
    ) {
      setCurrentLanguageState(getBestLanguage(settings.selectedLanguage));
    }
  }, [settings?.selectedLanguage, currentLanguage]);

  const value: LanguageContextType = {
    currentLanguage,
    setLanguage,
    t,
    isLoading,
    translations,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
