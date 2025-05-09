import { createClient } from "@/utils/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const supabase = createClient()

  try {
    // Primeiro, vamos verificar se o usuário Pedro Petrelli existe
    const { data: userExists } = await supabase
      .from("users")
      .select("id")
      .eq("email", "pedro.petrelli@exemplo.com")
      .single()

    if (!userExists) {
      return NextResponse.json({ error: "Usuário Pedro Petrelli não encontrado" }, { status: 404 })
    }

    // Criar uma sessão para Pedro Petrelli usando Admin API
    const { data, error } = await supabase.auth.admin.createUser({
      email: "pedro.petrelli@exemplo.com",
      password: "123456",
      email_confirm: true,
      user_metadata: {
        name: "Pedro Petrelli",
        company_name: "Petrelli Enterprises",
      },
      app_metadata: {
        provider: "email",
      },
    })

    if (error && !error.message.includes("already exists")) {
      throw error
    }

    // Fazer login com as credenciais
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: "pedro.petrelli@exemplo.com",
      password: "123456",
    })

    if (signInError) {
      throw signInError
    }

    // Redirecionar para o feed
    return NextResponse.redirect(new URL("/feed", requestUrl.origin))
  } catch (error: any) {
    console.error("Erro ao fazer login como Pedro Petrelli:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
