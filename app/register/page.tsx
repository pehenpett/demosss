"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

/**
 * Página de registro da aplicação
 * Permite que o usuário crie uma nova conta
 */
export default function Register() {
  // Hook de roteamento para navegação
  const router = useRouter()

  // Cria o cliente Supabase para o cliente
  const [supabase] = useState(() => createClient())

  // Estados para controlar o formulário e feedback
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Manipula o envio do formulário de registro
   * @param e Evento de envio do formulário
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Extrai os dados do formulário
    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const name = formData.get("name") as string
    const companyName = formData.get("company_name") as string

    try {
      // Registra o usuário com Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            company_name: companyName,
          },
        },
      })

      // Se houver erro, lança uma exceção
      if (authError) throw authError

      if (authData.user) {
        // Insere dados do usuário na tabela users
        const { error: userError } = await supabase.from("users").insert({
          id: authData.user.id,
          email,
          name,
          company_name: companyName,
        })

        // Se houver erro ao inserir usuário, lança uma exceção
        if (userError) {
          console.error("Erro ao inserir usuário:", userError)
          throw new Error("Erro ao criar usuário. Por favor, tente novamente.")
        }

        // Chama a API para confirmar o email automaticamente
        const response = await fetch("/api/confirm-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId: authData.user.id }),
        })

        // Loga erro se não conseguir confirmar o email
        if (!response.ok) {
          console.error("Erro ao confirmar email:", await response.text())
        }

        // Redireciona para o feed
        router.push("/feed")
      }
    } catch (err: any) {
      // Em caso de erro, exibe a mensagem
      setError(err.message || "Ocorreu um erro durante o cadastro.")
    } finally {
      // Finaliza o estado de carregamento
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Criar uma conta</CardTitle>
          <CardDescription>Preencha os campos abaixo para se cadastrar no DEMOS</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Exibe mensagem de erro se houver */}
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Formulário de registro */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company_name">Nome da Empresa</Label>
              <Input id="company_name" name="company_name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Cadastrando..." : "Cadastrar"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Já tem uma conta?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Entrar
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
