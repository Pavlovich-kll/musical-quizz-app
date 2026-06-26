'use client'

import type { Category, Question } from '@/lib/supabase/database.types'

interface TeamScore {
  name: string
  score: number
  correct: number
  total: number
}

interface Props {
  categories: Category[]
  questionsByCategory: Record<string, Question[]>
  answeredQuestions: string[]
  onSelectQuestion: (question: Question) => void
  currentTeam?: string
  teamScores?: TeamScore[]
}

const POINT_VALUES = [10, 20, 30, 40, 50]
const CATEGORY_COLORS = [
  'from-indigo-600 to-purple-700',
  'from-emerald-600 to-teal-700',
  'from-orange-600 to-red-600',
  'from-pink-600 to-rose-700',
  'from-cyan-600 to-blue-700',
]

const POINT_COLORS = [
  'from-yellow-400 to-yellow-500',
  'from-orange-400 to-orange-500',
  'from-red-400 to-red-500',
  'from-rose-400 to-rose-500',
  'from-pink-400 to-pink-500',
]

export default function GameBoard({
  categories,
  questionsByCategory,
  answeredQuestions,
  onSelectQuestion,
  currentTeam,
  teamScores,
}: Props) {
  return (
    <div className="max-w-4xl mx-auto animate-fadeIn">
      <div className="overflow-x-auto">
        <div className="flex flex-col gap-2 min-w-[320px]">
          {categories.map((cat, catIdx) => {
            const catQuestions = questionsByCategory[cat.id] || []

            return (
              <div key={cat.id} className="flex items-stretch gap-2">
                <div
                  className={`w-36 md:w-48 p-3 rounded-xl bg-gradient-to-br ${CATEGORY_COLORS[catIdx % CATEGORY_COLORS.length]} flex flex-col items-center justify-center shrink-0`}
                >
                  <div className="text-xl mb-1">{cat.icon}</div>
                  <div className="text-xs font-bold leading-tight text-center">{cat.name}</div>
                </div>

                <div className="flex gap-2 flex-1">
                  {POINT_VALUES.map(pv => {
                    const q = catQuestions.find(q => q.point_value === pv)
                    const isAnswered = q ? answeredQuestions.includes(q.id) : false
                    const isEmpty = !q

                    return (
                      <button
                        key={`${cat.id}-${pv}`}
                        disabled={!q || isAnswered}
                        onClick={() => q && onSelectQuestion(q)}
                        className={`
                          flex-1 min-h-[60px] rounded-xl text-center font-bold text-lg transition-all
                          ${isEmpty ? 'bg-white/5 border border-white/5 cursor-default' : ''}
                          ${!isEmpty && !isAnswered
                            ? `bg-gradient-to-br ${POINT_COLORS[pv / 10 - 1]} text-black
                               hover:scale-105 hover:shadow-lg hover:shadow-yellow-500/20
                               active:scale-95 cursor-pointer`
                            : ''}
                          ${isAnswered
                            ? 'bg-white/5 border border-white/10 text-white/30 line-through cursor-not-allowed'
                            : ''}
                        `}
                      >
                        {isEmpty ? '' : isAnswered ? '✓' : pv}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
