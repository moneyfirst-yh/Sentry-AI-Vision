import type { Ref } from 'vue';
import type { Language } from '../types/ui';
import { messages } from '../i18n/messages';

export type TranslateParams = Record<string, number | string>;
export type Translator = (
  key: string,
  fallback?: string,
  params?: TranslateParams,
) => string;

const formatMessage = (template: string, params?: TranslateParams) =>
  template.replace(/\{(\w+)\}/g, (_match, key) => {
    if (!params) {
      return '';
    }
    const value = params[key];
    return value === undefined ? '' : String(value);
  });

export function useI18n(language: Ref<Language>) {
  const t: Translator = (key, fallback, params) => {
    const localeMessages = messages[language.value] ?? {};
    const template = localeMessages[key] ?? fallback ?? key;
    return formatMessage(template, params);
  };

  return { t };
}
