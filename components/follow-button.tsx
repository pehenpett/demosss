"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/utils/supabase/client"
import { UserPlus, UserMinus } from "lucide-react"

interface FollowButtonProps {
  userId: string
  initialIsFollowing: boolean
}

export default function FollowButton({ userId, initialIsFollowing }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [isLoading, setIsLoading] = useState(false)
  const [supabase] = useState(() => createClient())

  const handleFollow = async () => {
    setIsLoading(true)

    try {
      if (isFollowing) {
        // Deixar de seguir
        const { error } = await supabase
          .from("followers")
          .delete()
          .match({ follower_id: (await supabase.auth.getUser()).data.user?.id, following_id: userId })

        if (error) throw error
        setIsFollowing(false)
      } else {
        // Seguir
        const { error } = await supabase.from("followers").insert({
          follower_id: (await supabase.auth.getUser()).data.user?.id,
          following_id: userId,
        })

        if (error) throw error
        setIsFollowing(true)
      }
    } catch (error) {
      console.error("Erro ao seguir/deixar de seguir:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant={isFollowing ? "default" : "outline"}
      size="sm"
      className="gap-2"
      onClick={handleFollow}
      disabled={isLoading}
    >
      {isFollowing ? (
        <>
          <UserMinus className="h-4 w-4" />
          Deixar de seguir
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4" />
          Seguir
        </>
      )}
    </Button>
  )
}
