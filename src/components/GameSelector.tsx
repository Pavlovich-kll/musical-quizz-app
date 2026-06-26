'use client'

import type { GameDef } from '@/lib/games-data'

interface Props {
  games: GameDef[]
  onSelect: (game: GameDef) => void
}

export default function GameSelector({ games, onSelect }: Props) {
  return (
    <div className="max-w-2xl mx-auto animate-fadeIn">
      <h2 className="text-2xl font-bold text-center mb-2">Выберите игру</h2>
      <p className="text-white/60 text-center mb-8">Каждая игра содержит 5 категорий вопросов</p>

      <div className="grid gap-4">
        {games.map(game => (
          <button
            key={game.id}
            onClick={() => onSelect(game)}
            className={`p-6 rounded-2xl border text-left transition-all group ${
              game.isCustom
                ? 'bg-gradient-to-br from-green-600/20 to-emerald-600/20 border-green-500/20 hover:from-green-600/40 hover:to-emerald-600/40 hover:border-green-400/40'
                : 'bg-gradient-to-br from-indigo-600/40 to-purple-600/40 border-indigo-500/30 hover:from-indigo-600/60 hover:to-purple-600/60 hover:border-indigo-400/50'
            }`}
          >
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold group-hover:text-indigo-300 transition-colors">{game.title}</h3>
              {game.isCustom && <span className="text-[10px] px-2 py-0.5 bg-green-600/50 rounded-full text-green-200">Своя</span>}
            </div>
            <p className="text-sm text-white/60 mt-1">{game.description}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
