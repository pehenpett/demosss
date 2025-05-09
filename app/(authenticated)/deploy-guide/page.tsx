import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default async function DeployGuidePage() {
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Guia de Implantação do DEMOS</h1>

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>1. Preparação</CardTitle>
            <CardDescription>Requisitos e configuração inicial</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Antes de começar, você precisará:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Uma conta na{" "}
                <Link href="https://vercel.com" className="text-primary hover:underline" target="_blank">
                  Vercel
                </Link>
              </li>
              <li>
                Uma conta no{" "}
                <Link href="https://supabase.com" className="text-primary hover:underline" target="_blank">
                  Supabase
                </Link>
              </li>
              <li>O código-fonte do projeto DEMOS (que você já tem)</li>
              <li>Git instalado em seu computador</li>
              <li>Uma conta no GitHub, GitLab ou Bitbucket</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Configuração do Supabase</CardTitle>
            <CardDescription>Preparando o banco de dados</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="list-decimal pl-6 space-y-4">
              <li>
                <p className="font-medium">Crie um novo projeto no Supabase:</p>
                <ul className="list-disc pl-6 mt-2">
                  <li>
                    Acesse{" "}
                    <Link href="https://app.supabase.com" className="text-primary hover:underline" target="_blank">
                      app.supabase.com
                    </Link>
                  </li>
                  <li>Clique em "New Project"</li>
                  <li>Dê um nome ao seu projeto (ex: "demos-social")</li>
                  <li>Escolha uma senha segura para o banco de dados</li>
                  <li>Selecione a região mais próxima de seus usuários</li>
                  <li>Clique em "Create new project"</li>
                </ul>
              </li>
              <li>
                <p className="font-medium">Configure o banco de dados:</p>
                <ul className="list-disc pl-6 mt-2">
                  <li>Vá para a seção "SQL Editor" no Supabase</li>
                  <li>
                    Execute os scripts SQL para criar as tabelas necessárias (users, posts, comments, likes, followers,
                    messages, conversations)
                  </li>
                  <li>Configure as políticas de segurança (RLS) para proteger seus dados</li>
                </ul>
              </li>
              <li>
                <p className="font-medium">Configure a autenticação:</p>
                <ul className="list-disc pl-6 mt-2">
                  <li>Vá para "Authentication" → "Settings"</li>
                  <li>Em "Site URL", coloque a URL do seu site na Vercel (você pode atualizar isso depois)</li>
                  <li>
                    Em "Redirect URLs", adicione as URLs de redirecionamento (ex:
                    https://seu-site.vercel.app/auth/callback)
                  </li>
                </ul>
              </li>
              <li>
                <p className="font-medium">Obtenha as credenciais do projeto:</p>
                <ul className="list-disc pl-6 mt-2">
                  <li>Vá para "Settings" → "API"</li>
                  <li>Anote a "Project URL" e a "anon key" (você precisará delas para configurar a Vercel)</li>
                </ul>
              </li>
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. Preparação do Código</CardTitle>
            <CardDescription>Organizando o repositório</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="list-decimal pl-6 space-y-4">
              <li>
                <p className="font-medium">Crie um repositório Git:</p>
                <ul className="list-disc pl-6 mt-2">
                  <li>Crie um novo repositório no GitHub, GitLab ou Bitbucket</li>
                  <li>
                    Inicialize o Git no diretório do seu projeto:{" "}
                    <code className="bg-muted px-1 py-0.5 rounded">git init</code>
                  </li>
                  <li>
                    Adicione os arquivos: <code className="bg-muted px-1 py-0.5 rounded">git add .</code>
                  </li>
                  <li>
                    Faça o commit: <code className="bg-muted px-1 py-0.5 rounded">git commit -m "Versão inicial"</code>
                  </li>
                  <li>
                    Adicione o repositório remoto:{" "}
                    <code className="bg-muted px-1 py-0.5 rounded">git remote add origin URL_DO_SEU_REPOSITORIO</code>
                  </li>
                  <li>
                    Envie o código: <code className="bg-muted px-1 py-0.5 rounded">git push -u origin main</code>
                  </li>
                </ul>
              </li>
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>4. Implantação na Vercel</CardTitle>
            <CardDescription>Colocando o projeto online</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="list-decimal pl-6 space-y-4">
              <li>
                <p className="font-medium">Importe o projeto na Vercel:</p>
                <ul className="list-disc pl-6 mt-2">
                  <li>
                    Acesse{" "}
                    <Link href="https://vercel.com" className="text-primary hover:underline" target="_blank">
                      vercel.com
                    </Link>{" "}
                    e faça login
                  </li>
                  <li>Clique em "Add New" → "Project"</li>
                  <li>Importe o repositório que você acabou de criar</li>
                </ul>
              </li>
              <li>
                <p className="font-medium">Configure as variáveis de ambiente:</p>
                <ul className="list-disc pl-6 mt-2">
                  <li>Na tela de configuração do projeto, vá para a seção "Environment Variables"</li>
                  <li>
                    Adicione as seguintes variáveis:
                    <ul className="list-disc pl-6 mt-1">
                      <li>
                        <code className="bg-muted px-1 py-0.5 rounded">NEXT_PUBLIC_SUPABASE_URL</code> = URL do seu
                        projeto Supabase
                      </li>
                      <li>
                        <code className="bg-muted px-1 py-0.5 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> = Chave
                        anônima do Supabase
                      </li>
                      <li>
                        <code className="bg-muted px-1 py-0.5 rounded">SUPABASE_SERVICE_ROLE_KEY</code> = Chave de
                        serviço do Supabase (para funções administrativas)
                      </li>
                    </ul>
                  </li>
                </ul>
              </li>
              <li>
                <p className="font-medium">Implante o projeto:</p>
                <ul className="list-disc pl-6 mt-2">
                  <li>Clique em "Deploy"</li>
                  <li>Aguarde a conclusão da implantação</li>
                </ul>
              </li>
              <li>
                <p className="font-medium">Atualize as configurações do Supabase:</p>
                <ul className="list-disc pl-6 mt-2">
                  <li>
                    Volte ao Supabase e atualize a "Site URL" e as "Redirect URLs" com a URL do seu site na Vercel
                  </li>
                </ul>
              </li>
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>5. Verificação e Testes</CardTitle>
            <CardDescription>Garantindo que tudo funcione corretamente</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="list-decimal pl-6 space-y-4">
              <li>
                <p className="font-medium">Teste o site implantado:</p>
                <ul className="list-disc pl-6 mt-2">
                  <li>Acesse a URL fornecida pela Vercel</li>
                  <li>Teste o registro de usuários</li>
                  <li>Teste o login</li>
                  <li>Teste a criação de postagens</li>
                  <li>Teste as funcionalidades de chat</li>
                </ul>
              </li>
              <li>
                <p className="font-medium">Solução de problemas comuns:</p>
                <ul className="list-disc pl-6 mt-2">
                  <li>Verifique os logs de implantação na Vercel se houver problemas</li>
                  <li>Verifique as políticas de segurança (RLS) no Supabase</li>
                  <li>Certifique-se de que todas as variáveis de ambiente estão configuradas corretamente</li>
                </ul>
              </li>
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>6. Domínio Personalizado (Opcional)</CardTitle>
            <CardDescription>Configurando um domínio próprio</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="list-decimal pl-6 space-y-4">
              <li>
                <p className="font-medium">Adicione um domínio personalizado:</p>
                <ul className="list-disc pl-6 mt-2">
                  <li>Na Vercel, vá para "Settings" → "Domains"</li>
                  <li>Adicione seu domínio personalizado</li>
                  <li>Siga as instruções para configurar os registros DNS</li>
                </ul>
              </li>
              <li>
                <p className="font-medium">Atualize as configurações do Supabase:</p>
                <ul className="list-disc pl-6 mt-2">
                  <li>Atualize a "Site URL" e as "Redirect URLs" no Supabase com seu novo domínio</li>
                </ul>
              </li>
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>7. Manutenção e Atualizações</CardTitle>
            <CardDescription>Mantendo seu projeto atualizado</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="list-decimal pl-6 space-y-4">
              <li>
                <p className="font-medium">Atualizações de código:</p>
                <ul className="list-disc pl-6 mt-2">
                  <li>Faça alterações no código localmente</li>
                  <li>Teste as alterações</li>
                  <li>Faça commit e push para o repositório</li>
                  <li>A Vercel implantará automaticamente as atualizações</li>
                </ul>
              </li>
              <li>
                <p className="font-medium">Monitoramento:</p>
                <ul className="list-disc pl-6 mt-2">
                  <li>Use o painel da Vercel para monitorar o desempenho e os erros</li>
                  <li>Use o painel do Supabase para monitorar o banco de dados</li>
                </ul>
              </li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
