import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import SupportChat from "@/components/support-chat"

export default async function SupportChatPage() {
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  const currentUserId = session.user.id

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
            <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Suporte DEMOS" />
            <AvatarFallback>S</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-lg font-bold">Suporte DEMOS</h1>
            <p className="text-sm text-muted-foreground">Atendimento ao cliente</p>
          </div>
        </div>
      </div>

      <SupportChat currentUserId={currentUserId} />
    </div>
  )
}
