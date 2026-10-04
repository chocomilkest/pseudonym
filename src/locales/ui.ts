import type { Category } from '../constants.ts'

export type Language = 'ru' | 'en'

export const UI_TEXT = {
    ru: {
        settings: 'настройки', language: 'Язык:',
        teamOneLabel: 'Название первой команды:', teamTwoLabel: 'Название второй команды:',
        teamOneName: 'Команда 1', teamTwoName: 'Команда 2',
        roundTime: 'Время раунда:', seconds30: '30 секунд', minute1: '1 минута', minutes2: '2 минуты',
        customWords: 'Свои слова:', customPlaceholder: 'слово 1, слово 2, слово 3',
        customHint: 'Разделяйте слова новой строкой, запятой или точкой с запятой.',
        start: 'начать', skip: 'пропустить', guessed: 'угадано', continue: 'продолжить',
        pause: 'пауза', draw: 'Ничья!', winner: 'Победитель:',
    },
    en: {
        settings: 'settings', language: 'Language:',
        teamOneLabel: 'First team name:', teamTwoLabel: 'Second team name:',
        teamOneName: 'Team 1', teamTwoName: 'Team 2',
        roundTime: 'Round time:', seconds30: '30 seconds', minute1: '1 minute', minutes2: '2 minutes',
        customWords: 'Custom words:', customPlaceholder: 'word 1, word 2, word 3',
        customHint: 'Separate words with a new line, comma, or semicolon.',
        start: 'start', skip: 'skip', guessed: 'guessed', continue: 'continue',
        pause: 'pause', draw: 'Draw!', winner: 'Winner:',
    },
} satisfies Record<Language, Record<string, string>>

export type TranslationKey = keyof typeof UI_TEXT.ru
// Require both dictionaries to provide every UI key.
const translations: Record<Language, Record<TranslationKey, string>> = UI_TEXT
export function translate(language: Language, key: TranslationKey): string {
    return translations[language][key]
}

export const ENGLISH_CATEGORY_NAMES = {
    transport: 'Transport', household: 'Household', school: 'School', work: 'Work',
    space: 'Space', furniture: 'Furniture', nature: 'Nature', buildings: 'Buildings',
    places: 'Landmarks', food: 'Food', animals: 'Animals', sport: 'Sports', movies: 'Movies',
    brands: 'Brands', clothing: 'Clothing', professions: 'Professions', technology: 'Technology',
    holidays: 'Holidays', summer: 'Summer', autumn: 'Autumn', winter: 'Winter', spring: 'Spring',
    custom: 'Custom words',
} satisfies Record<Category, string>

export function formatScore(language: Language, score: number): string {
    const absolute = Math.abs(score)
    let unit: string
    if (language === 'en') {
        unit = absolute === 1 ? 'point' : 'points'
    } else if (absolute % 100 >= 11 && absolute % 100 <= 14) {
        unit = 'очков'
    } else {
        const last = absolute % 10
        unit = last === 1 ? 'очко' : last >= 2 && last <= 4 ? 'очка' : 'очков'
    }
    return `${score} ${unit}`
}
