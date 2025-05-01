export enum SupportedLanguage {
    ENGLISH = 'en',
    SPANISH = 'es',
    CHINESE = 'zh',
    JAPANESE = 'ja',
    KOREAN = 'ko',
    RUSSIAN = 'ru',
    GERMAN = 'de',
    FRENCH = 'fr',
    ITALIAN = 'it',
    PORTUGUESE = 'pt',
    ARABIC = 'ar',
    TAMIL = 'ta',
    TURKISH = 'tr',
    VIETNAMESE = 'vi',
    INDONESIAN = 'id'
}

export const DEFAULT_LANGUAGE = SupportedLanguage.ENGLISH;

export function isValidLanguage(lang: string): boolean {
    return Object.values(SupportedLanguage).includes(lang as SupportedLanguage);
}

export function getLanguageCode(lang: SupportedLanguage): string {
    return lang;
}

export function getLanguageFromCode(code: string): SupportedLanguage {
    const lang = Object.entries(SupportedLanguage)
        .find(([_, value]) => value === code);
    return lang ? SupportedLanguage[lang[0] as keyof typeof SupportedLanguage] : DEFAULT_LANGUAGE;
} 