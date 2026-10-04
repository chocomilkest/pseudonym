import { ENGLISH_CATEGORY_WORDS } from '../locales/words.en.ts'
import { ENGLISH_CATEGORY_NAMES } from '../locales/ui.ts'
import { CATEGORY_BLOCKS_DATA, CATEGORY_WORDS } from '../constants.ts'
import type { Category } from '../constants.ts'
import { GameCache } from '../cache.ts'
import { CategoryBlock } from '../categories.ts'

import { switchPageTo } from '../main.ts'
import { getCurrentTurn } from './aliasGameLeaderboard.ts'

export const SelectionMenu = document.getElementById('selection-menu')
export const FooterElement = document.getElementById('footer')

const menu = SelectionMenu
const startButton = document.getElementById('game-button-start')
const categoryBlocks = CATEGORY_BLOCKS_DATA.map((category) => new CategoryBlock(
    category.id,
    category.displayName,
    category.imagePath,
))

let initialized = false
/* fetch previously toggled ids if any */
let toggledIds: Category[] = [...GameCache.toggledCategories]

function getIncludedWords(): string[] {
    return [...new Set(toggledIds.flatMap((id) =>
        id === 'custom' ? GameCache.customWords : (GameCache.language === 'en' ? ENGLISH_CATEGORY_WORDS : CATEGORY_WORDS)[id]))]
}

function updateButtonState(startButton: HTMLButtonElement) {
    startButton.disabled = getIncludedWords().length === 0
    startButton.style.setProperty('--box-color-sat', startButton.disabled ? '10%' : '65%')
}

function toggleCategory(block: CategoryBlock, startButton: HTMLButtonElement) {
    block.toggle()
    if (block.toggled)
        toggledIds.push(block.id)
    else
        toggledIds = toggledIds.filter((id) => block.id !== id)

    updateButtonState(startButton)
    GameCache.toggledCategories = toggledIds
}

function onStartButtonPress() {
    GameCache.toggledCategories = toggledIds

    const words = getIncludedWords()
    if (words.length > 0) {
        switchPageTo({
            kind: 'game',
            game: { words, turn: getCurrentTurn() }
        })
    }
}

export function refreshCategoryLabels() {
    categoryBlocks.forEach((block, index) => {
        const name = GameCache.language === 'en'
            ? ENGLISH_CATEGORY_NAMES[block.id]
            : CATEGORY_BLOCKS_DATA[index]!.displayName
        block.setDisplayName(name)
    })
}

export function initializeMenu() {
    refreshCategoryLabels()
    if (startButton instanceof HTMLButtonElement)
        updateButtonState(startButton)
    if (initialized) return;

    if (menu && startButton instanceof HTMLButtonElement) {
        startButton.addEventListener("click", () => 
                                     onStartButtonPress())

        /* Put all the categories inside the main body element */
        categoryBlocks.forEach((block) => {
            const elem = block.initializeElement(menu)
            elem.addEventListener('click', () => 
                                  toggleCategory(block, startButton))
        })

        updateButtonState(startButton)
        toggledIds.forEach((id) => {
            categoryBlocks.forEach((block) => {
                if (block.id === id) {
                    block.toggle()
                }
            })
        })

        initialized = true;
    } else {
        console.error("Failed to find selection-menu or game-button-start element")
    }
}
