import type { I18nConfig, LanguageInfo, SupportedLanguage } from "./types";

export const I18N_CONFIG: I18nConfig = {
  defaultLanguage: "en",
  supportedLanguages: ["en", "es", "fr", "de", "zh", "ja"],
  fallbackLanguage: "en",
};

export const LANGUAGE_INFO: Record<SupportedLanguage, LanguageInfo> = {
  en: {
    code: "en",
    name: "English",
    nativeName: "English",
  },
  es: {
    code: "es",
    name: "Spanish",
    nativeName: "Español",
  },
  fr: {
    code: "fr",
    name: "French",
    nativeName: "Français",
  },
  de: {
    code: "de",
    name: "German",
    nativeName: "Deutsch",
  },
  zh: {
    code: "zh",
    name: "Chinese",
    nativeName: "中文",
  },
  ja: {
    code: "ja",
    name: "Japanese",
    nativeName: "日本語",
  },
};
