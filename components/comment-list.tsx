"use client"

import { useEffect, useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { createClient } from "@/utils/supabase/client"
import type { Comment as CommentType } from "@/types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"

interface CommentListProps {
  postId: string
}

export default function CommentList({ postId }: CommentListProps) {
  const [supabase] = useState(() => createClient())
  const [comments, setComments] = useState<CommentType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true)

      const { data } = await supabase
        .from("comments")
        .select(`
          *,
          user:users(*)
        `)
        .eq("post_id", postId)
        .order("created_at", { ascending: true })

      if (data) {
        setComments(data)
      }

      setLoading(false)
    }

    fetchComments()

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
          fetchComments()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(commentsSubscription)
    }
  }, [postId])

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="flex gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (comments.length === 0) {
    return (
      <div className="text-center py-2">
        <p className="text-sm text-muted-foreground">Nenhum comentário ainda. Seja o primeiro a comentar!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => {
        const formattedDate = comment.created_at
          ? formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: ptBR })
          : ""

        return (
          <div key={comment.id} className="flex gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={comment.user?.avatar_url || ""} alt={comment.user?.name || ""} />
              <AvatarFallback>{comment.user?.name?.charAt(0) || "?"}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{comment.user?.name}</span>
                <span className="text-xs text-muted-foreground">{formattedDate}</span>
              </div>
              <p className="text-sm mt-1">{comment.content}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
