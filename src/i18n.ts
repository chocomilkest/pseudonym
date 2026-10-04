import { GameCache } from './cache.ts'
import { translate, type TranslationKey } from './locales/ui.ts'

export function t(key: TranslationKey): string {
    return translate(GameCache.language, key)
}

export function applyTranslations() {
    document.documentElement.lang = GameCache.language
    document.querySelectorAll<HTMLElement>('[data-i18n]').forEach((element) => {
        element.textContent = t(element.dataset.i18n as TranslationKey)
    })
    document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('[data-i18n-placeholder]').forEach((element) => {
        element.placeholder = t(element.dataset.i18nPlaceholder as TranslationKey)
    })
    const gameContent = document.getElementById('alias-game-content')
    if (gameContent) gameContent.dataset.pauseLabel = t('pause')
}
