import { PseudonymPage } from './pages/pages.ts'

import { SettingsMenu,  initializeSettings, toggleSettingsButton }
    from './pages/settingsMenu.ts'
import { SelectionMenu, initializeMenu, FooterElement }
    from './pages/selectionMenu.ts'
import { AliasGameBody, initializeGame }
    from './pages/aliasGame.ts'
import { initializeLeaderboard, LeaderboardBody } 
    from './pages/aliasGameLeaderboard.ts'

export let currentPage: PseudonymPage = {kind:"menu"}

if (SelectionMenu && AliasGameBody && SettingsMenu && FooterElement) {
    initializeSettings() // sets listener for the settings menu
    initializeMenu()
} else {
    console.error("failed to find some part of the app")
}

export function switchPageTo(to: PseudonymPage) {
    if (currentPage.kind === to.kind) return;

    const newSettingsButtonState = to.kind === 'menu' || to.kind === 'settings'
    toggleSettingsButton(newSettingsButtonState)

    switch (currentPage.kind) {
        case "menu":
            if (SelectionMenu && FooterElement) {
                SelectionMenu.style.display = "none"
                FooterElement.style.display = "none"
            }
        break;
        case 'game':
            if (AliasGameBody)
                AliasGameBody.style.display = "none"
        break;
        case 'leaderboard':
            if (LeaderboardBody)
                LeaderboardBody.style.display = 'none'
        break;
        case 'settings':
            if (SettingsMenu)
                SettingsMenu.style.display = "none"
        break;
    }

    switch (to.kind) {
        case "menu":
            initializeMenu()
            if (SelectionMenu && FooterElement) {
                SelectionMenu.style.display = "flex"
                FooterElement.style.display = "initial"
            }
        break;
        case 'game':
            initializeGame(to.game)
            if (AliasGameBody)
                AliasGameBody.style.display = "flex"
        break;
        case 'leaderboard':
            initializeLeaderboard(to.score)
            if (LeaderboardBody)
                LeaderboardBody.style.display = 'flex'
        break;
        case 'settings':
            if (SettingsMenu)
                SettingsMenu.style.display = "flex"
        break;
    }

    currentPage = to
}
