export interface CustomCategory {
  id: string
  name: string
  description: string
  icon: string
}

export interface CustomQuestion {
  id: string
  categoryId: string
  pointValue: number
  questionText: string
  answerSong: string
  answerArtist: string
  youtubeUrl: string
}

export interface CustomGame {
  id: string
  title: string
  description: string
  categories: CustomCategory[]
  questions: CustomQuestion[]
  createdAt: string
}

const STORAGE_KEY = 'musical-quiz-custom-games'

export function loadCustomGames(): CustomGame[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveCustomGame(game: CustomGame) {
  const games = loadCustomGames()
  const idx = games.findIndex(g => g.id === game.id)
  if (idx >= 0) games[idx] = game
  else games.push(game)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(games))
}

export function deleteCustomGame(id: string) {
  const games = loadCustomGames().filter(g => g.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(games))
}

let idCounter = Date.now()
export function genId(): string {
  return `custom_${++idCounter}`
}
