import { translate, UI_TEXT, type Language } from './locales/ui.ts'
import {
    CATEGORY_WORDS,
    DefaultValue_roundTime,
} from './constants.ts'
import type { Category } from './constants.ts'

const VALID_ROUND_TIMES = new Set([30, 60, 120])

function readCacheValue(key: string): string | null {
    try {
        return localStorage.getItem(key)
    } catch {
        return null
    }
}

function writeCacheValue(key: string, value: string) {
    try {
        localStorage.setItem(key, value)
    } catch {
        // The game can still run when storage is disabled or unavailable.
    }
}

function isCategory(value: unknown): value is Category {
    return typeof value === 'string' && Object.hasOwn(CATEGORY_WORDS, value)
}

function readCategories(): Category[] {
    const cached = readCacheValue('toggledCategories')
    if (cached === null)
        return []

    try {
        const parsed: unknown = JSON.parse(cached)
        if (!Array.isArray(parsed))
            return []

        return [...new Set(parsed.filter(isCategory))]
    } catch {
        return []
    }
}

function readTeamName(key: string, fallback: string): string {
    const cached = readCacheValue(key)
    if (cached === null)
        return fallback

    const trimmed = cached.trim()
    return trimmed === '' ? fallback : trimmed
}

function readRoundTime(): number {
    const cached = readCacheValue('roundTime')
    if (cached === null)
        return DefaultValue_roundTime

    const parsed = Number(cached)
    return VALID_ROUND_TIMES.has(parsed) ? parsed : DefaultValue_roundTime
}

function normalizeCustomWords(words: unknown[]): string[] {
    return [...new Set(words
        .filter((word): word is string => typeof word === 'string')
        .map((word) => word.trim())
        .filter((word) => word !== ''))]
}

function readCustomWords(): string[] {
    const cached = readCacheValue('customWords')
    if (cached === null)
        return []

    try {
        const parsed: unknown = JSON.parse(cached)
        return Array.isArray(parsed) ? normalizeCustomWords(parsed) : []
    } catch {
        return []
    }
}

class CacheData {
    private _language: Language;
    private _toggledCategories: Category[];

    private _teamOneName: string;
    private _teamTwoName: string;

    private _roundTime: number;
    private _customWords: string[];

    constructor() {
        this._language = readCacheValue('language') === 'en' ? 'en' : 'ru'
        this._toggledCategories = readCategories()
        this._teamOneName = readTeamName('teamOneName', '')
        this._teamTwoName = readTeamName('teamTwoName', '')
        this._roundTime = readRoundTime()
        this._customWords = readCustomWords()
    }

    public get toggledCategories() { return this._toggledCategories; }
    public set toggledCategories(data: Category[]) {
        this._toggledCategories = data
        writeCacheValue('toggledCategories', JSON.stringify(data))
    }

    public get language() { return this._language }
    public set language(value: Language) {
        this._language = value
        writeCacheValue('language', value)
    }

    private teamName(value: string, key: 'teamOneName' | 'teamTwoName'): string {
        // Migrate default names saved by older versions; custom names stay unchanged.
        if (value === '' || value === UI_TEXT.ru[key] || value === UI_TEXT.en[key])
            return translate(this.language, key)
        return value
    }

    public get teamOneName() { return this.teamName(this._teamOneName, 'teamOneName') }
    public set teamOneName(data: string) {
        this._teamOneName = data
        writeCacheValue('teamOneName', data)
    }

    public get teamTwoName() { return this.teamName(this._teamTwoName, 'teamTwoName') }
    public set teamTwoName(data: string) {
        this._teamTwoName = data
        writeCacheValue('teamTwoName', data)
    }
    public get roundTime() { return this._roundTime }
    public set roundTime(data: number) {
        this._roundTime = data
        writeCacheValue('roundTime', data.toString())
    }

    public get customWords() { return this._customWords }
    public set customWords(data: string[]) {
        this._customWords = normalizeCustomWords(data)
        writeCacheValue('customWords', JSON.stringify(this._customWords))
    }
}

export const GameCache = new CacheData();
