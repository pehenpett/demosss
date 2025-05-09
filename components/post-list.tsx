"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import type { Post as PostType } from "@/types"
import Post from "@/components/post"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * Componente que exibe uma lista de postagens
 * Busca as postagens do banco de dados e as exibe em ordem cronológica inversa
 */
export default function PostList() {
  // Cria o cliente Supabase para o cliente
  const [supabase] = useState(() => createClient())

  // Estados para armazenar as postagens e controlar o carregamento
  const [posts, setPosts] = useState<PostType[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    /**
     * Busca o usuário atual e as postagens
     */
    const fetchUserAndPosts = async () => {
      setLoading(true)

      // Obtém o usuário atual
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
      }

      // Busca posts com informações do usuário
      const { data } = await supabase
        .from("posts")
        .select(`
          *,
          user:users(*)
        `)
        .order("created_at", { ascending: false })

      if (data) {
        // Busca contagem de curtidas e comentários para cada post
        const postsWithCounts = await Promise.all(
          data.map(async (post) => {
            // Contar curtidas
            const { count: likesCount } = await supabase
              .from("likes")
              .select("*", { count: "exact", head: true })
              .eq("post_id", post.id)

            // Contar comentários
            const { count: commentsCount } = await supabase
              .from("comments")
              .select("*", { count: "exact", head: true })
              .eq("post_id", post.id)

            // Verificar se o usuário atual curtiu o post
            let likedByUser = false
            if (user) {
              const { data: likeData } = await supabase
                .from("likes")
                .select("*")
                .eq("post_id", post.id)
                .eq("user_id", user.id)
                .maybeSingle()

              likedByUser = !!likeData
            }

            return {
              ...post,
              likes_count: likesCount,
              comments_count: commentsCount,
              liked_by_user: likedByUser,
            }
          }),
        )

        setPosts(postsWithCounts)
      }

      setLoading(false)
    }

    fetchUserAndPosts()

    // Configurar subscription para atualizações em tempo real
    const postsSubscription = supabase
      .channel("posts-channel")
      .on("postgres_changes", { event: "*", schema: "public", table: "posts" }, () => {
        fetchUserAndPosts()
      })
      .subscribe()

    // Limpa a subscription quando o componente é desmontado
    return () => {
      supabase.removeChannel(postsSubscription)
    }
  }, [])

  // Exibe um esqueleto de carregamento enquanto os dados são buscados
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-3">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
            <Skeleton className="h-24 w-full" />
          </div>
        ))}
      </div>
    )
  }

  // Exibe uma mensagem se não houver postagens
  if (posts.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">Nenhuma postagem encontrada. Seja o primeiro a publicar!</p>
      </div>
    )
  }

  // Renderiza a lista de postagens
  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <Post key={post.id} post={post} currentUserId={userId || ""} />
      ))}
    </div>
  )
}
