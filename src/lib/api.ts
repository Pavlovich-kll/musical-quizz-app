import { createServerSupabaseClient } from './supabase/server'
import { createClient } from './supabase/client'
import type { Category, Question } from './supabase/database.types'

export async function fetchCategories(): Promise<Category[]> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  return data || []
}

export async function fetchQuestionsByCategory(categoryIds: string[]): Promise<Record<string, Question[]>> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('questions')
    .select('*')
    .in('category_id', categoryIds)
    .order('point_value')

  const grouped: Record<string, Question[]> = {}
  for (const q of data || []) {
    if (!grouped[q.category_id]) grouped[q.category_id] = []
    grouped[q.category_id].push(q)
  }
  return grouped
}

export function createQuestionSlug(question: Question): string {
  return `${question.id}-${question.answer_song
    .toLowerCase()
    .replace(/[^a-zа-яё0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 40)}`
}

export function isAnsweredQuestion(questionId: string, answeredIds: string[]): boolean {
  return answeredIds.includes(questionId)
}
