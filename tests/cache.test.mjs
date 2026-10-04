import assert from 'node:assert/strict'
import { test } from 'node:test'

let sequence = 0
async function readCache(values = {}, unavailable = false) {
    const storage = new Map(Object.entries(values))
    globalThis.localStorage = {
        getItem(key) {
            if (unavailable) throw new Error('Storage blocked')
            return storage.get(key) ?? null
        },
        setItem(key, value) {
            if (unavailable) throw new Error('Storage full')
            storage.set(key, value)
        },
    }
    const { GameCache } = await import(`../dist/src/cache.js?test=${sequence++}`)
    return { cache: GameCache, storage }
}

test('rejects inherited keys and removes duplicate cached categories', async () => {
    const { cache } = await readCache({
        toggledCategories: JSON.stringify(['constructor', '__proto__', 'toString', 'winter', 'winter', null]),
    })
    assert.deepEqual(cache.toggledCategories, ['winter'])
})

test('recovers from malformed saved settings', async () => {
    const { cache } = await readCache({
        toggledCategories: '{', customWords: '{}', roundTime: 'NaN', teamOneName: '   ',
    })
    assert.deepEqual(cache.toggledCategories, [])
    assert.deepEqual(cache.customWords, [])
    assert.equal(cache.roundTime, 60)
    assert.equal(cache.teamOneName, 'Команда 1')
})

test('normalizes custom words while preserving phrases and persists them', async () => {
    const { cache, storage } = await readCache()
    cache.customWords = ['  северный полюс ', '', 'кот', 'кот']
    assert.deepEqual(cache.customWords, ['северный полюс', 'кот'])
    assert.deepEqual(JSON.parse(storage.get('customWords')), cache.customWords)
})

test('works when browser storage cannot be read or written', async () => {
    const { cache } = await readCache({}, true)
    assert.equal(cache.roundTime, 60)
    cache.teamOneName = 'Первая'
    cache.customWords = ['слово']
    assert.equal(cache.teamOneName, 'Первая')
    assert.deepEqual(cache.customWords, ['слово'])
})

test('persists language and localizes default team names', async () => {
    const { cache, storage } = await readCache({teamOneName: 'Команда 1'})
    assert.equal(cache.language, 'ru')
    cache.language = 'en'
    assert.equal(storage.get('language'), 'en')
    assert.equal(cache.teamOneName, 'Team 1')
    assert.equal(cache.teamTwoName, 'Team 2')
    cache.teamOneName = 'North'
    cache.customWords = ['мой термин']
    cache.language = 'ru'
    assert.equal(cache.teamOneName, 'North')
    assert.equal(cache.teamTwoName, 'Команда 2')
    assert.deepEqual(cache.customWords, ['мой термин'])
})

test('restores English and falls back to Russian for an invalid saved language', async () => {
    const english = await readCache({language: 'en'})
    assert.equal(english.cache.language, 'en')
    assert.equal(english.cache.teamOneName, 'Team 1')
    const invalid = await readCache({language: 'de'})
    assert.equal(invalid.cache.language, 'ru')
})
