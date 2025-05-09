import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Função utilitária para combinar classes CSS condicionalmente
 * Usa clsx para processar condições e tailwind-merge para resolver conflitos de classes Tailwind
 * @param inputs Classes CSS a serem combinadas
 * @returns String de classes CSS combinadas
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formata um valor para exibição como moeda
 * @param value Valor a ser formatado
 * @returns String formatada como moeda brasileira
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

/**
 * Trunca um texto para um comprimento máximo
 * @param text Texto a ser truncado
 * @param maxLength Comprimento máximo
 * @returns Texto truncado com reticências se necessário
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + "..."
}

/**
 * Gera um ID único baseado em timestamp e número aleatório
 * @returns String contendo ID único
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Verifica se uma string é um email válido
 * @param email String a ser verificada
 * @returns Boolean indicando se é um email válido
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}
