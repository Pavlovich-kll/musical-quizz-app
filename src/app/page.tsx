'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Category, Question } from '@/lib/supabase/database.types'
import { getAudioUrl } from '@/lib/audio-mapping'
import { GAMES } from '@/lib/games-data'
import type { GameDef } from '@/lib/games-data'
import { loadCustomGames } from '@/lib/custom-games'
import type { CustomGame } from '@/lib/custom-games'
import GameBoard from '@/components/GameBoard'
import QuestionCard from '@/components/QuestionCard'
import PlayerSetup from '@/components/PlayerSetup'
import GameSelector from '@/components/GameSelector'
import TeamSetup from '@/components/TeamSetup'
import GameOver from '@/components/GameOver'

export type GameState = 'setup' | 'select-game' | 'select-teams' | 'playing' | 'question' | 'answered' | 'choose-team' | 'gameover'

const STANDARD_QUESTIONS_PER_GAME = 15

interface AnsweredQuestion {
  questionId: string
  points: number
  isCorrect: boolean
  teamName: string
}

interface TeamScore {
  name: string
  score: number
  correct: number
  total: number
}

export default function Home() {
  const [gameState, setGameState] = useState<GameState>('setup')
  const [categories, setCategories] = useState<Category[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [questionsByCategory, setQuestionsByCategory] = useState<Record<string, Question[]>>({})
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [answeredQuestions, setAnsweredQuestions] = useState<AnsweredQuestion[]>([])
  const [playerName, setPlayerName] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([])
  const [selectedGame, setSelectedGame] = useState<GameDef | null>(null)
  const [selectedCustomGame, setSelectedCustomGame] = useState<CustomGame | null>(null)
  const [teams, setTeams] = useState<string[]>([])
  const [currentTeamIdx, setCurrentTeamIdx] = useState(0)
  const [lastAnswerWrong, setLastAnswerWrong] = useState(false)

  const [customGames, setCustomGames] = useState<CustomGame[]>([])

  const availableGames: GameDef[] = [
    ...GAMES,
    ...customGames.map(cg => ({
      id: cg.id,
      title: cg.title,
      description: cg.description,
      categoryIds: cg.categories.map(c => c.id),
      isCustom: true as const,
    })),
  ]

  const questionsPerGame = selectedGame?.isCustom
    ? selectedCustomGame?.questions.length ?? 0
    : STANDARD_QUESTIONS_PER_GAME

  const filteredCategories = selectedGame
    ? selectedGame.isCustom
      ? (selectedCustomGame?.categories.map(c => ({
          id: c.id,
          name: c.name,
          description: c.description,
          icon: c.icon || '🎵',
          created_at: selectedCustomGame.createdAt,
        })) ?? [])
      : categories.filter(c => selectedGame.categoryIds.includes(c.id))
    : categories

  const customQuestionsByCategory: Record<string, Question[]> = selectedCustomGame
    ? (() => {
        const grouped: Record<string, Question[]> = {}
        for (const cq of selectedCustomGame.questions) {
          if (!grouped[cq.categoryId]) grouped[cq.categoryId] = []
          grouped[cq.categoryId].push({
            id: cq.id,
            category_id: cq.categoryId,
            point_value: cq.pointValue,
            question_text: cq.questionText || null,
            answer_song: cq.answerSong,
            answer_artist: cq.answerArtist,
            clue: null,
            sort_order: 0,
            created_at: selectedCustomGame.createdAt,
            media_url: cq.youtubeUrl || null,
          })
        }
        return grouped
      })()
    : {}

  const activeQuestionsByCategory = selectedGame?.isCustom ? customQuestionsByCategory : questionsByCategory

  const isGameOver = answeredQuestions.length >= questionsPerGame

  const teamScores: TeamScore[] = teams.map(name => {
    const teamAnswers = answeredQuestions.filter(a => a.teamName === name)
    return {
      name,
      score: teamAnswers.reduce((s, a) => s + a.points, 0),
      correct: teamAnswers.filter(a => a.isCorrect).length,
      total: teamAnswers.length,
    }
  })

  useEffect(() => {
    loadData()
    setCustomGames(loadCustomGames())
  }, [])

  async function loadData() {
    try {
      const supabase = createClient()
      const { data: cats, error: catsErr } = await supabase
        .from('categories')
        .select('id,name,description,icon,created_at')
        .order('name')
      const { data: qs, error: qsErr } = await supabase
        .from('questions')
        .select('id,category_id,point_value,question_text,answer_song,answer_artist,clue,sort_order,created_at')
        .order('point_value')

      if (catsErr) throw catsErr
      if (qsErr) throw qsErr

      if (cats) setCategories(cats)
      if (qs) {
        const qsWithMedia = qs.map(q => ({
          ...q,
          media_url: getAudioUrl(q.answer_song, q.answer_artist),
        }))
        setQuestions(qsWithMedia)
        const grouped: Record<string, Question[]> = {}
        for (const q of qsWithMedia) {
          if (!grouped[q.category_id]) grouped[q.category_id] = []
          grouped[q.category_id].push(q)
        }
        setQuestionsByCategory(grouped)
      }
    } catch (err) {
      let message = 'Неизвестная ошибка'
      if (err instanceof Error) {
        message = `${err.name}: ${err.message}`
        if (err.stack) console.error('Stack:', err.stack)
      } else if (typeof err === 'string') {
        message = err
      } else if (err && typeof err === 'object') {
        message = JSON.stringify(err, Object.getOwnPropertyNames(err))
      }
      console.error('Ошибка загрузки данных (сырая):', err)
      setError(message)
      setLoading(false)
    } finally {
      setLoading(false)
    }
  }

  function selectQuestion(question: Question) {
    if (answeredQuestions.find(a => a.questionId === question.id)) return
    setCurrentQuestion(question)
    setGameState('question')
  }

  function handleAnswer(isCorrect: boolean) {
    if (!currentQuestion) return
    const points = isCorrect ? currentQuestion.point_value : 0
    const teamName = teams[currentTeamIdx]
    setAnsweredQuestions(prev => [...prev, {
      questionId: currentQuestion.id,
      points,
      isCorrect,
      teamName,
    }])
    setSelectedQuestions(prev => [...prev, currentQuestion!])
    setLastAnswerWrong(!isCorrect)
    setGameState('answered')
  }

  function goToBoard() {
    setCurrentQuestion(null)
    if (isGameOver) {
      setGameState('gameover')
    } else if (lastAnswerWrong) {
      setGameState('choose-team')
    } else {
      setGameState('playing')
    }
  }

  function chooseTeam(idx: number) {
    setCurrentTeamIdx(idx)
    setGameState('playing')
  }

  function handleGameSelect(game: GameDef) {
    setSelectedGame(game)
    if (game.isCustom) {
      const cg = customGames.find(c => c.id === game.id)
      setSelectedCustomGame(cg ?? null)
    } else {
      setSelectedCustomGame(null)
    }
    setGameState('select-teams')
  }

  function handleTeamStart(teamNames: string[], firstTeamIdx: number) {
    setTeams(teamNames)
    setCurrentTeamIdx(firstTeamIdx)
    setAnsweredQuestions([])
    setSelectedQuestions([])
    setCurrentQuestion(null)
    setLastAnswerWrong(false)
    setGameState('playing')
  }

  function handlePlayerSetup(name: string) {
    setPlayerName(name)
    setGameState('select-game')
  }

  function restartGame() {
    setAnsweredQuestions([])
    setSelectedQuestions([])
    setCurrentQuestion(null)
    setTeams([])
    setSelectedGame(null)
    setSelectedCustomGame(null)
    setCurrentTeamIdx(0)
    setLastAnswerWrong(false)
    setGameState('setup')
    setPlayerName('')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-2xl animate-pulse">🎵 Загрузка...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-red-900/30 border border-red-500/30 rounded-2xl p-8 max-w-md text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold mb-2">Ошибка загрузки</h2>
          <p className="text-white/60 text-sm mb-4 break-all">{error}</p>
          <p className="text-white/40 text-xs mb-4">
            Проверьте, что переменные NEXT_PUBLIC_SUPABASE_URL и NEXT_PUBLIC_SUPABASE_ANON_KEY заданы
          </p>
          <button
            onClick={() => { setError(null); setLoading(true); loadData() }}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl font-semibold hover:from-indigo-500 hover:to-purple-500 transition-all"
          >
            Повторить
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="py-4 px-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            🎵 Музыкальный квиз
          </h1>
          <a href="/admin" className="text-xs text-white/30 hover:text-white/60 transition-colors">Админ</a>
        </div>
        {teams.length > 0 && gameState !== 'setup' && gameState !== 'select-game' && gameState !== 'select-teams' && (
          <div className="text-center text-sm mt-1">
            <div className="flex items-center justify-center gap-3 flex-wrap">
              {teamScores.map(ts => (
                <span key={ts.name} className="text-white/80">
                  {ts.name}: <span className="text-yellow-400 font-bold">{ts.score}</span>
                </span>
              ))}
              {(gameState === 'playing' || gameState === 'question') && (
                <span className="text-white/40">| Ход: <span className="text-indigo-300 font-semibold">{teams[currentTeamIdx]}</span></span>
              )}
            </div>
            {gameState === 'playing' && (
              <div className="text-xs text-white/40 mt-1">
                Вопросов: {answeredQuestions.length}/{questionsPerGame}
              </div>
            )}
          </div>
        )}
      </header>

      <main className="flex-1 p-4 md:p-6">
        {gameState === 'setup' && (
          <PlayerSetup onStart={handlePlayerSetup} categories={filteredCategories} />
        )}

        {gameState === 'select-game' && (
          <GameSelector games={availableGames} onSelect={handleGameSelect} />
        )}

        {gameState === 'select-teams' && (
          <TeamSetup onStart={handleTeamStart} />
        )}

        {gameState === 'playing' && (
          <GameBoard
            categories={filteredCategories}
            questionsByCategory={activeQuestionsByCategory}
            answeredQuestions={answeredQuestions.map(a => a.questionId)}
            onSelectQuestion={selectQuestion}
            currentTeam={teams[currentTeamIdx]}
            teamScores={teamScores}
          />
        )}

        {gameState === 'choose-team' && (
          <div className="max-w-md mx-auto mt-8 animate-fadeIn">
            <h2 className="text-xl font-bold text-center mb-2">Выберите следующую команду</h2>
            <p className="text-white/60 text-center mb-6">
              Команда <span className="text-red-400 font-semibold">{teams[currentTeamIdx]}</span> не ответила. Кто хочет попробовать?
            </p>
            <div className="grid gap-3">
              {teams.map((name, i) => (
                <button
                  key={name}
                  onClick={() => chooseTeam(i)}
                  disabled={i === currentTeamIdx}
                  className={`p-4 rounded-xl text-left font-semibold transition-all ${
                    i === currentTeamIdx
                      ? 'bg-white/5 border border-white/10 text-white/30 cursor-not-allowed'
                      : 'bg-gradient-to-r from-indigo-600/40 to-purple-600/40 border border-indigo-500/30 hover:from-indigo-600/60 hover:to-purple-600/60'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        )}

        {gameState === 'question' && currentQuestion && (
          <QuestionCard
            question={currentQuestion}
            categories={filteredCategories}
            onAnswer={handleAnswer}
            questionsLeft={questionsPerGame - answeredQuestions.length - 1}
            currentTeam={teams[currentTeamIdx]}
          />
        )}

        {gameState === 'answered' && currentQuestion && (
          <div className="animate-scale-in max-w-2xl mx-auto mt-8 text-center">
            <div className={`p-8 rounded-2xl ${answeredQuestions[answeredQuestions.length - 1]?.isCorrect
              ? 'bg-green-900/30 border border-green-500/30'
              : 'bg-red-900/30 border border-red-500/30'}`}>
              <div className="text-6xl mb-4">
                {answeredQuestions[answeredQuestions.length - 1]?.isCorrect ? '🎉' : '😢'}
              </div>
              <h2 className="text-2xl font-bold mb-2">
                {answeredQuestions[answeredQuestions.length - 1]?.isCorrect ? 'Верно!' : 'Неверно'}
              </h2>
              <p className="text-lg text-white/70 mb-1">
                Команда: <span className="font-semibold text-indigo-300">{answeredQuestions[answeredQuestions.length - 1]?.teamName}</span>
              </p>
              <p className="text-xl text-white/80 mb-2">
                {currentQuestion.answer_song}
              </p>
              <p className="text-lg text-white/60 mb-4">
                {currentQuestion.answer_artist}
              </p>
              {answeredQuestions[answeredQuestions.length - 1]?.isCorrect && (
                <p className="text-yellow-400 text-lg font-semibold mb-2">
                  +{currentQuestion.point_value} очков
                </p>
              )}
              {answeredQuestions[answeredQuestions.length - 1]?.isCorrect ? (
                <p className="text-indigo-300 text-sm mb-4">
                  {teams[currentTeamIdx]} продолжает игру! Выберите следующий вопрос.
                </p>
              ) : (
                <p className="text-white/50 text-sm mb-4">
                  Нужно выбрать другую команду для следующего хода.
                </p>
              )}
              <button
                onClick={goToBoard}
                className="mt-2 px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl font-semibold hover:from-indigo-500 hover:to-purple-500 transition-all"
              >
                {isGameOver ? 'Посмотреть результаты' : 'К выбору вопросов →'}
              </button>
            </div>
          </div>
        )}

        {gameState === 'gameover' && (
          <GameOver
            teamScores={teamScores}
            answeredQuestions={answeredQuestions}
            onRestart={restartGame}
          />
        )}
      </main>
    </div>
  )
}
