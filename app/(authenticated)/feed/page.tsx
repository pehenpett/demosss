import { createClient } from "@/utils/supabase/server"
import PostForm from "@/components/post-form"
import PostList from "@/components/post-list"

/**
 * Página de feed da aplicação
 * Exibe o formulário para criar novas postagens e a lista de postagens existentes
 */
export default async function Feed() {
  // Cria o cliente Supabase para o servidor
  const supabase = createClient()

  // Obtém o usuário atual
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Feed</h1>

      <div className="space-y-6">
        {/* Formulário para criar novas postagens */}
        <PostForm userId={user?.id || ""} />

        {/* Lista de postagens existentes */}
        <PostList />
      </div>
    </div>
  )
}
