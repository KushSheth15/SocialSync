import { I18n, Replacements } from 'i18n';

import { Languages } from './i18n-config';

export class LocaleService {
  private i18nProvider: I18n;

  constructor(i18nProvider: I18n) {
    this.i18nProvider = i18nProvider;
  }

  getCurrentLocale(): string {
    return this.i18nProvider.getLocale();
  }

  getLocales(): string[] {
    return this.i18nProvider.getLocales();
  }

  setLocale(locale: string): void {
    if (this.getLocales().includes(locale)) {
      this.i18nProvider.setLocale(locale);
    } else {
      this.i18nProvider.setLocale(Languages.ENGLISH);
    }
  }

  translate(key: string, args: Replacements = {}): string {
    return this.i18nProvider.__(key, args);
  }
}
