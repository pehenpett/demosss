import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default async function SettingsPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href={`/profile/${user.id}`}>
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar para o perfil
          </Button>
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-6">Configurações</h1>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Notificações</CardTitle>
            <CardDescription>Gerencie suas preferências de notificação</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="email-notifications" className="flex flex-col space-y-1">
                <span>Notificações por email</span>
                <span className="text-sm font-normal text-muted-foreground">
                  Receba notificações por email quando alguém interagir com suas postagens
                </span>
              </Label>
              <Switch id="email-notifications" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="follow-notifications" className="flex flex-col space-y-1">
                <span>Notificações de novos seguidores</span>
                <span className="text-sm font-normal text-muted-foreground">
                  Receba notificações quando alguém começar a seguir você
                </span>
              </Label>
              <Switch id="follow-notifications" defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Privacidade</CardTitle>
            <CardDescription>Gerencie suas configurações de privacidade</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="profile-visibility" className="flex flex-col space-y-1">
                <span>Perfil público</span>
                <span className="text-sm font-normal text-muted-foreground">
                  Permitir que qualquer pessoa veja seu perfil
                </span>
              </Label>
              <Switch id="profile-visibility" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="search-visibility" className="flex flex-col space-y-1">
                <span>Visível nas buscas</span>
                <span className="text-sm font-normal text-muted-foreground">
                  Permitir que seu perfil apareça nos resultados de busca
                </span>
              </Label>
              <Switch id="search-visibility" defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Conta</CardTitle>
            <CardDescription>Gerencie suas informações de conta</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col space-y-2">
              <Label>Email</Label>
              <div className="text-sm text-muted-foreground">{user.email}</div>
            </div>
            <div className="flex flex-col space-y-4">
              <Button variant="outline">Alterar senha</Button>
              <Button variant="destructive">Excluir conta</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
