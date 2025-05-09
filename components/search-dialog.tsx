"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandLoading,
} from "@/components/ui/command"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search } from "lucide-react"
import type { User } from "@/types"

export default function SearchDialog() {
  const router = useRouter()
  const [supabase] = useState(() => createClient())
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  useEffect(() => {
    const searchUsers = async () => {
      if (!query.trim()) {
        setUsers([])
        return
      }

      setLoading(true)
      try {
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .or(`name.ilike.%${query}%,email.ilike.%${query}%,company_name.ilike.%${query}%`)
          .limit(10)

        if (error) throw error
        setUsers(data || [])
      } catch (error) {
        console.error("Erro ao buscar usuários:", error)
      } finally {
        setLoading(false)
      }
    }

    const timer = setTimeout(() => {
      if (open && query) {
        searchUsers()
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query, open])

  const handleSelect = (userId: string) => {
    setOpen(false)
    router.push(`/profile/${userId}`)
  }

  const handleStartChat = (userId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setOpen(false)
    router.push(`/chat/${userId}`)
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="relative h-9 w-9 p-0 xl:h-10 xl:w-60 xl:justify-start xl:px-3 xl:py-2"
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4 xl:mr-2" aria-hidden="true" />
        <span className="hidden xl:inline-flex">Buscar usuários...</span>
        <span className="sr-only">Buscar usuários</span>
        <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium opacity-100 xl:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Buscar usuários..." value={query} onValueChange={setQuery} />
        <CommandList>
          {loading && <CommandLoading>Buscando usuários...</CommandLoading>}
          <CommandEmpty>Nenhum usuário encontrado.</CommandEmpty>
          <CommandGroup heading="Usuários">
            {users.map((user) => (
              <CommandItem key={user.id} onSelect={() => handleSelect(user.id)} className="flex items-center gap-2 p-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar_url || ""} alt={user.name} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col flex-1">
                  <span className="font-medium">{user.name}</span>
                  {user.company_name && <span className="text-xs text-muted-foreground">{user.company_name}</span>}
                </div>
                <Button size="sm" variant="outline" className="ml-auto" onClick={(e) => handleStartChat(user.id, e)}>
                  Conversar
                </Button>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
