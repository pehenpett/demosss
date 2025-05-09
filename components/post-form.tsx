"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { User } from "@/types"

/**
 * Props para o componente PostForm
 */
interface PostFormProps {
  userId: string
}

/**
 * Componente de formulário para criar novas postagens
 * @param userId ID do usuário que está criando a postagem
 */
export default function PostForm({ userId }: PostFormProps) {
  // Hook de roteamento para navegação
  const router = useRouter()

  // Cria o cliente Supabase para o cliente
  const [supabase] = useState(() => createClient())

  // Estados para controlar o formulário e dados do usuário
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  /**
   * Busca os dados do usuário ao montar o componente
   */
  useEffect(() => {
    const fetchUser = async () => {
      // Busca dados do usuário na tabela users
      const { data } = await supabase.from("users").select("*").eq("id", userId).single()

      if (data) {
        setUser(data)
      }
    }

    if (userId) {
      fetchUser()
    }
  }, [userId])

  /**
   * Manipula o envio do formulário para criar uma nova postagem
   * @param e Evento de envio do formulário
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Verifica se o conteúdo não está vazio
    if (!content.trim()) return

    setLoading(true)

    try {
      // Insere a nova postagem na tabela posts
      await supabase.from("posts").insert({
        user_id: userId,
        content,
      })

      // Limpa o formulário e atualiza a página
      setContent("")
      router.refresh()
    } catch (error) {
      console.error("Erro ao criar post:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            {/* Avatar do usuário */}
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.avatar_url || ""} alt={user?.name || ""} />
              <AvatarFallback>{user?.name?.charAt(0) || "?"}</AvatarFallback>
            </Avatar>

            {/* Campo de texto para o conteúdo da postagem */}
            <div className="flex-1">
              <Textarea
                placeholder="O que você está pensando?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="resize-none"
                rows={3}
              />
            </div>
          </div>
        </CardContent>

        {/* Botão de publicar */}
        <CardFooter className="flex justify-end border-t px-6 py-4">
          <Button type="submit" disabled={loading || !content.trim()}>
            {loading ? "Publicando..." : "Publicar"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
