import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utilidades adicionales para SIRIUS
export function formatTimeToHoursMinutes(timestamp: string): string {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('es-CO', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  })
}

export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString('es-CO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export function getTimeOfDayGreeting(): string {
  const hour = new Date().getHours()
  
  if (hour < 12) return 'Buenos días'
  if (hour < 18) return 'Buenas tardes'
  return 'Buenas noches'
}

export function calculateWorkHours(startTime: string, endTime: string, lunchStart?: string, lunchEnd?: string): number {
  const start = new Date(startTime).getTime()
  const end = new Date(endTime).getTime()
  
  let totalMinutes = (end - start) / (1000 * 60)
  
  // Restar tiempo de almuerzo si existe
  if (lunchStart && lunchEnd) {
    const lunchStartTime = new Date(lunchStart).getTime()
    const lunchEndTime = new Date(lunchEnd).getTime()
    const lunchMinutes = (lunchEndTime - lunchStartTime) / (1000 * 60)
    totalMinutes -= lunchMinutes
  }
  
  return Math.max(0, totalMinutes / 60) // Convertir a horas
}

export function isWorkingHours(): boolean {
  const now = new Date()
  const hour = now.getHours()
  const dayOfWeek = now.getDay() // 0 = Domingo, 6 = Sábado
  
  // Lunes a Viernes (1-5), 6 AM a 9 PM
  return dayOfWeek >= 1 && dayOfWeek <= 5 && hour >= 6 && hour <= 21
}

export function getRandomMessage(messages: string[]): string {
  return messages[Math.floor(Math.random() * messages.length)]
} 