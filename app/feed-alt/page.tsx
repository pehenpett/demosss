import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import PostForm from "@/components/post-form"
import PostList from "@/components/post-list"
import Header from "@/components/header"

export default async function FeedAlt() {
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Feed (Alternativo)</h1>

          <div className="space-y-6">
            <PostForm userId={user?.id || ""} />
            <PostList />
          </div>
        </div>
      </main>
      <footer className="border-t py-4">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} DEMOS. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
