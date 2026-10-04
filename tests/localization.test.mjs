import assert from 'node:assert/strict'
import { test } from 'node:test'
import { CATEGORY_WORDS, CATEGORY_BLOCKS_DATA } from '../dist/src/constants.js'
import { ENGLISH_CATEGORY_WORDS } from '../dist/src/locales/words.en.js'
import { ENGLISH_CATEGORY_NAMES, UI_TEXT, formatScore } from '../dist/src/locales/ui.js'

test('every category and built-in word has an English translation', () => {
    assert.deepEqual(Object.keys(ENGLISH_CATEGORY_WORDS).sort(), Object.keys(CATEGORY_WORDS).sort())
    for (const {id} of CATEGORY_BLOCKS_DATA) {
        assert.ok(ENGLISH_CATEGORY_NAMES[id])
        assert.equal(ENGLISH_CATEGORY_WORDS[id].length, CATEGORY_WORDS[id].length, id)
        for (const word of ENGLISH_CATEGORY_WORDS[id]) {
            assert.ok(word.length > 0, id)
            assert.equal(word, word.trim(), id)
            assert.doesNotMatch(word, /[А-Яа-яЁё]/u, id)
        }
    }
})

test('UI dictionaries have matching, nonempty translations', () => {
    assert.deepEqual(Object.keys(UI_TEXT.en).sort(), Object.keys(UI_TEXT.ru).sort())
    for (const value of Object.values(UI_TEXT.en)) {
        assert.ok(value.length > 0)
        assert.doesNotMatch(value, /[А-Яа-яЁё]/u)
    }
})

test('scores use Russian and English plural forms, including negative scores', () => {
    for (const [value, ru, en] of [
        [0, '0 очков', '0 points'], [1, '1 очко', '1 point'],
        [-1, '-1 очко', '-1 point'], [2, '2 очка', '2 points'],
        [11, '11 очков', '11 points'], [14, '14 очков', '14 points'],
        [21, '21 очко', '21 points'], [22, '22 очка', '22 points'],
        [111, '111 очков', '111 points'],
    ]) {
        assert.equal(formatScore('ru', value), ru)
        assert.equal(formatScore('en', value), en)
    }
})
