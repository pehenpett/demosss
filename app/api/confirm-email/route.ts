import { createClient } from "@/utils/supabase/server"
import { NextResponse } from "next/server"

/**
 * API Route para confirmar o email de um usuário
 * Usa a API de administração do Supabase para confirmar o email automaticamente
 * @param request Objeto de requisição com o ID do usuário
 * @returns Resposta JSON indicando sucesso ou erro
 */
export async function POST(request: Request) {
  try {
    // Extrai o ID do usuário do corpo da requisição
    const { userId } = await request.json()

    // Verifica se o ID do usuário foi fornecido
    if (!userId) {
      return NextResponse.json({ error: "ID do usuário não fornecido" }, { status: 400 })
    }

    // Cria o cliente Supabase para o servidor
    const supabase = createClient()

    // Confirma o email do usuário usando a API de administração
    const { error } = await supabase.auth.admin.updateUserById(userId, {
      email_confirm: true,
    })

    // Se houver erro, retorna uma resposta de erro
    if (error) {
      console.error("Erro ao confirmar email:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Retorna uma resposta de sucesso
    return NextResponse.json({ success: true })
  } catch (error: any) {
    // Em caso de erro, loga e retorna uma resposta de erro
    console.error("Erro:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
