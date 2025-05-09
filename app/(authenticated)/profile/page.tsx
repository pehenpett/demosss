import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"

export default async function ProfileRedirect() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Redirecionar para a página de perfil com ID
  redirect(`/profile/${user.id}`)
}
