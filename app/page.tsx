import Link from "next/link"
import { Button } from "@/components/ui/button"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"

/**
 * Página inicial da aplicação
 * Verifica se o usuário está autenticado e redireciona para o feed se estiver
 * Caso contrário, exibe a landing page com opção de login ou cadastro
 */
export default async function Home() {
  // Cria o cliente Supabase para o servidor
  const supabase = createClient()

  // Verifica se existe uma sessão ativa
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Se houver sessão, redireciona para o feed
  if (session) {
    redirect("/feed")
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Cabeçalho da landing page */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">DEMOS</h1>
          <div className="flex gap-4">
            <Link href="/login">
              <Button variant="outline">Entrar</Button>
            </Link>
            <Link href="/register">
              <Button>Cadastrar</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Conteúdo principal da landing page */}
      <main className="flex-1">
        {/* Seção hero com chamada para ação */}
        <section className="py-20 bg-gradient-to-b from-background to-muted">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl md:text-6xl font-bold mb-6">Bem-vindo ao DEMOS</h2>
            <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto">
              Conecte-se com outros profissionais e empresas, compartilhe ideias e expanda sua rede.
            </p>
            <div className="flex justify-center">
              <Link href="/register">
                <Button size="lg" className="text-lg px-8">
                  Comece agora
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Seção de recursos/benefícios */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h3 className="text-3xl font-bold mb-10 text-center">Por que escolher o DEMOS?</h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-card p-6 rounded-lg shadow">
                <h4 className="text-xl font-semibold mb-3">Conecte-se</h4>
                <p className="text-muted-foreground">
                  Encontre e conecte-se com profissionais e empresas do seu setor.
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg shadow">
                <h4 className="text-xl font-semibold mb-3">Compartilhe</h4>
                <p className="text-muted-foreground">Compartilhe suas ideias, projetos e conquistas com sua rede.</p>
              </div>
              <div className="bg-card p-6 rounded-lg shadow">
                <h4 className="text-xl font-semibold mb-3">Cresça</h4>
                <p className="text-muted-foreground">Expanda seus horizontes e descubra novas oportunidades.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Rodapé da landing page */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} DEMOS. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
