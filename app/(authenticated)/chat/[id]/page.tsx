import { createClient } from "@/utils/supabase/server"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import ChatMessages from "@/components/chat-messages"

interface ChatPageProps {
  params: {
    id: string
  }
}

export default async function ChatDetailPage({ params }: ChatPageProps) {
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  const currentUserId = session.user.id
  const otherUserId = params.id

  // Verificar se o usuário existe
  const { data: otherUser, error } = await supabase.from("users").select("*").eq("id", otherUserId).single()

  if (error || !otherUser) {
    notFound()
  }

  // Marcar mensagens como lidas
  if (otherUserId !== "support") {
    await supabase
      .from("messages")
      .update({ is_read: true })
      .eq("sender_id", otherUserId)
      .eq("receiver_id", currentUserId)
      .eq("is_read", false)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/chat">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={otherUser.avatar_url || ""} alt={otherUser.name} />
            <AvatarFallback>{otherUser.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-lg font-bold">{otherUser.name}</h1>
            {otherUser.company_name && <p className="text-sm text-muted-foreground">{otherUser.company_name}</p>}
          </div>
        </div>
      </div>

      <ChatMessages otherUserId={otherUserId} currentUserId={currentUserId} />
    </div>
  )
}
