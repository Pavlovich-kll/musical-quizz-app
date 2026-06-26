'use client'

import { useState, useEffect } from 'react'
import { GAMES } from '@/lib/games-data'
import { loadCustomGames, saveCustomGame, deleteCustomGame, genId } from '@/lib/custom-games'
import type { CustomGame, CustomCategory, CustomQuestion } from '@/lib/custom-games'

type Tab = 'games' | 'edit-game'

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('games')
  const [customGames, setCustomGames] = useState<CustomGame[]>([])
  const [editing, setEditing] = useState<CustomGame | null>(null)

  useEffect(() => {
    setCustomGames(loadCustomGames())
  }, [])

  function refresh() {
    setCustomGames(loadCustomGames())
  }

  function createGame() {
    const game: CustomGame = {
      id: genId(),
      title: '',
      description: '',
      categories: [],
      questions: [],
      createdAt: new Date().toISOString(),
    }
    setEditing(game)
    setTab('edit-game')
  }

  function handleSave() {
    if (!editing || !editing.title.trim()) return
    saveCustomGame(editing)
    setEditing(null)
    setTab('games')
    refresh()
  }

  function handleDelete(id: string) {
    deleteCustomGame(id)
    refresh()
  }

  function addCategory() {
    if (!editing) return
    setEditing({
      ...editing,
      categories: [...editing.categories, { id: genId(), name: '', description: '', icon: '🎵' }],
    })
  }

  function updateCategory(catId: string, field: keyof CustomCategory, value: string) {
    if (!editing) return
    setEditing({
      ...editing,
      categories: editing.categories.map(c => c.id === catId ? { ...c, [field]: value } : c),
    })
  }

  function removeCategory(catId: string) {
    if (!editing) return
    setEditing({
      ...editing,
      categories: editing.categories.filter(c => c.id !== catId),
      questions: editing.questions.filter(q => q.categoryId !== catId),
    })
  }

  function addQuestion(categoryId: string) {
    if (!editing) return
    setEditing({
      ...editing,
      questions: [...editing.questions, {
        id: genId(),
        categoryId,
        pointValue: 10,
        questionText: '',
        answerSong: '',
        answerArtist: '',
        youtubeUrl: '',
      }],
    })
  }

  function updateQuestion(qId: string, field: keyof CustomQuestion, value: string | number) {
    if (!editing) return
    setEditing({
      ...editing,
      questions: editing.questions.map(q => q.id === qId ? { ...q, [field]: value } : q),
    })
  }

  function removeQuestion(qId: string) {
    if (!editing) return
    setEditing({
      ...editing,
      questions: editing.questions.filter(q => q.id !== qId),
    })
  }

  if (tab === 'edit-game' && editing) {
    return (
      <div className="max-w-3xl mx-auto p-4 md:p-6 animate-fadeIn">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">{editing.id.startsWith('custom_') ? 'Создание игры' : 'Редактирование'}</h1>
          <button onClick={() => { setEditing(null); setTab('games') }} className="text-sm text-white/50 hover:text-white transition-colors">← Назад</button>
        </div>

        <div className="space-y-4 mb-8">
          <div>
            <label className="text-sm text-white/50 mb-1 block">Название игры</label>
            <input
              type="text"
              value={editing.title}
              onChange={e => setEditing({ ...editing, title: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-indigo-500"
              placeholder="Название игры"
            />
          </div>
          <div>
            <label className="text-sm text-white/50 mb-1 block">Описание</label>
            <input
              type="text"
              value={editing.description}
              onChange={e => setEditing({ ...editing, description: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-indigo-500"
              placeholder="Описание игры"
            />
          </div>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Категории</h2>
            <button onClick={addCategory} className="px-4 py-2 bg-indigo-600 rounded-xl text-sm font-semibold hover:bg-indigo-500 transition-all">
              + Добавить категорию
            </button>
          </div>

          {editing.categories.length === 0 && (
            <p className="text-white/40 text-center py-8">Нет категорий. Добавьте хотя бы одну.</p>
          )}

          {editing.categories.map(cat => (
            <div key={cat.id} className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-indigo-400">Категория</span>
                <button onClick={() => removeCategory(cat.id)} className="text-xs text-red-400 hover:text-red-300">Удалить</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <input
                  type="text"
                  value={cat.icon}
                  onChange={e => updateCategory(cat.id, 'icon', e.target.value)}
                  className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:border-indigo-500"
                  placeholder="🎵"
                />
                <input
                  type="text"
                  value={cat.name}
                  onChange={e => updateCategory(cat.id, 'name', e.target.value)}
                  className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:border-indigo-500"
                  placeholder="Название категории"
                />
                <input
                  type="text"
                  value={cat.description}
                  onChange={e => updateCategory(cat.id, 'description', e.target.value)}
                  className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:border-indigo-500"
                  placeholder="Описание"
                />
              </div>

              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-white/40">Вопросы ({editing.questions.filter(q => q.categoryId === cat.id).length})</span>
                <button onClick={() => addQuestion(cat.id)} className="text-xs px-3 py-1 bg-indigo-600/50 rounded-lg hover:bg-indigo-600 transition-all">
                  + Вопрос
                </button>
              </div>

              {editing.questions.filter(q => q.categoryId === cat.id).map(q => (
                <div key={q.id} className="p-3 mb-2 rounded-lg bg-white/5 border border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-white/30">Вопрос</span>
                    <button onClick={() => removeQuestion(q.id)} className="text-xs text-red-400 hover:text-red-300">Удалить</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                    <select
                      value={q.pointValue}
                      onChange={e => updateQuestion(q.id, 'pointValue', parseInt(e.target.value))}
                      className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none"
                    >
                      {[10, 20, 30, 40, 50].map(v => <option key={v} value={v}>{v} очков</option>)}
                    </select>
                    <input
                      type="text"
                      value={q.questionText}
                      onChange={e => updateQuestion(q.id, 'questionText', e.target.value)}
                      className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none"
                      placeholder="Текст вопроса (оставьте пустым для аудио)"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                    <input
                      type="text"
                      value={q.answerSong}
                      onChange={e => updateQuestion(q.id, 'answerSong', e.target.value)}
                      className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none"
                      placeholder="Название песни"
                    />
                    <input
                      type="text"
                      value={q.answerArtist}
                      onChange={e => updateQuestion(q.id, 'answerArtist', e.target.value)}
                      className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none"
                      placeholder="Исполнитель"
                    />
                  </div>
                  <input
                    type="url"
                    value={q.youtubeUrl}
                    onChange={e => updateQuestion(q.id, 'youtubeUrl', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none"
                    placeholder="Ссылка на YouTube или аудиофайл (необязательно)"
                  />
                </div>
              ))}
            </div>
          ))}
        </div>

        <button
          onClick={handleSave}
          disabled={!editing.title.trim() || editing.categories.length === 0}
          className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl font-semibold disabled:opacity-50 hover:from-green-500 hover:to-emerald-500 transition-all"
        >
          Сохранить игру
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6 animate-fadeIn">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">🎮 Управление играми</h1>
        <button onClick={createGame} className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl font-semibold hover:from-indigo-500 hover:to-purple-500 transition-all">
          + Новая игра
        </button>
      </div>

      <h2 className="text-lg font-bold mb-3 text-indigo-400">Стандартные игры</h2>
      <div className="grid gap-3 mb-8">
        {GAMES.map(game => (
          <div key={game.id} className="p-4 rounded-xl bg-white/5 border border-white/10">
            <h3 className="font-bold">{game.title}</h3>
            <p className="text-sm text-white/50">{game.description}</p>
            <p className="text-xs text-white/30 mt-1">Категорий: {game.categoryIds.length}</p>
          </div>
        ))}
      </div>

      <h2 className="text-lg font-bold mb-3 text-indigo-400">Пользовательские игры</h2>
      {customGames.length === 0 ? (
        <p className="text-white/40 text-center py-8">Пока нет пользовательских игр</p>
      ) : (
        <div className="grid gap-3">
          {customGames.map(game => (
            <div key={game.id} className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold">{game.title || 'Без названия'}</h3>
                  <p className="text-sm text-white/50">{game.description}</p>
                  <p className="text-xs text-white/30 mt-1">
                    Категорий: {game.categories.length} | Вопросов: {game.questions.length}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setEditing(game); setTab('edit-game') }}
                    className="text-xs px-3 py-1 bg-indigo-600/50 rounded-lg hover:bg-indigo-600 transition-all"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(game.id)}
                    className="text-xs px-3 py-1 bg-red-600/50 rounded-lg hover:bg-red-600 transition-all"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 text-center">
        <a href="/" className="text-sm text-white/40 hover:text-white transition-colors">← На главную</a>
      </div>
    </div>
  )
}
