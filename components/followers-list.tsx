"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import type { User } from "@/types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import FollowButton from "@/components/follow-button"

interface FollowersListProps {
  userId: string
  type: "followers" | "following"
  count: number
}

export default function FollowersList({ userId, type, count }: FollowersListProps) {
  const [supabase] = useState(() => createClient())
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (open) {
      const fetchUsers = async () => {
        setLoading(true)

        // Obter o usuário atual
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (user) {
          setCurrentUserId(user.id)
        }

        try {
          let query

          if (type === "followers") {
            // Buscar seguidores
            query = supabase
              .from("followers")
              .select(`
                follower_id,
                follower:users!follower_id(*)
              `)
              .eq("following_id", userId)
          } else {
            // Buscar seguindo
            query = supabase
              .from("followers")
              .select(`
                following_id,
                following:users!following_id(*)
              `)
              .eq("follower_id", userId)
          }

          const { data, error } = await query

          if (error) throw error

          if (data) {
            // Extrair usuários
            const usersList = data.map((item) => (type === "followers" ? item.follower : item.following))

            // Para cada usuário, verificar se o usuário atual o segue
            const usersWithFollowStatus = await Promise.all(
              usersList.map(async (user) => {
                if (currentUserId) {
                  const { data: followData } = await supabase
                    .from("followers")
                    .select("*")
                    .eq("follower_id", currentUserId)
                    .eq("following_id", user.id)
                    .maybeSingle()

                  return {
                    ...user,
                    is_followed_by_me: !!followData,
                  }
                }
                return {
                  ...user,
                  is_followed_by_me: false,
                }
              }),
            )

            setUsers(usersWithFollowStatus)
          }
        } catch (error) {
          console.error(`Erro ao buscar ${type}:`, error)
        } finally {
          setLoading(false)
        }
      }

      fetchUsers()
    }
  }, [userId, type, open, currentUserId])

  const title = type === "followers" ? "Seguidores" : "Seguindo"

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="p-0 h-auto">
          <span className="text-lg font-semibold">{count}</span>
          <span className="text-sm text-muted-foreground ml-1">{title}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {type === "followers" ? "Pessoas que seguem" : "Pessoas que são seguidas por"} este perfil
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-4 w-[150px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : users.length === 0 ? (
            <p className="text-center py-4 text-muted-foreground">
              {type === "followers" ? "Nenhum seguidor ainda" : "Não segue ninguém ainda"}
            </p>
          ) : (
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between">
                  <Link href={`/profile/${user.id}`} className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar_url || ""} alt={user.name} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      {user.company_name && <p className="text-sm text-muted-foreground">{user.company_name}</p>}
                    </div>
                  </Link>
                  {currentUserId && currentUserId !== user.id && (
                    <FollowButton userId={user.id} initialIsFollowing={user.is_followed_by_me || false} />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
