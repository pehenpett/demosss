import { createBrowserClient } from "@supabase/ssr"
import type { SupabaseClient } from "@supabase/supabase-js"

/**
 * Variável para armazenar a instância singleton do cliente Supabase
 * Isso evita a criação de múltiplas instâncias do cliente no navegador
 */
let supabaseClient: SupabaseClient | null = null

/**
 * Cria ou retorna um cliente Supabase para uso no lado do cliente
 * Implementa o padrão Singleton para evitar múltiplas instâncias
 * @returns Cliente Supabase configurado para o lado do cliente
 */
export function createClient() {
  // Se já existe uma instância, retorna ela
  if (supabaseClient) {
    return supabaseClient
  }

  // Caso contrário, cria uma nova instância
  supabaseClient = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  return supabaseClient
}
