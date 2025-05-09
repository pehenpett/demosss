import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const cookieStore = cookies()
  const supabase = createClient()

  try {
    // Primeiro, vamos verificar se o usuário Pedro Petrelli existe na tabela users
    const { data: userExists } = await supabase
      .from("users")
      .select("id")
      .eq("email", "pedro.petrelli@exemplo.com")
      .single()

    if (!userExists) {
      return NextResponse.json({ error: "Usuário Pedro Petrelli não encontrado na tabela users" }, { status: 404 })
    }

    // Criar uma sessão direta para o usuário Pedro Petrelli
    // Isso é uma abordagem alternativa que não depende de email/senha
    const session = {
      user: {
        id: userExists.id,
        email: "pedro.petrelli@exemplo.com",
        user_metadata: {
          name: "Pedro Petrelli",
          company_name: "Petrelli Enterprises",
        },
      },
      expires_at: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24 horas
    }

    // Definir um cookie de sessão personalizado
    cookieStore.set("supabase-auth-session", JSON.stringify(session), {
      path: "/",
      maxAge: 60 * 60 * 24, // 24 horas
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    })

    // Redirecionar para o feed
    return NextResponse.redirect(new URL("/feed", request.url))
  } catch (error: any) {
    console.error("Erro ao fazer login como Pedro Petrelli:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
