/**
 * Tipo que representa um usuário
 */
export type User = {
  id: string
  email: string
  name: string
  company_name?: string
  created_at: string
  avatar_url?: string
  followers_count?: number
  following_count?: number
  is_followed_by_me?: boolean
}

/**
 * Tipo que representa uma postagem
 */
export type Post = {
  id: string
  user_id: string
  content: string
  created_at: string
  updated_at: string
  image_url?: string
  user?: User
  likes_count?: number
  comments_count?: number
  liked_by_user?: boolean
}

/**
 * Tipo que representa um comentário
 */
export type Comment = {
  id: string
  user_id: string
  post_id: string
  content: string
  created_at: string
  updated_at: string
  user?: User
}

/**
 * Tipo que representa uma curtida
 */
export type Like = {
  id: string
  user_id: string
  post_id: string
  created_at: string
}

/**
 * Tipo que representa uma relação de seguidor
 */
export type Follower = {
  id: string
  follower_id: string
  following_id: string
  created_at: string
}

/**
 * Tipo que representa uma mensagem
 */
export type Message = {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  is_read: boolean
  created_at: string
  updated_at: string
  sender?: User
  receiver?: User
}

/**
 * Tipo que representa uma conversa
 */
export type Conversation = {
  id: string
  user1_id: string
  user2_id: string
  last_message_id?: string
  last_message_time?: string
  unread_count: number
  created_at: string
  updated_at: string
  other_user?: User
  last_message?: Message
}
