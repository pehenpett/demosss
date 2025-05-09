import { createClient } from "@/utils/supabase/server"
import { notFound } from "next/navigation"
import PostDetail from "@/components/post-detail"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

interface PostPageProps {
  params: {
    id: string
  }
}

export default async function PostPage({ params }: PostPageProps) {
  const supabase = createClient()

  // Verificar se a postagem existe
  const { data: post, error } = await supabase
    .from("posts")
    .select(`
      *,
      user:users(*)
    `)
    .eq("id", params.id)
    .single()

  if (error || !post) {
    notFound()
  }

  // Obter o usuário atual
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/feed">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar para o feed
          </Button>
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-6">Postagem</h1>

      <PostDetail postId={params.id} currentUserId={user?.id || ""} />
    </div>
  )
}
