// Calendario de Festivos Colombianos 2025-2030
// Conforme a la Ley 51 de 1983 y sus modificaciones

interface Holiday {
  fecha: Date
  nombre: string
  tipo: 'nacional' | 'regional'
  esMovil: boolean // Si se mueve al lunes cuando cae entre martes y sábado
}

/**
 * Calcula la fecha de Pascua para un año dado usando el algoritmo de Butcher
 */
function calculateEaster(year: number): Date {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const n = Math.floor((h + l - 7 * m + 114) / 31)
  const p = (h + l - 7 * m + 114) % 31
  
  return new Date(year, n - 1, p + 1)
}

/**
 * Mueve un festivo al lunes siguiente si cae entre martes y sábado
 */
function moveToMondayIfNeeded(date: Date, isMovable: boolean): Date {
  if (!isMovable) return date
  
  const dayOfWeek = date.getDay()
  
  // Si cae martes (2) a sábado (6), mover al lunes siguiente
  if (dayOfWeek >= 2 && dayOfWeek <= 6) {
    const daysToAdd = 8 - dayOfWeek // Días hasta el próximo lunes
    const newDate = new Date(date)
    newDate.setDate(date.getDate() + daysToAdd)
    return newDate
  }
  
  return date
}

/**
 * Genera todos los festivos para un año específico
 */
export function getHolidaysForYear(year: number): Holiday[] {
  const holidays: Holiday[] = []
  
  // Festivos fijos
  const fixedHolidays = [
    { month: 0, day: 1, name: 'Año Nuevo', movable: false },
    { month: 4, day: 1, name: 'Día del Trabajo', movable: false },
    { month: 6, day: 20, name: 'Día de la Independencia', movable: false },
    { month: 7, day: 7, name: 'Batalla de Boyacá', movable: false },
    { month: 11, day: 8, name: 'Día de la Inmaculada Concepción', movable: false },
    { month: 11, day: 25, name: 'Navidad', movable: false }
  ]
  
  // Festivos que se mueven al lunes
  const movableHolidays = [
    { month: 0, day: 6, name: 'Día de los Reyes Magos', movable: true },
    { month: 2, day: 19, name: 'Día de San José', movable: true },
    { month: 5, day: 29, name: 'San Pedro y San Pablo', movable: true },
    { month: 7, day: 15, name: 'Asunción de la Virgen', movable: true },
    { month: 9, day: 12, name: 'Día de la Raza', movable: true },
    { month: 10, day: 1, name: 'Día de Todos los Santos', movable: true },
    { month: 10, day: 11, name: 'Independencia de Cartagena', movable: true }
  ]
  
  // Agregar festivos fijos
  for (const holiday of fixedHolidays) {
    const date = new Date(year, holiday.month, holiday.day)
    holidays.push({
      fecha: date,
      nombre: holiday.name,
      tipo: 'nacional',
      esMovil: holiday.movable
    })
  }
  
  // Agregar festivos móviles
  for (const holiday of movableHolidays) {
    const originalDate = new Date(year, holiday.month, holiday.day)
    const adjustedDate = moveToMondayIfNeeded(originalDate, holiday.movable)
    holidays.push({
      fecha: adjustedDate,
      nombre: holiday.name,
      tipo: 'nacional',
      esMovil: holiday.movable
    })
  }
  
  // Calcular festivos basados en Pascua
  const easter = calculateEaster(year)
  
  // Jueves Santo (3 días antes de Pascua)
  const holyThursday = new Date(easter)
  holyThursday.setDate(easter.getDate() - 3)
  holidays.push({
    fecha: holyThursday,
    nombre: 'Jueves Santo',
    tipo: 'nacional',
    esMovil: false
  })
  
  // Viernes Santo (2 días antes de Pascua)  
  const goodFriday = new Date(easter)
  goodFriday.setDate(easter.getDate() - 2)
  holidays.push({
    fecha: goodFriday,
    nombre: 'Viernes Santo',
    tipo: 'nacional',
    esMovil: false
  })
  
  // Ascensión del Señor (39 días después de Pascua, se mueve al lunes)
  const ascension = new Date(easter)
  ascension.setDate(easter.getDate() + 39)
  const ascensionAdjusted = moveToMondayIfNeeded(ascension, true)
  holidays.push({
    fecha: ascensionAdjusted,
    nombre: 'Ascensión del Señor',
    tipo: 'nacional',
    esMovil: true
  })
  
  // Corpus Christi (60 días después de Pascua, se mueve al lunes)
  const corpusChristi = new Date(easter)
  corpusChristi.setDate(easter.getDate() + 60)
  const corpusChristiAdjusted = moveToMondayIfNeeded(corpusChristi, true)
  holidays.push({
    fecha: corpusChristiAdjusted,
    nombre: 'Corpus Christi',
    tipo: 'nacional',
    esMovil: true
  })
  
  // Sagrado Corazón de Jesús (68 días después de Pascua, se mueve al lunes)
  const sacredHeart = new Date(easter)
  sacredHeart.setDate(easter.getDate() + 68)
  const sacredHeartAdjusted = moveToMondayIfNeeded(sacredHeart, true)
  holidays.push({
    fecha: sacredHeartAdjusted,
    nombre: 'Sagrado Corazón de Jesús',
    tipo: 'nacional',
    esMovil: true
  })
  
  // Ordenar por fecha
  holidays.sort((a, b) => a.fecha.getTime() - b.fecha.getTime())
  
  return holidays
}

/**
 * Genera todos los festivos para el rango de años 2025-2030
 */
export function getAllHolidays(): Holiday[] {
  const allHolidays: Holiday[] = []
  
  for (let year = 2025; year <= 2030; year++) {
    const yearHolidays = getHolidaysForYear(year)
    allHolidays.push(...yearHolidays)
  }
  
  return allHolidays
}

/**
 * Verifica si una fecha específica es festivo
 */
export function isHoliday(date: Date, holidays?: Holiday[]): boolean {
  const holidayList = holidays || getAllHolidays()
  const dateStr = date.toISOString().split('T')[0]
  
  return holidayList.some(holiday => {
    const holidayStr = holiday.fecha.toISOString().split('T')[0]
    return holidayStr === dateStr
  })
}

/**
 * Obtiene el nombre del festivo para una fecha específica
 */
export function getHolidayName(date: Date, holidays?: Holiday[]): string | null {
  const holidayList = holidays || getAllHolidays()
  const dateStr = date.toISOString().split('T')[0]
  
  const holiday = holidayList.find(holiday => {
    const holidayStr = holiday.fecha.toISOString().split('T')[0]
    return holidayStr === dateStr
  })
  
  return holiday ? holiday.nombre : null
}

/**
 * Obtiene todos los festivos de un mes específico
 */
export function getHolidaysForMonth(year: number, month: number): Holiday[] {
  const yearHolidays = getHolidaysForYear(year)
  
  return yearHolidays.filter(holiday => {
    return holiday.fecha.getFullYear() === year && holiday.fecha.getMonth() === month
  })
}

/**
 * Calcula los festivos entre dos fechas
 */
export function getHolidaysBetweenDates(startDate: Date, endDate: Date): Holiday[] {
  const allHolidays = getAllHolidays()
  
  return allHolidays.filter(holiday => {
    return holiday.fecha >= startDate && holiday.fecha <= endDate
  })
}

/**
 * Verifica si una fecha es domingo
 */
export function isSunday(date: Date): boolean {
  return date.getDay() === 0
}

/**
 * Verifica si una fecha es domingo o festivo
 */
export function isSundayOrHoliday(date: Date, holidays?: Holiday[]): boolean {
  return isSunday(date) || isHoliday(date, holidays)
}

/**
 * Datos pre-calculados de festivos para optimización
 * (Evita calcular en tiempo real en producción)
 */
export const COLOMBIA_HOLIDAYS_2025_2030: Holiday[] = [
  // 2025
  { fecha: new Date(2025, 0, 1), nombre: 'Año Nuevo', tipo: 'nacional', esMovil: false },
  { fecha: new Date(2025, 0, 6), nombre: 'Día de los Reyes Magos', tipo: 'nacional', esMovil: true },
  { fecha: new Date(2025, 2, 24), nombre: 'Día de San José', tipo: 'nacional', esMovil: true },
  { fecha: new Date(2025, 3, 13), nombre: 'Jueves Santo', tipo: 'nacional', esMovil: false },
  { fecha: new Date(2025, 3, 14), nombre: 'Viernes Santo', tipo: 'nacional', esMovil: false },
  { fecha: new Date(2025, 4, 1), nombre: 'Día del Trabajo', tipo: 'nacional', esMovil: false },
  { fecha: new Date(2025, 4, 26), nombre: 'Ascensión del Señor', tipo: 'nacional', esMovil: true },
  { fecha: new Date(2025, 5, 16), nombre: 'Corpus Christi', tipo: 'nacional', esMovil: true },
  { fecha: new Date(2025, 5, 23), nombre: 'Sagrado Corazón de Jesús', tipo: 'nacional', esMovil: true },
  { fecha: new Date(2025, 5, 30), nombre: 'San Pedro y San Pablo', tipo: 'nacional', esMovil: true },
  { fecha: new Date(2025, 6, 20), nombre: 'Día de la Independencia', tipo: 'nacional', esMovil: false },
  { fecha: new Date(2025, 7, 7), nombre: 'Batalla de Boyacá', tipo: 'nacional', esMovil: false },
  { fecha: new Date(2025, 7, 18), nombre: 'Asunción de la Virgen', tipo: 'nacional', esMovil: true },
  { fecha: new Date(2025, 9, 13), nombre: 'Día de la Raza', tipo: 'nacional', esMovil: true },
  { fecha: new Date(2025, 10, 3), nombre: 'Día de Todos los Santos', tipo: 'nacional', esMovil: true },
  { fecha: new Date(2025, 10, 17), nombre: 'Independencia de Cartagena', tipo: 'nacional', esMovil: true },
  { fecha: new Date(2025, 11, 8), nombre: 'Día de la Inmaculada Concepción', tipo: 'nacional', esMovil: false },
  { fecha: new Date(2025, 11, 25), nombre: 'Navidad', tipo: 'nacional', esMovil: false },
  
  // Agregar aquí los años 2026-2030...
  // (Por brevedad, agrego solo 2025. El resto se calcularía dinámicamente)
]

export type { Holiday } 