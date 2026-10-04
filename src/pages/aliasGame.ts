import { t } from '../i18n.ts'
import { GameCache } from "../cache.ts"
import { switchPageTo } from "../main.ts"
import { GameData, ScoreData } from "./pages.ts"

export const AliasGameBody = document.getElementById('alias-game')

const gameContent = document.getElementById('alias-game-content')
const gameButtons = document.getElementById('alias-game-buttons')

const discardButton = document.getElementById('alias-game-discard')
const approveButton = document.getElementById('alias-game-approve')
const pauseButton = document.getElementById('header-button-pause')
const roundTimer = document.getElementById('header-round-timer')

const endProceedButton = document.getElementById('alias-game-end-proceed')

export function initializeGame(game: GameData) {
    if (!gameContent || !AliasGameBody) return;

    AliasGameBody.classList.add('counting-down')
    const countdown = document.createElement('p')
    countdown.className = 'alias-game-start-countdown'
    countdown.innerText = '3'
    gameContent.appendChild(countdown)

    let startCountdownTime = 2
    const countdownInterval = setInterval(() => {
        if (startCountdownTime === 0) {
            clearInterval(countdownInterval)
            countdown.remove()
            AliasGameBody.classList.remove('counting-down')
            startGame(game)
        }

        countdown.innerText = startCountdownTime.toString()
        startCountdownTime--;
    }, 1000)
}

function getRandomWord(words: string[]): [string, number] | undefined {
    const length = words.length
    if (length === 0) return undefined;

    const i = Math.floor(Math.random() * length)
    return [words[i]!, i]
}

interface GuessedWords {
    word: string,
    includeInScore: boolean
}

async function startGame(game: GameData) {
    if (!(discardButton instanceof HTMLButtonElement) ||
        !(approveButton instanceof HTMLButtonElement) ||
        !(pauseButton instanceof HTMLButtonElement) ||
        roundTimer === null ||
        gameContent === null)
    {
        console.error("Game controls are missing")
        return
    }

    const gameGuessedWords: GuessedWords[] = []
    let roundExpired = false
    let paused = false
    let remainingTime = GameCache.roundTime * 1000
    let timerStartedAt = performance.now()
    let roundTimeout = 0
    let timerDisplayInterval = 0

    const updateTimerDisplay = () => {
        const elapsed = paused ? 0 : performance.now() - timerStartedAt
        const millisecondsLeft = Math.max(0, remainingTime - elapsed)
        roundTimer.textContent = Math.ceil(millisecondsLeft / 1000).toString()
    }

    const expireRound = () => {
        roundExpired = true
        window.clearInterval(timerDisplayInterval)
        roundTimer.textContent = '0'
        pauseButton.style.display = 'none'
    }

    const startTimer = () => {
        timerStartedAt = performance.now()
        roundTimeout = window.setTimeout(expireRound, remainingTime)
        updateTimerDisplay()
        timerDisplayInterval = window.setInterval(updateTimerDisplay, 250)
    }

    const togglePause = () => {
        paused = !paused
        discardButton.disabled = paused
        approveButton.disabled = paused
        gameContent.classList.toggle('paused', paused)
        pauseButton.textContent = paused ? t('continue') : t('pause')
        pauseButton.setAttribute('aria-pressed', paused.toString())

        if (paused) {
            remainingTime = Math.max(
                0,
                remainingTime - (performance.now() - timerStartedAt),
            )
            window.clearTimeout(roundTimeout)
            window.clearInterval(timerDisplayInterval)
            updateTimerDisplay()
        } else {
            startTimer()
        }
    }

    pauseButton.style.display = 'block'
    roundTimer.style.display = 'block'
    pauseButton.textContent = t('pause')
    pauseButton.setAttribute('aria-pressed', 'false')
    pauseButton.addEventListener('click', togglePause)
    startTimer()

    while (true) {
        const random = getRandomWord(game.words)
        if (random === undefined)
            break

        const [word, idx] = random
        const result = await putWordAndWaitForInput(word)

        if (result !== null) {
            gameGuessedWords.push({ word: word, includeInScore: result})
            game.words = game.words.toSpliced(idx, 1)
        } else {
            switchPageTo({kind: 'menu'})
            break
        }

        if (roundExpired)
            break
    }

    window.clearTimeout(roundTimeout)
    window.clearInterval(timerDisplayInterval)
    pauseButton.removeEventListener('click', togglePause)
    pauseButton.style.display = 'none'
    roundTimer.style.display = 'none'
    roundTimer.textContent = ''
    pauseButton.textContent = t('pause')
    pauseButton.setAttribute('aria-pressed', 'false')
    discardButton.disabled = false
    approveButton.disabled = false
    gameContent.classList.remove('paused')
    stopGame(gameGuessedWords, game)
}

async function putWordAndWaitForInput(word: string): Promise<boolean | null> {
    if (gameContent === null) {
        console.error("Game content element is missing")
        return null
    }
    else if (discardButton === null || approveButton === null) {
        console.error("discard/approve buttons arent initialized")
        return null
    }

    const elem = document.createElement('div')
    elem.className = 'alias-game-word'
    elem.innerText = word
    gameContent.appendChild(elem)

    return new Promise((resolve) => {
        const finish = (result: boolean) => {
            elem.remove()
            discardButton.removeEventListener('click', discardResolver)
            approveButton.removeEventListener('click', approveResolver)
            resolve(result)
        }

        const discardResolver = () => finish(false)
        const approveResolver = () => finish(true)

        discardButton.addEventListener('click', discardResolver)
        approveButton.addEventListener('click', approveResolver)
    })
}

function stopGame(result: GuessedWords[], game: GameData) {
    document.querySelectorAll('.alias-game-word')
        .forEach((e) => e.remove())

    if (!gameContent || !gameButtons ||
        !endProceedButton || !discardButton || !approveButton)
    {
        console.error("some elements that are used by the current function are missing")
        return
    }

    result.forEach((guess) => {
        const elem = document.createElement('div')
        elem.className = 'alias-game-end-words'

        const check = document.createElement('input')
        check.type = 'checkbox'
        check.checked = guess.includeInScore
        check.addEventListener('input', () => {
            guess.includeInScore = check.checked
        })

        elem.textContent = guess.word
        gameContent.appendChild(elem)
        elem.appendChild(check)

    })

    discardButton.style.display = 'none'
    approveButton.style.display = 'none'

    gameButtons.style.justifyContent = 'center';
    endProceedButton.style.display   = 'flex'

    const proceedCallback = () => {
        endProceedButton.removeEventListener('click', proceedCallback)
        document.querySelectorAll('.alias-game-end-words')
            .forEach((e) => e.remove());

        /* reset styles */
        discardButton.style.display = ''
        approveButton.style.display = ''

        gameButtons.style.justifyContent = '';
        endProceedButton.style.display   = '';

        const data: ScoreData = {
            words: game.words,
            turn: game.turn,
            score: 0,
        }
        result.forEach((g) =>
            data.score += g.includeInScore ? 1 : -1)

        switchPageTo({kind: 'leaderboard', score: data})
    }
    endProceedButton.addEventListener('click', proceedCallback)
}
