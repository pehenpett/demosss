import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare } from "lucide-react"

interface SearchPageProps {
  searchParams: { q?: string }
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  const query = searchParams.q || ""

  let users = []

  if (query) {
    const { data } = await supabase
      .from("users")
      .select("*")
      .or(`name.ilike.%${query}%,email.ilike.%${query}%,company_name.ilike.%${query}%`)
      .limit(20)

    users = data || []
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Pesquisar Usuários</h1>

      <form className="mb-8">
        <div className="flex gap-2">
          <Input
            type="search"
            name="q"
            placeholder="Buscar por nome, email ou empresa..."
            defaultValue={query}
            className="flex-1"
          />
          <Button type="submit">Buscar</Button>
        </div>
      </form>

      {query && (
        <h2 className="text-lg font-medium mb-4">
          {users.length === 0
            ? "Nenhum resultado encontrado"
            : `${users.length} resultado${users.length !== 1 ? "s" : ""} para "${query}"`}
        </h2>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {users.map((user) => (
          <Card key={user.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">
                <div className="flex items-center justify-between">
                  <Link href={`/profile/${user.id}`} className="hover:underline flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar_url || ""} alt={user.name} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span>{user.name}</span>
                  </Link>
                  <Link href={`/chat/${user.id}`}>
                    <Button size="sm" variant="outline">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Conversar
                    </Button>
                  </Link>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {user.company_name && <p className="text-sm text-muted-foreground mb-1">Empresa: {user.company_name}</p>}
              <p className="text-sm text-muted-foreground">
                Membro desde {new Date(user.created_at).toLocaleDateString("pt-BR")}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {!query && (
        <div className="text-center py-10 text-muted-foreground">Digite um termo de busca para encontrar usuários</div>
      )}
    </div>
  )
}
