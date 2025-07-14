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
  // Normalizar timestamps agregando 'Z' si no tienen timezone indicator
  const normalizeTimestamp = (timestamp: string): string => {
    if (!timestamp.endsWith('Z') && !timestamp.includes('+') && !timestamp.includes('-', 19)) {
      return timestamp + 'Z'
    }
    return timestamp
  }
  
  const start = new Date(normalizeTimestamp(startTime)).getTime()
  const end = new Date(normalizeTimestamp(endTime)).getTime()
  
  let totalMinutes = (end - start) / (1000 * 60)
  
  // Restar tiempo de almuerzo si existe
  if (lunchStart && lunchEnd) {
    const lunchStartTime = new Date(normalizeTimestamp(lunchStart)).getTime()
    const lunchEndTime = new Date(normalizeTimestamp(lunchEnd)).getTime()
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

// Función para obtener la fecha actual en zona horaria local (formato YYYY-MM-DD)
export function getTodayLocal(): string {
  return new Date().toLocaleDateString('en-CA') // en-CA da formato YYYY-MM-DD
}

// Función para convertir timestamp UTC a hora de Colombia y formatear
export function formatTimeInColombia(timestamp: string): string {
  try {
    // Si el timestamp no tiene timezone indicator, asumimos que es UTC
    let utcTimestamp = timestamp
    if (!timestamp.endsWith('Z') && !timestamp.includes('+') && !timestamp.includes('-', 19)) {
      utcTimestamp = timestamp + 'Z'
    }
    
    const utcDate = new Date(utcTimestamp)
    
    // Usar timeZone específico para Colombia (America/Bogota)
    return utcDate.toLocaleTimeString('es-CO', { 
      timeZone: 'America/Bogota',
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
  } catch (error) {
    console.error('Error formateando hora:', error)
    return '-- : --'
  }
}

// Función para obtener timestamp actual pero respetando zona horaria local para comparaciones
export function getNowLocal(): string {
  return new Date().toISOString()
} 