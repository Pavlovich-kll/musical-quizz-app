'use client'

import { useState } from 'react'

interface Props {
  onStart: (teams: string[]) => void
}

export default function TeamSetup({ onStart }: Props) {
  const [count, setCount] = useState(2)
  const [names, setNames] = useState<string[]>(['Команда 1', 'Команда 2'])

  function handleCountChange(n: number) {
    const clamped = Math.max(2, Math.min(6, n))
    setCount(clamped)
    setNames(prev => {
      const next = [...prev]
      while (next.length < clamped) next.push(`Команда ${next.length + 1}`)
      return next.slice(0, clamped)
    })
  }

  function handleNameChange(i: number, val: string) {
    setNames(prev => {
      const next = [...prev]
      next[i] = val
      return next
    })
  }

  const allFilled = names.every(n => n.trim().length > 0)

  return (
    <div className="max-w-md mx-auto animate-fadeIn">
      <h2 className="text-2xl font-bold text-center mb-2">Настройка команд</h2>
      <p className="text-white/60 text-center mb-8">Сколько команд сегодня играет?</p>

      <div className="flex items-center justify-center gap-4 mb-8">
        <button
          onClick={() => handleCountChange(count - 1)}
          disabled={count <= 2}
          className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xl font-bold disabled:opacity-30 hover:bg-white/20 transition-all"
        >
          −
        </button>
        <span className="text-3xl font-bold w-8 text-center">{count}</span>
        <button
          onClick={() => handleCountChange(count + 1)}
          disabled={count >= 6}
          className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xl font-bold disabled:opacity-30 hover:bg-white/20 transition-all"
        >
          +
        </button>
      </div>

      <div className="space-y-3 mb-8">
        {names.map((name, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="text-sm font-bold text-indigo-400 w-6">#{i + 1}</span>
            <input
              type="text"
              value={name}
              onChange={e => handleNameChange(i, e.target.value)}
              placeholder={`Команда ${i + 1}`}
              className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>
        ))}
      </div>

      <button
        onClick={() => onStart(names.map(n => n.trim()))}
        disabled={!allFilled}
        className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-indigo-500 hover:to-purple-500 transition-all"
      >
        Начать игру!
      </button>
    </div>
  )
}
