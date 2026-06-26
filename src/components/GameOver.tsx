'use client'

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

interface Props {
  teamScores: TeamScore[]
  answeredQuestions: AnsweredQuestion[]
  onRestart: () => void
}

export default function GameOver({ teamScores, answeredQuestions, onRestart }: Props) {
  const sorted = [...teamScores].sort((a, b) => b.score - a.score)
  const maxScore = 15 * 50

  const totalCorrect = answeredQuestions.filter(a => a.isCorrect).length

  return (
    <div className="max-w-2xl mx-auto mt-8 animate-slide-up">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
        <div className="text-7xl mb-4">🏆</div>
        <h2 className="text-3xl font-bold mb-2">Игра окончена!</h2>
        <p className="text-white/60 mb-6">Все {answeredQuestions.length} вопросов сыграно</p>

        <div className="space-y-4 mb-8">
          {sorted.map((ts, i) => {
            const isWinner = i === 0 && sorted.length > 1 && ts.score > (sorted[1]?.score ?? 0)
            return (
              <div
                key={ts.name}
                className={`p-4 rounded-xl ${isWinner
                  ? 'bg-yellow-900/30 border border-yellow-500/30'
                  : 'bg-white/5 border border-white/10'}`}
              >
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      {isWinner && <span className="text-2xl">👑</span>}
                      <span className="font-bold text-lg">{ts.name}</span>
                    </div>
                    <div className="text-sm text-white/50">
                      Верно: {ts.correct}/{ts.total}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-3xl font-bold ${isWinner ? 'text-yellow-400' : 'text-white'}`}>
                      {ts.score}
                    </div>
                    <div className="text-xs text-white/40">очков</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="flex items-center justify-center gap-6 mb-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400">{totalCorrect}</div>
            <div className="text-sm text-white/50">Верно всего</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-400">{answeredQuestions.length - totalCorrect}</div>
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
            style={{ width: `${Math.round((sorted[0]?.score ?? 0) / maxScore * 100)}%` }}
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
