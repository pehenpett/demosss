import { createClient } from "@/utils/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = createClient()

  try {
    // Verificar se o usuário já existe na autenticação
    const { data: authUser } = await supabase.auth.admin.listUsers({
      filters: {
        email: "pedro.petrelli@exemplo.com",
      },
    })

    // Se o usuário já existe na autenticação, retornar mensagem
    if (authUser && authUser.users && authUser.users.length > 0) {
      return NextResponse.json({
        message: "Usuário Pedro Petrelli já existe na autenticação",
        user: authUser.users[0],
      })
    }

    // Criar o usuário no Auth com email já confirmado
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: "pedro.petrelli@exemplo.com",
      password: "123456",
      email_confirm: true,
      user_metadata: {
        name: "Pedro Petrelli",
        company_name: "Petrelli Enterprises",
      },
    })

    if (authError) {
      throw authError
    }

    if (authData.user) {
      // Verificar se o usuário já existe na tabela users
      const { data: existingUser } = await supabase.from("users").select("*").eq("id", authData.user.id).single()

      if (!existingUser) {
        // Inserir na tabela users apenas se não existir
        const { error: userError } = await supabase.from("users").insert({
          id: authData.user.id,
          email: "pedro.petrelli@exemplo.com",
          name: "Pedro Petrelli",
          company_name: "Petrelli Enterprises",
          avatar_url: "https://i.pravatar.cc/150?u=pedro.petrelli",
        })

        if (userError) {
          console.error("Erro ao inserir usuário na tabela users:", userError)
        }
      }

      return NextResponse.json({
        message: "Usuário Pedro Petrelli criado com sucesso na autenticação",
        user: authData.user,
        credentials: {
          email: "pedro.petrelli@exemplo.com",
          password: "123456",
        },
      })
    }

    return NextResponse.json({ message: "Erro ao criar usuário" }, { status: 500 })
  } catch (error: any) {
    console.error("Erro:", error)
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}
