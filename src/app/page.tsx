'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Category, Question } from '@/lib/supabase/database.types'
import { getAudioUrl } from '@/lib/audio-mapping'
import GameBoard from '@/components/GameBoard'
import QuestionCard from '@/components/QuestionCard'
import PlayerSetup from '@/components/PlayerSetup'
import GameOver from '@/components/GameOver'

export type GameState = 'setup' | 'playing' | 'question' | 'answered' | 'gameover'

const QUESTIONS_PER_GAME = 15

interface AnsweredQuestion {
  questionId: string
  points: number
  isCorrect: boolean
}

export default function Home() {
  const [gameState, setGameState] = useState<GameState>('setup')
  const [categories, setCategories] = useState<Category[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [questionsByCategory, setQuestionsByCategory] = useState<Record<string, Question[]>>({})
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [answeredQuestions, setAnsweredQuestions] = useState<AnsweredQuestion[]>([])
  const [score, setScore] = useState(0)
  const [playerName, setPlayerName] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([])

  useEffect(() => {
    loadData()
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
          media_url: getAudioUrl(q.answer_song, q.answer_artist)
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
    const newScore = score + points
    setScore(newScore)
    setAnsweredQuestions([...answeredQuestions, {
      questionId: currentQuestion.id,
      points,
      isCorrect,
    }])
    setSelectedQuestions([...selectedQuestions, currentQuestion])
    setGameState('answered')
  }

  function nextQuestion() {
    setCurrentQuestion(null)
    if (answeredQuestions.length >= QUESTIONS_PER_GAME) {
      setGameState('gameover')
    } else {
      setGameState('playing')
    }
  }

  function startGame(name: string) {
    setPlayerName(name)
    setScore(0)
    setAnsweredQuestions([])
    setSelectedQuestions([])
    setCurrentQuestion(null)
    setGameState('playing')
  }

  function restartGame() {
    setScore(0)
    setAnsweredQuestions([])
    setSelectedQuestions([])
    setCurrentQuestion(null)
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
        <h1 className="text-2xl font-bold text-center bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          🎵 Музыкальный квиз
        </h1>
        {playerName && gameState !== 'setup' && (
          <div className="text-center text-sm text-white/60 mt-1">
            Игрок: {playerName} | Счёт: <span className="text-yellow-400 font-bold">{score}</span>
            {gameState === 'playing' && (
              <span className="ml-3">| Вопросов: {answeredQuestions.length}/{QUESTIONS_PER_GAME}</span>
            )}
          </div>
        )}
      </header>

      <main className="flex-1 p-4 md:p-6">
        {gameState === 'setup' && (
          <PlayerSetup onStart={startGame} categories={categories} />
        )}

        {gameState === 'playing' && (
          <GameBoard
            categories={categories}
            questionsByCategory={questionsByCategory}
            answeredQuestions={answeredQuestions.map(a => a.questionId)}
            onSelectQuestion={selectQuestion}
          />
        )}

        {gameState === 'question' && currentQuestion && (
          <QuestionCard
            question={currentQuestion}
            categories={categories}
            onAnswer={handleAnswer}
            questionsLeft={QUESTIONS_PER_GAME - answeredQuestions.length - 1}
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
              <p className="text-xl text-white/80 mb-2">
                {currentQuestion.answer_song}
              </p>
              <p className="text-lg text-white/60 mb-4">
                {currentQuestion.answer_artist}
              </p>
              {answeredQuestions[answeredQuestions.length - 1]?.isCorrect && (
                <p className="text-yellow-400 text-lg font-semibold">
                  +{currentQuestion.point_value} очков
                </p>
              )}
              <button
                onClick={nextQuestion}
                className="mt-6 px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl font-semibold hover:from-indigo-500 hover:to-purple-500 transition-all"
              >
                {answeredQuestions.length >= QUESTIONS_PER_GAME ? 'Посмотреть результаты' : 'Следующий вопрос →'}
              </button>
            </div>
          </div>
        )}

        {gameState === 'gameover' && (
          <GameOver
            score={score}
            playerName={playerName}
            answeredQuestions={answeredQuestions}
            onRestart={restartGame}
          />
        )}
      </main>
    </div>
  )
}
