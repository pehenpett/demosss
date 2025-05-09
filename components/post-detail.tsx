"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { createClient } from "@/utils/supabase/client"
import type { Post as PostType, Comment as CommentType } from "@/types"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Heart, MessageCircle, Share2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"

interface PostDetailProps {
  postId: string
  currentUserId: string
}

export default function PostDetail({ postId, currentUserId }: PostDetailProps) {
  const [supabase] = useState(() => createClient())
  const [post, setPost] = useState<PostType | null>(null)
  const [comments, setComments] = useState<CommentType[]>([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState("")
  const [submittingComment, setSubmittingComment] = useState(false)
  const [liked, setLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(0)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [shareUrl, setShareUrl] = useState("")

  useEffect(() => {
    const fetchPostAndComments = async () => {
      setLoading(true)

      // Buscar a postagem
      const { data: postData } = await supabase
        .from("posts")
        .select(`
          *,
          user:users(*)
        `)
        .eq("id", postId)
        .single()

      if (postData) {
        // Contar curtidas
        const { count: likesCount } = await supabase
          .from("likes")
          .select("*", { count: "exact", head: true })
          .eq("post_id", postId)

        // Verificar se o usuário atual curtiu o post
        let likedByUser = false
        if (currentUserId) {
          const { data: likeData } = await supabase
            .from("likes")
            .select("*")
            .eq("post_id", postId)
            .eq("user_id", currentUserId)
            .maybeSingle()

          likedByUser = !!likeData
        }

        setPost({
          ...postData,
          likes_count: likesCount,
          liked_by_user: likedByUser,
        })
        setLiked(likedByUser)
        setLikesCount(likesCount || 0)

        // Buscar comentários
        const { data: commentsData } = await supabase
          .from("comments")
          .select(`
            *,
            user:users(*)
          `)
          .eq("post_id", postId)
          .order("created_at", { ascending: true })

        if (commentsData) {
          setComments(commentsData)
        }
      }

      setLoading(false)
    }

    fetchPostAndComments()

    // Configurar subscription para atualizações em tempo real
    const commentsSubscription = supabase
      .channel(`comments-channel-${postId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "comments",
          filter: `post_id=eq.${postId}`,
        },
        () => {
          fetchPostAndComments()
        },
      )
      .subscribe()

    const likesSubscription = supabase
      .channel(`likes-channel-${postId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "likes",
          filter: `post_id=eq.${postId}`,
        },
        () => {
          fetchPostAndComments()
        },
      )
      .subscribe()

    // Definir URL de compartilhamento
    setShareUrl(window.location.href)

    return () => {
      supabase.removeChannel(commentsSubscription)
      supabase.removeChannel(likesSubscription)
    }
  }, [postId, currentUserId])

  const handleLike = async () => {
    if (!currentUserId) return

    if (liked) {
      // Remover curtida
      await supabase.from("likes").delete().eq("post_id", postId).eq("user_id", currentUserId)

      setLiked(false)
      setLikesCount((prev) => prev - 1)
    } else {
      // Adicionar curtida
      await supabase.from("likes").insert({
        post_id: postId,
        user_id: currentUserId,
      })

      setLiked(true)
      setLikesCount((prev) => prev + 1)
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newComment.trim() || !currentUserId) return

    setSubmittingComment(true)

    try {
      await supabase.from("comments").insert({
        post_id: postId,
        user_id: currentUserId,
        content: newComment,
      })

      setNewComment("")
    } catch (error) {
      console.error("Erro ao adicionar comentário:", error)
    } finally {
      setSubmittingComment(false)
    }
  }

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(shareUrl)
    setShareDialogOpen(false)
    toast({
      title: "Link copiado!",
      description: "O link da postagem foi copiado para a área de transferência.",
    })
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader className="space-y-3">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-24 w-full" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-full" />
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">Postagem não encontrada.</p>
      </div>
    )
  }

  const formattedDate = post.created_at
    ? formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: ptBR })
    : ""

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-2">
          <Link href={`/profile/${post.user?.id}`}>
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.user?.avatar_url || ""} alt={post.user?.name || ""} />
              <AvatarFallback>{post.user?.name?.charAt(0) || "?"}</AvatarFallback>
            </Avatar>
          </Link>
          <div className="space-y-1">
            <Link href={`/profile/${post.user?.id}`} className="hover:underline">
              <div className="font-semibold">{post.user?.name}</div>
            </Link>
            <div className="text-xs text-muted-foreground">{formattedDate}</div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap">{post.content}</p>
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
        <CardFooter className="flex flex-col space-y-4 pt-2">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1 text-muted-foreground"
                onClick={handleLike}
              >
                <Heart className={`h-5 w-5 ${liked ? "fill-red-500 text-red-500" : ""}`} />
                <span>{likesCount}</span>
              </Button>
              <div className="flex items-center gap-1 text-muted-foreground">
                <MessageCircle className="h-5 w-5" />
                <span>{comments.length}</span>
              </div>
            </div>
            <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-1 text-muted-foreground">
                  <Share2 className="h-5 w-5" />
                  <span>Compartilhar</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Compartilhar postagem</DialogTitle>
                  <DialogDescription>Copie o link abaixo para compartilhar esta postagem</DialogDescription>
                </DialogHeader>
                <div className="flex items-center space-x-2">
                  <Input value={shareUrl} readOnly onClick={(e) => e.currentTarget.select()} />
                  <Button onClick={handleCopyShareLink}>Copiar</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="w-full pt-4 border-t space-y-6">
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

            <div className="space-y-4">
              <h3 className="font-medium">Comentários ({comments.length})</h3>
              {comments.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum comentário ainda. Seja o primeiro a comentar!</p>
              ) : (
                comments.map((comment) => {
                  const commentDate = comment.created_at
                    ? formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: ptBR })
                    : ""

                  return (
                    <div key={comment.id} className="flex gap-3 pb-4 border-b last:border-0">
                      <Link href={`/profile/${comment.user?.id}`}>
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={comment.user?.avatar_url || ""} alt={comment.user?.name || ""} />
                          <AvatarFallback>{comment.user?.name?.charAt(0) || "?"}</AvatarFallback>
                        </Avatar>
                      </Link>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Link href={`/profile/${comment.user?.id}`} className="font-medium text-sm hover:underline">
                            {comment.user?.name}
                          </Link>
                          <span className="text-xs text-muted-foreground">{commentDate}</span>
                        </div>
                        <p className="text-sm mt-1">{comment.content}</p>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
