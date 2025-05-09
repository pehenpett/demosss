import { createClient } from "@/utils/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = createClient()

  try {
    // Verificar se o usuário já existe
    const { data: existingUser } = await supabase.from("users").select("*").eq("email", "jonas@exemplo.com").single()

    if (existingUser) {
      return NextResponse.json({ message: "Usuário jonas já existe" })
    }

    // Criar o usuário no Auth com email já confirmado
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: "jonas@exemplo.com",
      password: "123456",
      email_confirm: true, // Isso garante que o email seja confirmado automaticamente
      user_metadata: {
        name: "Jonas",
        company_name: "Tech Solutions",
      },
    })

    if (authError) {
      throw authError
    }

    if (authData.user) {
      // Inserir na tabela users
      const { error: userError } = await supabase.from("users").insert({
        id: authData.user.id,
        email: "jonas@exemplo.com",
        name: "Jonas",
        company_name: "Tech Solutions",
        avatar_url: "https://i.pravatar.cc/150?u=jonas",
      })

      if (userError) {
        throw userError
      }

      return NextResponse.json({ message: "Usuário jonas criado com sucesso", user: authData.user })
    }

    return NextResponse.json({ message: "Erro ao criar usuário" }, { status: 500 })
  } catch (error: any) {
    console.error("Erro:", error)
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}
