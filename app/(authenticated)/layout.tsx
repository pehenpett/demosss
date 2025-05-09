import type React from "react"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import Header from "@/components/header"

/**
 * Layout para todas as páginas que requerem autenticação
 * Verifica se o usuário está autenticado e redireciona para login se não estiver
 * Inclui o cabeçalho e o rodapé comuns a todas as páginas autenticadas
 * @param children Componentes filhos a serem renderizados dentro do layout
 */
export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Cria o cliente Supabase para o servidor
  const supabase = createClient()

  // Verifica se existe uma sessão ativa
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Se não houver sessão, redireciona para a página de login
  if (!session) {
    redirect("/login")
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Cabeçalho comum a todas as páginas autenticadas */}
      <Header />

      {/* Conteúdo principal da página */}
      <main className="flex-1 container mx-auto px-4 py-6">{children}</main>

      {/* Rodapé comum a todas as páginas autenticadas */}
      <footer className="border-t py-4">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} DEMOS. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
