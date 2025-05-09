import { createClient } from "@/utils/supabase/server"
import { notFound } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail, Settings, Edit } from "lucide-react"
import PostList from "@/components/user-post-list"
import Link from "next/link"
import FollowButton from "@/components/follow-button"
import FollowersList from "@/components/followers-list"

interface ProfilePageProps {
  params: {
    id: string
  }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const supabase = createClient()

  // Verificar se o ID é do usuário atual
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()

  if (!currentUser) {
    notFound()
  }

  const isCurrentUser = currentUser.id === params.id

  // Buscar dados do usuário
  const { data: userData, error } = await supabase.from("users").select("*").eq("id", params.id).single()

  if (error || !userData) {
    notFound()
  }

  // Contar seguidores
  const { count: followersCount } = await supabase
    .from("followers")
    .select("*", { count: "exact", head: true })
    .eq("following_id", params.id)

  // Contar seguindo
  const { count: followingCount } = await supabase
    .from("followers")
    .select("*", { count: "exact", head: true })
    .eq("follower_id", params.id)

  // Verificar se o usuário atual segue este perfil
  const { data: followData } = await supabase
    .from("followers")
    .select("*")
    .eq("follower_id", currentUser.id)
    .eq("following_id", params.id)
    .maybeSingle()

  const isFollowedByMe = !!followData

  // Adicionar contagens ao userData
  const userWithCounts = {
    ...userData,
    followers_count: followersCount || 0,
    following_count: followingCount || 0,
    is_followed_by_me: isFollowedByMe,
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center gap-4 pb-2">
          <Avatar className="h-20 w-20">
            <AvatarImage src={userData.avatar_url || ""} alt={userData.name} />
            <AvatarFallback className="text-2xl">{userData.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">{userData.name}</h1>
                {userData.company_name && <p className="text-muted-foreground">{userData.company_name}</p>}
              </div>
              <div className="flex gap-2">
                {isCurrentUser ? (
                  <>
                    <Link href="/settings">
                      <Button variant="outline" size="sm" className="gap-2">
                        <Settings className="h-4 w-4" />
                        Configurações
                      </Button>
                    </Link>
                    <Link href="/profile/edit">
                      <Button variant="outline" size="sm" className="gap-2">
                        <Edit className="h-4 w-4" />
                        Editar Perfil
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <FollowButton userId={params.id} initialIsFollowing={isFollowedByMe} />
                    <Button variant="outline" size="sm" className="gap-2">
                      <Mail className="h-4 w-4" />
                      Contatar
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex gap-6">
              <FollowersList userId={params.id} type="followers" count={userWithCounts.followers_count} />
              <FollowersList userId={params.id} type="following" count={userWithCounts.following_count} />
            </div>
            <p className="text-sm text-muted-foreground">
              Membro desde {new Date(userData.created_at).toLocaleDateString("pt-BR")}
            </p>
          </div>
        </CardContent>
      </Card>

      <h2 className="text-xl font-semibold mb-4">Postagens de {userData.name}</h2>
      <PostList userId={params.id} />
    </div>
  )
}
