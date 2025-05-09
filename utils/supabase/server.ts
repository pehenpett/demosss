import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

/**
 * Cria um cliente Supabase para uso no lado do servidor
 * Esta função é usada em componentes de servidor e rotas de API
 * @returns Cliente Supabase configurado para o lado do servidor
 */
export function createClient() {
  // Obtém o armazenamento de cookies do Next.js
  const cookieStore = cookies()

  // Cria e retorna um cliente Supabase para o servidor
  // Usa as variáveis de ambiente para URL e chave anônima
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      // Função para obter um cookie pelo nome
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      // Função para definir um cookie
      set(name: string, value: string, options: any) {
        cookieStore.set({ name, value, ...options })
      },
      // Função para remover um cookie
      remove(name: string, options: any) {
        cookieStore.set({ name, value: "", ...options })
      },
    },
  })
}
