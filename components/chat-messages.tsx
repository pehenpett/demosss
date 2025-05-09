"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Send } from "lucide-react"
import type { Message, User } from "@/types"

interface ChatMessagesProps {
  otherUserId: string
  currentUserId: string
}

export default function ChatMessages({ otherUserId, currentUserId }: ChatMessagesProps) {
  const router = useRouter()
  const [supabase] = useState(() => createClient())
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [newMessage, setNewMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [otherUser, setOtherUser] = useState<User | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchUsers = async () => {
      // Buscar informações do outro usuário
      const { data: otherUserData } = await supabase.from("users").select("*").eq("id", otherUserId).single()
      if (otherUserData) {
        setOtherUser(otherUserData)
      }

      // Buscar informações do usuário atual
      const { data: currentUserData } = await supabase.from("users").select("*").eq("id", currentUserId).single()
      if (currentUserData) {
        setCurrentUser(currentUserData)
      }
    }

    const fetchMessages = async () => {
      setLoading(true)

      // Buscar mensagens entre os dois usuários
      const { data } = await supabase
        .from("messages")
        .select("*")
        .or(
          `and(sender_id.eq.${currentUserId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${currentUserId})`,
        )
        .order("created_at", { ascending: true })

      if (data) {
        setMessages(data)
      }

      setLoading(false)
    }

    fetchUsers()
    fetchMessages()

    // Configurar subscription para atualizações em tempo real
    const messagesSubscription = supabase
      .channel("messages-channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: `or(and(sender_id=eq.${currentUserId},receiver_id=eq.${otherUserId}),and(sender_id=eq.${otherUserId},receiver_id=eq.${currentUserId}))`,
        },
        () => {
          fetchMessages()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(messagesSubscription)
    }
  }, [currentUserId, otherUserId])

  useEffect(() => {
    // Rolar para o final quando novas mensagens chegarem
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newMessage.trim()) return

    setSending(true)

    try {
      // Enviar nova mensagem
      const { error } = await supabase.from("messages").insert({
        sender_id: currentUserId,
        receiver_id: otherUserId,
        content: newMessage,
      })

      if (error) throw error

      setNewMessage("")
      router.refresh()
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      <Card className="flex-1 overflow-y-auto p-4 mb-4">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-muted-foreground">Carregando mensagens...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-muted-foreground">Nenhuma mensagem ainda. Comece a conversar!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => {
              const isSentByMe = message.sender_id === currentUserId
              const formattedDate = message.created_at
                ? formatDistanceToNow(new Date(message.created_at), { addSuffix: true, locale: ptBR })
                : ""

              return (
                <div key={message.id} className={`flex ${isSentByMe ? "justify-end" : "justify-start"}`}>
                  <div className={`flex gap-2 max-w-[80%] ${isSentByMe ? "flex-row-reverse" : ""}`}>
                    <Avatar className="h-8 w-8 mt-1">
                      <AvatarImage
                        src={isSentByMe ? currentUser?.avatar_url || "" : otherUser?.avatar_url || ""}
                        alt={isSentByMe ? currentUser?.name || "" : otherUser?.name || ""}
                      />
                      <AvatarFallback>
                        {isSentByMe ? currentUser?.name?.charAt(0) || "?" : otherUser?.name?.charAt(0) || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div
                        className={`rounded-lg px-4 py-2 ${
                          isSentByMe ? "bg-primary text-primary-foreground" : "bg-muted"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{formattedDate}</p>
                    </div>
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </Card>

      <form onSubmit={handleSendMessage} className="flex gap-2">
        <Textarea
          placeholder="Digite sua mensagem..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="resize-none min-h-[60px]"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              handleSendMessage(e)
            }
          }}
        />
        <Button type="submit" size="icon" disabled={sending || !newMessage.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  )
}
