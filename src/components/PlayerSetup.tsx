'use client'

import type { Category } from '@/lib/supabase/database.types'

interface Props {
  onStart: () => void
  categories: Category[]
}

const CATEGORY_COLORS = [
  'from-indigo-500 to-purple-600',
  'from-emerald-500 to-teal-600',
  'from-orange-500 to-red-500',
  'from-pink-500 to-rose-600',
  'from-cyan-500 to-blue-600',
  'from-yellow-500 to-amber-600',
  'from-violet-500 to-purple-600',
  'from-green-500 to-emerald-600',
  'from-sky-500 to-indigo-600',
  'from-fuchsia-500 to-pink-600',
]

export default function PlayerSetup({ onStart, categories }: Props) {
  return (
    <div className="max-w-4xl mx-auto animate-fadeIn">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">🎵 Музыкальный квиз</h2>
        <p className="text-white/60">Угадай песню по категориям! Выбери вопрос и набери максимум очков.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
        {categories.map((cat, i) => (
          <div
            key={cat.id}
            className={`p-4 rounded-xl bg-gradient-to-br ${CATEGORY_COLORS[i % CATEGORY_COLORS.length]} text-center`}
          >
            <div className="text-2xl mb-1">{cat.icon}</div>
            <div className="text-xs font-medium leading-tight">{cat.name}</div>
          </div>
        ))}
      </div>

      <div className="max-w-md mx-auto bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
        <button
          onClick={onStart}
          className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl font-semibold hover:from-indigo-500 hover:to-purple-500 transition-all"
        >
          Начать квиз!
        </button>
        <p className="text-xs text-white/40 mt-3">15 вопросов в раунде</p>
      </div>
    </div>
  )
}
