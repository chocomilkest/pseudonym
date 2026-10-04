import { GameCache } from "../cache.ts"
import { DefaultValue_teamOneName, DefaultValue_teamTwoName } from "../constants.ts"
import { switchPageTo, currentPage } from "../main.ts"

export const SettingsMenu = document.getElementById('settings-menu')
const settingsButton = document.getElementById('header-button-settings')

/* inputs */
const teamOneNameInput = document.getElementById('settings-team1-name') as HTMLInputElement
const teamTwoNameInput = document.getElementById('settings-team2-name') as HTMLInputElement
const roundTimeSelect  = document.getElementById('settings-round-time') as HTMLSelectElement
const customWordsInput = document.getElementById('settings-custom-words') as HTMLTextAreaElement

let initialized = false

function bindTeamName(input: HTMLInputElement, key: 'teamOneName' | 'teamTwoName', fallback: string) {
    input.value = GameCache[key]
    input.addEventListener('input', () => {
        GameCache[key] = input.value.trim() || fallback
    })
    input.addEventListener('blur', () => {
        input.value = GameCache[key]
    })
}

export function initializeSettings() {
    if (initialized || !settingsButton || !teamOneNameInput || !teamTwoNameInput ||
        !roundTimeSelect || !customWordsInput)
        return

    settingsButton.addEventListener('click', () => {
        if (currentPage.kind !== 'settings')
            switchPageTo({kind: 'settings'})
        else
            switchPageTo({kind: 'menu'})
    })

    bindTeamName(teamOneNameInput, 'teamOneName', DefaultValue_teamOneName)
    bindTeamName(teamTwoNameInput, 'teamTwoName', DefaultValue_teamTwoName)

    roundTimeSelect.addEventListener('change', () => {
        const time = Number.parseInt(roundTimeSelect.value)
        GameCache.roundTime = time
    })
    roundTimeSelect.value = GameCache.roundTime.toString()

    customWordsInput.value = GameCache.customWords.join(', ')
    customWordsInput.addEventListener('input', () => {
        GameCache.customWords = customWordsInput.value.split(/[\n,;]+/)
    })
    customWordsInput.addEventListener('blur', () => {
        customWordsInput.value = GameCache.customWords.join(', ')
    })
    initialized = true
}

export function toggleSettingsButton(on: boolean) {
    if (!settingsButton) return;

    if (on) settingsButton.style.display = ''
    else    settingsButton.style.display = 'none'
}
