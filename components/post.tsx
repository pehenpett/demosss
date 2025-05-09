"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { createClient } from "@/utils/supabase/client"
import type { Post as PostType } from "@/types"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Heart, MessageCircle, ExternalLink } from "lucide-react"
import CommentList from "@/components/comment-list"
import Link from "next/link"

/**
 * Props para o componente Post
 */
interface PostProps {
  post: PostType
  currentUserId: string
}

/**
 * Componente que exibe uma postagem individual
 * @param post Dados da postagem a ser exibida
 * @param currentUserId ID do usuário atual
 */
export default function Post({ post, currentUserId }: PostProps) {
  // Hook de roteamento para navegação
  const router = useRouter()

  // Cria o cliente Supabase para o cliente
  const [supabase] = useState(() => createClient())

  // Estados para controlar a interação com a postagem
  const [showComments, setShowComments] = useState(false)
  const [newComment, setNewComment] = useState("")
  const [submittingComment, setSubmittingComment] = useState(false)
  const [liked, setLiked] = useState(post.liked_by_user || false)
  const [likesCount, setLikesCount] = useState(post.likes_count || 0)

  /**
   * Manipula a ação de curtir/descurtir uma postagem
   */
  const handleLike = async () => {
    if (!currentUserId) return

    if (liked) {
      // Remover curtida
      await supabase.from("likes").delete().eq("post_id", post.id).eq("user_id", currentUserId)

      setLiked(false)
      setLikesCount((prev) => prev - 1)
    } else {
      // Adicionar curtida
      await supabase.from("likes").insert({
        post_id: post.id,
        user_id: currentUserId,
      })

      setLiked(true)
      setLikesCount((prev) => prev + 1)
    }
  }

  /**
   * Manipula o envio de um novo comentário
   * @param e Evento de envio do formulário
   */
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newComment.trim() || !currentUserId) return

    setSubmittingComment(true)

    try {
      // Insere o novo comentário na tabela comments
      await supabase.from("comments").insert({
        post_id: post.id,
        user_id: currentUserId,
        content: newComment,
      })

      // Limpa o formulário e atualiza a página
      setNewComment("")
      router.refresh()
    } catch (error) {
      console.error("Erro ao adicionar comentário:", error)
    } finally {
      setSubmittingComment(false)
    }
  }

  // Formata a data de criação da postagem
  const formattedDate = post.created_at
    ? formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: ptBR })
    : ""

  return (
    <Card>
      <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-2">
        {/* Avatar e link para o perfil do autor */}
        <Link href={`/profile/${post.user?.id}`}>
          <Avatar className="h-10 w-10">
            <AvatarImage src={post.user?.avatar_url || ""} alt={post.user?.name || ""} />
            <AvatarFallback>{post.user?.name?.charAt(0) || "?"}</AvatarFallback>
          </Avatar>
        </Link>

        <div className="space-y-1 flex-1">
          <div className="flex items-center justify-between">
            {/* Nome do autor */}
            <Link href={`/profile/${post.user?.id}`} className="hover:underline">
              <div className="font-semibold">{post.user?.name}</div>
            </Link>

            {/* Link para a página de detalhes da postagem */}
            <Link href={`/post/${post.id}`} className="text-muted-foreground hover:text-foreground">
              <ExternalLink className="h-4 w-4" />
              <span className="sr-only">Ver detalhes</span>
            </Link>
          </div>

          {/* Data da postagem */}
          <div className="text-xs text-muted-foreground">{formattedDate}</div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Conteúdo da postagem */}
        <p className="whitespace-pre-wrap">{post.content}</p>

        {/* Imagem da postagem, se houver */}
        {post.image_url && (
          <div className="mt-3">
            <img
              src={post.image_url || "/placeholder.svg"}
              alt="Imagem da postagem"
              className="rounded-md max-h-96 object-cover"
            />
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col space-y-2 pt-2">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-4">
            {/* Botão de curtir */}
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-1 text-muted-foreground"
              onClick={handleLike}
            >
              <Heart className={`h-5 w-5 ${liked ? "fill-red-500 text-red-500" : ""}`} />
              <span>{likesCount}</span>
            </Button>

            {/* Botão de comentários */}
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-1 text-muted-foreground"
              onClick={() => setShowComments(!showComments)}
            >
              <MessageCircle className="h-5 w-5" />
              <span>{post.comments_count || 0}</span>
            </Button>
          </div>

          {/* Link para a página de detalhes da postagem */}
          <Link href={`/post/${post.id}`}>
            <Button variant="ghost" size="sm">
              Ver detalhes
            </Button>
          </Link>
        </div>

        {/* Seção de comentários (exibida apenas quando showComments é true) */}
        {showComments && (
          <div className="w-full pt-2 space-y-4">
            {/* Formulário para adicionar um novo comentário */}
            <form onSubmit={handleSubmitComment} className="flex gap-2">
              <Textarea
                placeholder="Escreva um comentário..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="resize-none min-h-[60px]"
              />
              <Button type="submit" size="sm" disabled={submittingComment || !newComment.trim()}>
                Enviar
              </Button>
            </form>

            {/* Lista de comentários existentes */}
            <CommentList postId={post.id} />
          </div>
        )}
      </CardFooter>
    </Card>
  )
}
