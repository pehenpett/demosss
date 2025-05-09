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
import type { User } from "@/types"

interface SupportChatProps {
  currentUserId: string
}

// Mensagens pré-definidas do suporte
const SUPPORT_MESSAGES = [
  {
    id: "welcome",
    content: "Olá! Bem-vindo ao suporte da DEMOS. Como posso ajudar você hoje?",
    delay: 1000,
  },
  {
    id: "options",
    content:
      "Posso ajudar com:\n- Dúvidas sobre sua conta\n- Problemas técnicos\n- Sugestões de recursos\n- Outras questões",
    delay: 2000,
  },
]

// Respostas automáticas baseadas em palavras-chave
const AUTO_RESPONSES: Record<string, string> = {
  conta:
    "Para questões relacionadas à sua conta, você pode acessar a página de configurações em /settings ou alterar seu perfil em /profile/edit.",
  senha:
    "Para redefinir sua senha, use a opção 'Esqueci minha senha' na tela de login ou acesse as configurações da sua conta.",
  problema:
    "Lamento pelo inconveniente. Poderia descrever o problema com mais detalhes para que possamos ajudar melhor?",
  bug: "Obrigado por relatar. Poderia fornecer mais detalhes sobre o bug, como em qual página ocorreu e quais passos você seguiu?",
  sugestão: "Agradecemos sua sugestão! Vamos analisar e considerar para futuras atualizações da plataforma.",
  recurso:
    "Estamos sempre trabalhando para melhorar a DEMOS. Sua sugestão de recurso será encaminhada para nossa equipe de produto.",
  obrigado: "Disponha! Estamos aqui para ajudar. Há mais alguma coisa em que possamos auxiliar?",
  ajuda: "Claro! Em que posso ajudar? Por favor, descreva sua dúvida ou problema com mais detalhes.",
}

interface Message {
  id: string
  content: string
  sender_id: string
  created_at: string
  is_support: boolean
}

export default function SupportChat({ currentUserId }: SupportChatProps) {
  const router = useRouter()
  const [supabase] = useState(() => createClient())
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [newMessage, setNewMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchUser = async () => {
      // Buscar informações do usuário atual
      const { data: currentUserData } = await supabase.from("users").select("*").eq("id", currentUserId).single()
      if (currentUserData) {
        setCurrentUser(currentUserData)
      }
    }

    fetchUser()
    setLoading(false)

    // Adicionar mensagens iniciais do suporte com delay
    const initialMessages: Message[] = []

    SUPPORT_MESSAGES.forEach((msg, index) => {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: msg.id,
            content: msg.content,
            sender_id: "support",
            created_at: new Date().toISOString(),
            is_support: true,
          },
        ])
      }, msg.delay)
    })
  }, [currentUserId])

  useEffect(() => {
    // Rolar para o final quando novas mensagens chegarem
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newMessage.trim()) return

    setSending(true)

    try {
      // Adicionar mensagem do usuário
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        content: newMessage,
        sender_id: currentUserId,
        created_at: new Date().toISOString(),
        is_support: false,
      }

      setMessages((prev) => [...prev, userMessage])
      setNewMessage("")

      // Simular resposta do suporte
      setTimeout(() => {
        // Verificar se há palavras-chave na mensagem do usuário
        const lowerCaseMessage = newMessage.toLowerCase()
        let responseContent = "Obrigado por sua mensagem. Nossa equipe de suporte irá analisá-la e responder em breve."

        // Verificar palavras-chave
        for (const [keyword, response] of Object.entries(AUTO_RESPONSES)) {
          if (lowerCaseMessage.includes(keyword)) {
            responseContent = response
            break
          }
        }

        const supportResponse: Message = {
          id: `support-${Date.now()}`,
          content: responseContent,
          sender_id: "support",
          created_at: new Date().toISOString(),
          is_support: true,
        }

        setMessages((prev) => [...prev, supportResponse])
      }, 1000)
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
        ) : (
          <div className="space-y-4">
            {messages.map((message) => {
              const isSentByMe = !message.is_support
              const formattedDate = message.created_at
                ? formatDistanceToNow(new Date(message.created_at), { addSuffix: true, locale: ptBR })
                : ""

              return (
                <div key={message.id} className={`flex ${isSentByMe ? "justify-end" : "justify-start"}`}>
                  <div className={`flex gap-2 max-w-[80%] ${isSentByMe ? "flex-row-reverse" : ""}`}>
                    <Avatar className="h-8 w-8 mt-1">
                      <AvatarImage
                        src={isSentByMe ? currentUser?.avatar_url || "" : "/placeholder.svg?height=32&width=32"}
                        alt={isSentByMe ? currentUser?.name || "" : "Suporte DEMOS"}
                      />
                      <AvatarFallback>{isSentByMe ? currentUser?.name?.charAt(0) || "?" : "S"}</AvatarFallback>
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
