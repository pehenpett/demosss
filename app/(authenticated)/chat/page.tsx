import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { MessageSquare, UserPlus } from "lucide-react"
import type { Conversation, User } from "@/types"

export default async function ChatPage() {
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  const currentUserId = session.user.id

  // Buscar todas as conversas do usuário atual
  const { data: conversations } = await supabase
    .from("conversations")
    .select(`
      *,
      last_message:messages(*)
    `)
    .or(`user1_id.eq.${currentUserId},user2_id.eq.${currentUserId}`)
    .order("last_message_time", { ascending: false })

  // Processar as conversas para obter informações do outro usuário
  const processedConversations: Conversation[] = []

  if (conversations && conversations.length > 0) {
    for (const conversation of conversations) {
      // Determinar qual é o outro usuário na conversa
      const otherUserId = conversation.user1_id === currentUserId ? conversation.user2_id : conversation.user1_id

      // Buscar informações do outro usuário
      const { data: otherUser } = await supabase.from("users").select("*").eq("id", otherUserId).single()

      if (otherUser) {
        processedConversations.push({
          ...conversation,
          other_user: otherUser,
        })
      }
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Mensagens</h1>
        <Link href="/search">
          <Button size="sm" className="gap-2">
            <UserPlus className="h-4 w-4" />
            Nova conversa
          </Button>
        </Link>
      </div>

      {processedConversations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhuma conversa ainda</h3>
            <p className="text-muted-foreground text-center mb-4">
              Comece uma conversa com outro usuário ou com o suporte.
            </p>
            <div className="flex gap-4">
              <Link href="/search">
                <Button>Buscar usuários</Button>
              </Link>
              <Link href="/chat/support">
                <Button variant="outline">Falar com suporte</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {processedConversations.map((conversation) => {
            const otherUser = conversation.other_user as User
            const lastMessage = conversation.last_message?.[0]
            const formattedDate = lastMessage?.created_at
              ? formatDistanceToNow(new Date(lastMessage.created_at), { addSuffix: true, locale: ptBR })
              : ""

            return (
              <Link key={conversation.id} href={`/chat/${otherUser.id}`}>
                <Card
                  className={`hover:bg-muted/50 transition-colors ${conversation.unread_count > 0 ? "border-primary" : ""}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={otherUser.avatar_url || ""} alt={otherUser.name} />
                        <AvatarFallback>{otherUser.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium truncate">{otherUser.name}</h3>
                          <span className="text-xs text-muted-foreground">{formattedDate}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-muted-foreground truncate">
                            {lastMessage?.content || "Nenhuma mensagem ainda"}
                          </p>
                          {conversation.unread_count > 0 && (
                            <span className="bg-primary text-primary-foreground text-xs rounded-full px-2 py-1 min-w-[1.5rem] text-center">
                              {conversation.unread_count}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}

          <div className="pt-4 border-t">
            <Link href="/chat/support">
              <Card className="hover:bg-muted/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src="/placeholder.svg?height=48&width=48" alt="Suporte" />
                      <AvatarFallback>S</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-medium">Suporte DEMOS</h3>
                      <p className="text-sm text-muted-foreground">Precisa de ajuda? Fale com nossa equipe</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
