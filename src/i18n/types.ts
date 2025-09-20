export type SupportedLanguage = "en" | "es" | "fr" | "de" | "zh" | "ja";

export interface I18nConfig {
  defaultLanguage: SupportedLanguage;
  supportedLanguages: SupportedLanguage[];
  fallbackLanguage: SupportedLanguage;
}

export interface LanguageInfo {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
}

export interface TranslationParams {
  [key: string]: string | number;
}

// Base translation structure - will be extended as we add more sections
export interface Translations {
  settings: {
    general: {
      title: string;
      language: string;
      theme: string;
      appVersion: string;
      autoUpdate: string;
      autoUpdateDescription: string;
    };
    workflow: {
      title: string;
      autoApprove: string;
      autoApproveDescription: string;
      autoFixProblems: string;
      autoFixProblemsDescription: string;
      responseEndNotification: string;
      responseEndNotificationDescription: string;
    };
    ai: {
      title: string;
    };
    experiments: {
      title: string;
      enableNativeGit: string;
      enableNativeGitDescription: string;
      enableConfetti: string;
      enableConfettiDescription: string;
    };
    dangerZone: {
      title: string;
      resetEverything: string;
      resetEverythingDescription: string;
      resetEverythingButton: string;
      resetting: string;
    };
  };
  common: {
    goBack: string;
    cancel: string;
    confirm: string;
    save: string;
    delete: string;
    edit: string;
    loading: string;
    error: string;
    success: string;
  };
  themes: {
    system: string;
    light: string;
    dark: string;
  };
}
