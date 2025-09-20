import type {
  SupportedLanguage,
  Translations,
  TranslationParams,
} from "./types";
import { I18N_CONFIG } from "./config";

// Language file imports - using dynamic imports for better performance
const languageModules: Record<SupportedLanguage, () => Promise<Translations>> =
  {
    en: () =>
      import("./languages/en.json").then((m) => m.default as Translations),
    es: () =>
      import("./languages/es.json").then((m) => m.default as Translations),
    fr: () =>
      import("./languages/fr.json").then((m) => m.default as Translations),
    de: () =>
      import("./languages/de.json").then((m) => m.default as Translations),
    zh: () =>
      import("./languages/zh.json").then((m) => m.default as Translations),
    ja: () =>
      import("./languages/ja.json").then((m) => m.default as Translations),
  };

// Cache for loaded translations
const translationCache = new Map<SupportedLanguage, Translations>();

/**
 * Load translations for a specific language
 */
export async function loadTranslations(
  language: SupportedLanguage,
): Promise<Translations> {
  if (translationCache.has(language)) {
    return translationCache.get(language)!;
  }

  try {
    const translations = await languageModules[language]();
    translationCache.set(language, translations);
    return translations;
  } catch (error) {
    console.warn(
      `Failed to load translations for ${language}, falling back to ${I18N_CONFIG.fallbackLanguage}`,
      error,
    );

    // Fallback to default language
    if (language !== I18N_CONFIG.fallbackLanguage) {
      return loadTranslations(I18N_CONFIG.fallbackLanguage);
    }

    throw error;
  }
}

/**
 * Get a nested property from an object using a dot notation key
 */
function getNestedProperty(obj: any, key: string): string | undefined {
  return key.split(".").reduce((current, prop) => current?.[prop], obj);
}

/**
 * Translate a key with optional parameters
 */
export function translate(
  translations: Translations | null,
  key: string,
  params?: TranslationParams,
): string {
  if (!translations) {
    return key; // Return the key itself if no translations loaded
  }

  let text = getNestedProperty(translations, key);

  if (!text) {
    console.warn(`Translation key not found: ${key}`);
    return key;
  }

  // Replace parameters in the text
  if (params) {
    Object.entries(params).forEach(([paramKey, value]) => {
      text = text!.replace(
        new RegExp(`\\{\\{${paramKey}\\}\\}`, "g"),
        String(value),
      );
    });
  }

  return text;
}

/**
 * Validate if a language code is supported
 */
export function isSupportedLanguage(
  language: string,
): language is SupportedLanguage {
  return I18N_CONFIG.supportedLanguages.includes(language as SupportedLanguage);
}

/**
 * Get the best language from user preferences and system locale
 */
export function getBestLanguage(userPreference?: string): SupportedLanguage {
  // User preference takes priority
  if (userPreference && isSupportedLanguage(userPreference)) {
    return userPreference;
  }

  // Try to match system locale
  const systemLocale = navigator.language.split("-")[0];
  if (isSupportedLanguage(systemLocale)) {
    return systemLocale;
  }

  // Fall back to default
  return I18N_CONFIG.defaultLanguage;
}
