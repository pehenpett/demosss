import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"

// Configura a fonte Inter com o subconjunto latino
const inter = Inter({ subsets: ["latin"] })

// Metadados da aplicação
export const metadata = {
  title: "DEMOS - Rede Social",
  description: "Conecte-se com outros profissionais e empresas",
    generator: 'v0.dev'
}

/**
 * Componente de layout raiz da aplicação
 * Envolve toda a aplicação com a fonte Inter, ThemeProvider e Toaster
 * @param children Componentes filhos a serem renderizados dentro do layout
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        {/* ThemeProvider gerencia o tema claro/escuro */}
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          {/* Toaster para exibir notificações toast */}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
