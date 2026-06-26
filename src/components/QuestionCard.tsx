'use client'

import { useState } from 'react'
import type { Category, Question } from '@/lib/supabase/database.types'

interface Props {
  question: Question
  categories: Category[]
  onAnswer: (isCorrect: boolean) => void
  questionsLeft: number
  currentTeam?: string
}

export default function QuestionCard({ question, categories, onAnswer, questionsLeft, currentTeam }: Props) {
  const [showAnswer, setShowAnswer] = useState(false)
  const category = categories.find(c => c.id === question.category_id)

  function handleReveal() {
    setShowAnswer(true)
  }

  return (
    <div className="max-w-2xl mx-auto mt-8 animate-scale-in">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
        <div className="flex items-center gap-2 mb-4">
          <span className="px-3 py-1 bg-indigo-600/50 rounded-full text-sm">
            {category?.icon} {category?.name}
          </span>
          <span className="px-3 py-1 bg-yellow-600/50 rounded-full text-sm font-bold">
            {question.point_value} очков
          </span>
          {currentTeam && (
            <span className="px-3 py-1 bg-indigo-600/30 rounded-full text-xs ml-auto">
              Ход: {currentTeam}
            </span>
          )}
          <span className="text-xs text-white/40 ml-2">
            Осталось: {questionsLeft}
          </span>
        </div>

        <div className="min-h-[100px] flex items-center justify-center mb-6">
          {question.question_text ? (
            <div className="text-center">
              <p className="text-sm text-white/50 mb-2">Неправильные слова:</p>
              <p className="text-lg italic text-yellow-300/80">&ldquo;{question.question_text}&rdquo;</p>
              <p className="text-sm text-white/40 mt-2">Что это за песня?</p>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-sm text-white/50 mb-2">
                {category?.name === 'Ё май онли ван' && 'Какая песня скрывается за этим названием?'}
                {category?.name === 'Потеряли слова' && 'Вспомни песню по контексту'}
                {category?.name === 'Я сижу на камушке ла-ла-ла' && 'В какой песне есть "ла-ла-ла"?'}
                {category?.name === 'Янсеп' && 'Угадай песню'}
                {category?.name === 'Сей на-на-на' && 'В какой песне есть "на-на-на"?'}
                {category?.name === 'ООО «Мы не придумали»' && 'Угадай оригинальную песню'}
                {category?.name === 'Еврибади лавс самбади' && 'Что за песня для вечеринки?'}
                {category?.name === 'Соединились наши орбиты/планеты' && 'Из каких двух песен этот микс?'}
                {category?.name === 'Чай не утопнем' && 'Что за необычная песня?'}
                {!category?.name && 'Что за песня?'}
              </p>
              <div className="text-6xl mb-4">
                {category?.name === 'Ё май онли ван' && '🎤'}
                {category?.name === 'Потеряли слова' && '📝'}
                {category?.name === 'Я сижу на камушке ла-ла-ла' && '🎶'}
                {category?.name === 'Янсеп' && '🎵'}
                {category?.name === 'Сей на-на-на' && '🎤'}
                {category?.name === 'ООО «Мы не придумали»' && '🔄'}
                {category?.name === 'Еврибади лавс самбади' && '🎉'}
                {category?.name === 'Соединились наши орбиты/планеты' && '🎧'}
                {category?.name === 'Чай не утопнем' && '🎭'}
                {!category?.name && '🎵'}
              </div>
              <p className="text-white/60 text-sm">
                {category?.description || 'Угадай песню'}
              </p>
            </div>
          )}
        </div>

        {question.media_url && (
          <div className="mb-6 p-4 bg-indigo-900/30 border border-indigo-500/30 rounded-xl text-center">
            <audio
              key={question.id}
              src={question.media_url}
              controls
              autoPlay
              className="w-full max-w-xs mx-auto"
              onError={() => console.error('Audio load error:', question.media_url)}
            >
              Ваш браузер не поддерживает аудио
            </audio>
          </div>
        )}

        {!showAnswer ? (
          <button
            onClick={handleReveal}
            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl font-bold text-lg hover:from-indigo-500 hover:to-purple-500 transition-all animate-pulse-glow"
          >
            Показать ответ
          </button>
        ) : (
          <div className="space-y-4">
            <div className="bg-white/10 rounded-xl p-6 text-center">
              <p className="text-lg text-white/50">Правильный ответ:</p>
              <p className="text-2xl font-bold mt-2">{question.answer_song}</p>
              <p className="text-xl text-purple-300 mt-1">{question.answer_artist}</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => onAnswer(true)}
                className="flex-1 py-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl font-semibold hover:from-green-500 hover:to-emerald-500 transition-all"
              >
                ✅ {currentTeam} угадал(а)
              </button>
              <button
                onClick={() => onAnswer(false)}
                className="flex-1 py-3 bg-gradient-to-r from-red-600 to-rose-600 rounded-xl font-semibold hover:from-red-500 hover:to-rose-500 transition-all"
              >
                ❌ Не угадал(а)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
