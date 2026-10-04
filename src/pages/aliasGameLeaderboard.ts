import { GameCache } from '../cache.ts'
import { t } from '../i18n.ts'
import { formatScore } from '../locales/ui.ts'
import { GameTeams, Team } from "../teams.ts";
import { switchPageTo } from "../main.ts";
import { ScoreData } from "./pages.ts";

export const LeaderboardBody = document.getElementById('leaderboard-game')

const leaderboardTeams = document.getElementById('leaderboard-game-teams')
const leaderboardScore = document.getElementById('leaderboard-game-score')
const leaderboardContinue = document.getElementById('leaderboard-game-continue-button')

const leaderboardWinnerElem = document.getElementById('leaderboard-game-winner')
const leaderboardWinnerText = document.getElementById('leaderboard-game-winner-text')

let turn = 0;
export function getCurrentTurn() {
    return turn;
}

function nextTurn() {
    turn++;
    if (turn === GameTeams.length) {
        turn = 0
    }
}

function setupLeaderboardTeam(team: Team) {
    if (leaderboardTeams === null || leaderboardScore === null)
        return

    const teamName = document.createElement('p')
    teamName.innerText = team.teamName
    teamName.className = 'leaderboard-team-name'
    leaderboardTeams.appendChild(teamName)

    const teamScore = document.createElement('p')
    teamScore.innerText = formatScore(GameCache.language, team.score)
    teamScore.className = 'leaderboard-team-score'
    leaderboardScore.appendChild(teamScore)
}

// returns sorted array
function sortAndPlaceTeams(teams: Team[]): Team[] {
    teams.sort((a, b) => {
        if (a.score > b.score)
            return -1;
        else if (a.score < b.score)
            return 1;
        else
            return 0;
    })

    teams.forEach((t) => setupLeaderboardTeam(t))
    return teams
}

function cleanLeaderboard() {
    if (leaderboardTeams === null || leaderboardScore === null)
        return

    const teamNames = document.querySelectorAll('.leaderboard-team-name')
    teamNames.forEach((e) => e.remove())
    const teamScores = document.querySelectorAll('.leaderboard-team-score')
    teamScores.forEach((e) => e.remove())
}

export function initializeLeaderboard(data: ScoreData) {
    if (leaderboardContinue === null || leaderboardWinnerElem === null ||
        leaderboardWinnerText === null || leaderboardTeams === null ||
        leaderboardScore === null)
    {
        console.error("initialize leaderboard elements are missing");
        return
    }

    const currentScore = GameTeams.score[data.turn]
    if (currentScore !== undefined)
        GameTeams.score[data.turn] = currentScore + data.score

    const sorted = sortAndPlaceTeams(GameTeams.teams)
    const currentWinner = sorted[0]
    if (currentWinner === undefined)
        return

    nextTurn()

    const continueCallback = () => {
        leaderboardContinue.removeEventListener('click', continueCallback)
        cleanLeaderboard()

        if (currentWinner.score > 50 || data.words.length === 0) {
            const winnerName = currentWinner.teamName
            leaderboardWinnerElem.style.display = 'flex'
            leaderboardTeams.style.display = 'none'
            leaderboardScore.style.display = 'none'
            const tied = sorted.filter((team) => team.score === currentWinner.score).length > 1
            leaderboardWinnerText.innerText = tied ? t('draw') : `${t('winner')} ${winnerName}`

            const backToMenu = () => {
                leaderboardWinnerElem.style.display = ''
                leaderboardTeams.style.display = ''
                leaderboardScore.style.display = ''

                turn = 0
                GameTeams.score = [0,0]
                switchPageTo({kind: 'menu'})
                leaderboardContinue.removeEventListener('click', backToMenu)
            }
            leaderboardContinue.addEventListener('click', backToMenu)
            return
        }

        switchPageTo({kind: 'game',game: {turn: turn, words: data.words}})
    }

    leaderboardContinue.addEventListener('click', continueCallback)
}
