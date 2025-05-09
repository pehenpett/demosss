"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import type { User } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"

interface ProfileFormProps {
  user: User
}

export default function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter()
  const [supabase] = useState(() => createClient())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: user.name,
    company_name: user.company_name || "",
    avatar_url: user.avatar_url || "",
    bio: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const { error: updateError } = await supabase
        .from("users")
        .update({
          name: formData.name,
          company_name: formData.company_name,
          avatar_url: formData.avatar_url,
        })
        .eq("id", user.id)

      if (updateError) throw updateError

      setSuccess("Perfil atualizado com sucesso!")
      router.refresh()
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro ao atualizar o perfil.")
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    const file = e.target.files[0]
    const fileExt = file.name.split(".").pop()
    const filePath = `${user.id}-${Math.random()}.${fileExt}`

    setLoading(true)

    try {
      // Upload do arquivo
      const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file)

      if (uploadError) throw uploadError

      // Obter URL pública
      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath)

      if (data) {
        setFormData((prev) => ({ ...prev, avatar_url: data.publicUrl }))
      }
    } catch (err: any) {
      setError(err.message || "Erro ao fazer upload da imagem.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <CardContent>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <Avatar className="h-24 w-24">
            <AvatarImage src={formData.avatar_url || "/placeholder.svg"} alt={formData.name} />
            <AvatarFallback>{formData.name.charAt(0)}</AvatarFallback>
          </Avatar>

          <div className="flex items-center gap-2">
            <Input id="avatar" type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
            <Label
              htmlFor="avatar"
              className="cursor-pointer bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-md text-sm font-medium"
            >
              Alterar foto
            </Label>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Nome</Label>
          <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="company_name">Nome da Empresa</Label>
          <Input id="company_name" name="company_name" value={formData.company_name} onChange={handleChange} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Biografia</Label>
          <Textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            placeholder="Conte um pouco sobre você..."
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" value={user.email} disabled className="bg-muted" />
          <p className="text-xs text-muted-foreground">O email não pode ser alterado</p>
        </div>

        <Button type="submit" disabled={loading}>
          {loading ? "Salvando..." : "Salvar alterações"}
        </Button>
      </form>
    </CardContent>
  )
}
