'use client'

import { useMemo } from 'react'

interface AnsweredQuestion {
  questionId: string
  points: number
  isCorrect: boolean
}

interface Props {
  score: number
  playerName: string
  answeredQuestions: AnsweredQuestion[]
  onRestart: () => void
}

export default function GameOver({ score, playerName, answeredQuestions, onRestart }: Props) {
  const maxScore = 15 * 50
  const percentage = Math.round((score / maxScore) * 100)

  const grade = useMemo(() => {
    if (percentage >= 80) return { text: '🎵 Меломан!', desc: 'Ты настоящий знаток музыки!' }
    if (percentage >= 60) return { text: '🎶 Неплохо!', desc: 'Хорошее знание хитов!' }
    if (percentage >= 40) return { text: '🎧 Средне', desc: 'Можно и лучше!' }
    if (percentage >= 20) return { text: '📻 Бывало лучше', desc: 'Стоит послушать больше музыки' }
    return { text: '🔇 Мимо', desc: 'Попробуй ещё раз!' }
  }, [percentage])

  const correct = answeredQuestions.filter(a => a.isCorrect).length

  return (
    <div className="max-w-2xl mx-auto mt-8 animate-slide-up">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
        <div className="text-7xl mb-4">🏆</div>
        <h2 className="text-3xl font-bold mb-2">Игра окончена!</h2>
        <p className="text-lg text-white/60 mb-1">Игрок: {playerName}</p>
        <p className="text-5xl font-bold bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 bg-clip-text text-transparent my-4">
          {score} очков
        </p>
        <p className="text-xl mb-1">{grade.text}</p>
        <p className="text-white/60 mb-6">{grade.desc}</p>

        <div className="flex items-center justify-center gap-8 mb-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400">{correct}</div>
            <div className="text-sm text-white/50">Верно</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-400">{answeredQuestions.length - correct}</div>
            <div className="text-sm text-white/50">Неверно</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white">{answeredQuestions.length}</div>
            <div className="text-sm text-white/50">Всего</div>
          </div>
        </div>

        <div className="w-full bg-white/10 rounded-full h-3 mb-6">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all"
            style={{ width: `${percentage}%` }}
          />
        </div>

        <button
          onClick={onRestart}
          className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl font-semibold hover:from-indigo-500 hover:to-purple-500 transition-all"
        >
          Играть ещё раз
        </button>
      </div>
    </div>
  )
}
