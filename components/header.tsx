"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Home, User, LogOut, Settings, MessageSquare, Search } from "lucide-react"
import { useEffect, useState } from "react"
import type { User as UserType } from "@/types"
import SearchDialog from "@/components/search-dialog"

/**
 * Componente de cabeçalho da aplicação
 * Exibe a navegação principal e o menu do usuário
 */
export default function Header() {
  // Hook de roteamento para navegação
  const router = useRouter()

  // Cria o cliente Supabase para o cliente
  const [supabase] = useState(() => createClient())

  // Estados para armazenar dados do usuário e contagem de mensagens não lidas
  const [user, setUser] = useState<UserType | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    /**
     * Busca os dados do usuário atual
     */
    const fetchUser = async () => {
      // Obtém o usuário autenticado
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (authUser) {
        // Busca dados adicionais do usuário na tabela users
        const { data } = await supabase.from("users").select("*").eq("id", authUser.id).single()

        if (data) {
          setUser(data)
        }
      }
    }

    /**
     * Busca a contagem de mensagens não lidas
     */
    const fetchUnreadMessages = async () => {
      // Obtém o usuário autenticado
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (authUser) {
        // Busca contagem de mensagens não lidas
        const { data } = await supabase
          .from("conversations")
          .select("unread_count")
          .or(`user1_id.eq.${authUser.id},user2_id.eq.${authUser.id}`)

        if (data) {
          // Calcula o total de mensagens não lidas
          const total = data.reduce((sum, conv) => sum + (conv.unread_count || 0), 0)
          setUnreadCount(total)
        }
      }
    }

    // Executa as funções de busca
    fetchUser()
    fetchUnreadMessages()

    // Configura subscription para atualizações em tempo real
    const messagesSubscription = supabase
      .channel("messages-updates")
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, () => {
        fetchUnreadMessages()
      })
      .subscribe()

    // Limpa a subscription quando o componente é desmontado
    return () => {
      supabase.removeChannel(messagesSubscription)
    }
  }, [])

  /**
   * Manipula o logout do usuário
   */
  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <header className="border-b sticky top-0 bg-background z-10">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo/link para o feed */}
        <Link href="/feed" className="text-2xl font-bold">
          DEMOS
        </Link>

        {/* Navegação principal */}
        <nav className="flex items-center gap-4">
          {/* Diálogo de pesquisa */}
          <SearchDialog />

          {/* Link para o feed */}
          <Link href="/feed" className="text-muted-foreground hover:text-foreground transition-colors">
            <Home className="h-5 w-5" />
            <span className="sr-only">Início</span>
          </Link>

          {/* Link para a página de busca */}
          <Link href="/search" className="text-muted-foreground hover:text-foreground transition-colors">
            <Search className="h-5 w-5" />
            <span className="sr-only">Buscar</span>
          </Link>

          {/* Link para a página de mensagens com indicador de não lidas */}
          <Link href="/chat" className="text-muted-foreground hover:text-foreground transition-colors relative">
            <MessageSquare className="h-5 w-5" />
            <span className="sr-only">Mensagens</span>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>

          {/* Menu do usuário */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar_url || ""} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {/* Link para o perfil do usuário */}
                <DropdownMenuItem asChild>
                  <Link href={`/profile/${user?.id}`} className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Perfil</span>
                  </Link>
                </DropdownMenuItem>

                {/* Link para as mensagens */}
                <DropdownMenuItem asChild>
                  <Link href="/chat" className="cursor-pointer">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    <span>Mensagens</span>
                    {unreadCount > 0 && (
                      <span className="ml-auto bg-primary text-primary-foreground text-xs rounded-full px-1.5 py-0.5">
                        {unreadCount}
                      </span>
                    )}
                  </Link>
                </DropdownMenuItem>

                {/* Link para as configurações */}
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Configurações</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* Botão de logout */}
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </nav>
      </div>
    </header>
  )
}
