export interface Category {
  id: string
  name: string
  description: string
  icon: string
  created_at: string
}

export interface Question {
  id: string
  category_id: string
  point_value: number
  question_text: string | null
  answer_song: string
  answer_artist: string
  clue: string | null
  sort_order: number
  created_at: string
  media_url: string | null
}

export interface GameSession {
  id: string
  player_name: string
  score: number
  current_question: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Answer {
  id: string
  session_id: string
  question_id: string
  player_answer: string
  is_correct: boolean
  points_earned: number
  created_at: string
}

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: Category
        Insert: Omit<Category, 'id' | 'created_at'>
        Update: Partial<Category>
      }
      questions: {
        Row: Question
        Insert: Omit<Question, 'id' | 'created_at'>
        Update: Partial<Question>
      }
      game_sessions: {
        Row: GameSession
        Insert: Omit<GameSession, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<GameSession>
      }
      answers: {
        Row: Answer
        Insert: Omit<Answer, 'id' | 'created_at'>
        Update: Partial<Answer>
      }
    }
  }
}
