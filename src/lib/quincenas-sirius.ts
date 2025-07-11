// 📅 Sistema de Quincenas Específicas SIRIUS Regenerative
// Fechas de nómina quincenal según calendario interno de SIRIUS

export interface QuincenaSirius {
  year: number
  mes: string
  quincena: 1 | 2 // Primera o segunda quincena del mes
  fechaInicio: Date
  fechaFin: Date
  diasLaborales: number
  id: string // Formato: "2025-01-Q2" (año-mes-quincena)
}

/**
 * Definición de quincenas SIRIUS 2025
 * Estas fechas son específicas de la empresa y NO siguen el patrón estándar 1-15, 16-30
 * 
 * ⚠️ IMPORTANTE: Solo funciona para 2025
 * En enero 2026 se deben agregar manualmente las fechas de 2026 usando agregarAnoSirius()
 */
const QUINCENAS_SIRIUS_2025: Omit<QuincenaSirius, 'diasLaborales'>[] = [
  // ENERO 2025
  { year: 2025, mes: 'Enero', quincena: 1, fechaInicio: new Date(2025, 0, 1), fechaFin: new Date(2025, 0, 7), id: '2025-01-Q1' },
  { year: 2025, mes: 'Enero', quincena: 2, fechaInicio: new Date(2025, 0, 8), fechaFin: new Date(2025, 0, 23), id: '2025-01-Q2' },
  
  // FEBRERO 2025
  { year: 2025, mes: 'Febrero', quincena: 1, fechaInicio: new Date(2025, 0, 24), fechaFin: new Date(2025, 1, 6), id: '2025-02-Q1' },
  { year: 2025, mes: 'Febrero', quincena: 2, fechaInicio: new Date(2025, 1, 7), fechaFin: new Date(2025, 1, 21), id: '2025-02-Q2' },
  
  // MARZO 2025
  { year: 2025, mes: 'Marzo', quincena: 1, fechaInicio: new Date(2025, 1, 22), fechaFin: new Date(2025, 2, 6), id: '2025-03-Q1' },
  { year: 2025, mes: 'Marzo', quincena: 2, fechaInicio: new Date(2025, 2, 7), fechaFin: new Date(2025, 2, 19), id: '2025-03-Q2' },
  
  // ABRIL 2025
  { year: 2025, mes: 'Abril', quincena: 1, fechaInicio: new Date(2025, 2, 20), fechaFin: new Date(2025, 3, 6), id: '2025-04-Q1' },
  { year: 2025, mes: 'Abril', quincena: 2, fechaInicio: new Date(2025, 3, 7), fechaFin: new Date(2025, 3, 23), id: '2025-04-Q2' },
  
  // MAYO 2025
  { year: 2025, mes: 'Mayo', quincena: 1, fechaInicio: new Date(2025, 3, 24), fechaFin: new Date(2025, 4, 6), id: '2025-05-Q1' },
  { year: 2025, mes: 'Mayo', quincena: 2, fechaInicio: new Date(2025, 4, 7), fechaFin: new Date(2025, 4, 23), id: '2025-05-Q2' },
  
  // JUNIO 2025
  { year: 2025, mes: 'Junio', quincena: 1, fechaInicio: new Date(2025, 4, 24), fechaFin: new Date(2025, 5, 8), id: '2025-06-Q1' },
  { year: 2025, mes: 'Junio', quincena: 2, fechaInicio: new Date(2025, 5, 9), fechaFin: new Date(2025, 5, 20), id: '2025-06-Q2' },
  
  // JULIO 2025
  { year: 2025, mes: 'Julio', quincena: 1, fechaInicio: new Date(2025, 5, 21), fechaFin: new Date(2025, 6, 7), id: '2025-07-Q1' },
  { year: 2025, mes: 'Julio', quincena: 2, fechaInicio: new Date(2025, 6, 8), fechaFin: new Date(2025, 6, 23), id: '2025-07-Q2' },
  
  // AGOSTO 2025
  { year: 2025, mes: 'Agosto', quincena: 1, fechaInicio: new Date(2025, 6, 24), fechaFin: new Date(2025, 7, 5), id: '2025-08-Q1' },
  { year: 2025, mes: 'Agosto', quincena: 2, fechaInicio: new Date(2025, 7, 6), fechaFin: new Date(2025, 7, 22), id: '2025-08-Q2' },
  
  // SEPTIEMBRE 2025
  { year: 2025, mes: 'Septiembre', quincena: 1, fechaInicio: new Date(2025, 7, 23), fechaFin: new Date(2025, 8, 8), id: '2025-09-Q1' },
  { year: 2025, mes: 'Septiembre', quincena: 2, fechaInicio: new Date(2025, 8, 9), fechaFin: new Date(2025, 8, 23), id: '2025-09-Q2' },
  
  // OCTUBRE 2025
  { year: 2025, mes: 'Octubre', quincena: 1, fechaInicio: new Date(2025, 8, 24), fechaFin: new Date(2025, 9, 6), id: '2025-10-Q1' },
  { year: 2025, mes: 'Octubre', quincena: 2, fechaInicio: new Date(2025, 9, 7), fechaFin: new Date(2025, 9, 23), id: '2025-10-Q2' },
  
  // NOVIEMBRE 2025
  { year: 2025, mes: 'Noviembre', quincena: 1, fechaInicio: new Date(2025, 9, 24), fechaFin: new Date(2025, 10, 6), id: '2025-11-Q1' },
  { year: 2025, mes: 'Noviembre', quincena: 2, fechaInicio: new Date(2025, 10, 7), fechaFin: new Date(2025, 10, 20), id: '2025-11-Q2' },
  
  // DICIEMBRE 2025
  { year: 2025, mes: 'Diciembre', quincena: 1, fechaInicio: new Date(2025, 10, 21), fechaFin: new Date(2025, 11, 8), id: '2025-12-Q1' },
  { year: 2025, mes: 'Diciembre', quincena: 2, fechaInicio: new Date(2025, 11, 9), fechaFin: new Date(2025, 11, 19), id: '2025-12-Q2' }
]

/**
 * Storage para años adicionales (será usado cuando agreguen 2026, 2027, etc.)
 */
const QUINCENAS_ADICIONALES: Record<number, QuincenaSirius[]> = {}

/**
 * Calcula días laborales en una quincena (excluyendo domingos y festivos)
 */
function calcularDiasLaborales(fechaInicio: Date, fechaFin: Date): number {
  let diasLaborales = 0
  const current = new Date(fechaInicio)
  
  while (current <= fechaFin) {
    const diaSemana = current.getDay()
    // Excluir domingos (0) - Los festivos se manejan por separado
    if (diaSemana !== 0) {
      diasLaborales++
    }
    current.setDate(current.getDate() + 1)
  }
  
  return diasLaborales
}

/**
 * Obtiene todas las quincenas SIRIUS con días laborales calculados
 */
export function getQuincenasSirius(year: number = 2025): QuincenaSirius[] {
  // Para 2025, usar las fechas predefinidas
  if (year === 2025) {
    return QUINCENAS_SIRIUS_2025.map(q => ({
      ...q,
      diasLaborales: calcularDiasLaborales(q.fechaInicio, q.fechaFin)
    }))
  }
  
  // Para otros años, verificar si se han agregado manualmente
  if (QUINCENAS_ADICIONALES[year]) {
    return QUINCENAS_ADICIONALES[year]
  }
  
  // Si no existe el año, mostrar advertencia y retornar vacío
  console.warn(`⚠️  Año ${year} no configurado. Solo 2025 está disponible. Use agregarAnoSirius() para agregar ${year}.`)
  return []
}

/**
 * Obtiene años disponibles en el sistema
 */
export function getAnosDisponibles(): number[] {
  const anos = [2025, ...Object.keys(QUINCENAS_ADICIONALES).map(Number)]
  return anos.sort()
}

/**
 * Obtiene la quincena actual basada en la fecha
 */
export function getQuincenaActual(fecha: Date = new Date()): QuincenaSirius | null {
  const todasQuincenas = getQuincenasSirius(fecha.getFullYear())
  
  return todasQuincenas.find(q => 
    fecha >= q.fechaInicio && fecha <= q.fechaFin
  ) || null
}

/**
 * Obtiene quincena por ID
 */
export function getQuincenaById(id: string): QuincenaSirius | null {
  const [year] = id.split('-')
  const todasQuincenas = getQuincenasSirius(parseInt(year))
  
  return todasQuincenas.find(q => q.id === id) || null
}

/**
 * Obtiene las últimas N quincenas
 */
export function getUltimasQuincenas(cantidad: number = 6, fechaReferencia: Date = new Date()): QuincenaSirius[] {
  const todasQuincenas = getQuincenasSirius(fechaReferencia.getFullYear())
  const quincenaActual = getQuincenaActual(fechaReferencia)
  
  if (!quincenaActual) return []
  
  const indexActual = todasQuincenas.findIndex(q => q.id === quincenaActual.id)
  const inicioIndex = Math.max(0, indexActual - cantidad + 1)
  
  return todasQuincenas.slice(inicioIndex, indexActual + 1)
}

/**
 * Verifica si una fecha está dentro de una quincena específica
 */
export function estaEnQuincena(fecha: Date, quincenaId: string): boolean {
  const quincena = getQuincenaById(quincenaId)
  if (!quincena) return false
  
  return fecha >= quincena.fechaInicio && fecha <= quincena.fechaFin
}

/**
 * Obtiene el rango de fechas de una quincena como strings
 */
export function getRangoQuincena(quincenaId: string): { inicio: string, fin: string } | null {
  const quincena = getQuincenaById(quincenaId)
  if (!quincena) return null
  
  return {
    inicio: quincena.fechaInicio.toISOString().split('T')[0],
    fin: quincena.fechaFin.toISOString().split('T')[0]
  }
}

/**
 * Formatea el nombre de una quincena para mostrar
 */
export function formatearNombreQuincena(quincena: QuincenaSirius): string {
  const inicioFormatted = quincena.fechaInicio.toLocaleDateString('es-CO', { 
    day: 'numeric', 
    month: 'short' 
  })
  const finFormatted = quincena.fechaFin.toLocaleDateString('es-CO', { 
    day: 'numeric', 
    month: 'short' 
  })
  
  return `${quincena.mes} Q${quincena.quincena} (${inicioFormatted} - ${finFormatted})`
}

/**
 * Obtiene estadísticas rápidas de una quincena
 */
export function getEstadisticasQuincena(quincena: QuincenaSirius) {
  const hoy = new Date()
  const diasTranscurridos = quincena.fechaInicio <= hoy ? 
    Math.min(
      Math.floor((hoy.getTime() - quincena.fechaInicio.getTime()) / (1000 * 60 * 60 * 24)) + 1,
      Math.floor((quincena.fechaFin.getTime() - quincena.fechaInicio.getTime()) / (1000 * 60 * 60 * 24)) + 1
    ) : 0
  
  const diasTotales = Math.floor((quincena.fechaFin.getTime() - quincena.fechaInicio.getTime()) / (1000 * 60 * 60 * 24)) + 1
  const porcentajeCompleto = Math.round((diasTranscurridos / diasTotales) * 100)
  
  return {
    diasTranscurridos,
    diasTotales,
    diasLaborales: quincena.diasLaborales,
    porcentajeCompleto,
    estaActiva: hoy >= quincena.fechaInicio && hoy <= quincena.fechaFin,
    yaTermino: hoy > quincena.fechaFin
  }
}

/**
 * 🔧 FUNCIÓN ADMINISTRATIVA: Agregar un nuevo año de quincenas
 * 
 * Esta función se usará en enero 2026 para agregar las fechas de 2026
 * cuando ustedes las definan según el calendario SIRIUS
 * 
 * Ejemplo de uso en enero 2026:
 * agregarAnoSirius(2026, [
 *   { mes: 'Enero', quincena: 1, fechaInicio: new Date(2026, 0, 1), fechaFin: new Date(2026, 0, 7) },
 *   { mes: 'Enero', quincena: 2, fechaInicio: new Date(2026, 0, 8), fechaFin: new Date(2026, 0, 23) },
 *   // ... resto de quincenas 2026
 * ])
 */
export function agregarAnoSirius(year: number, quincenas: Omit<QuincenaSirius, 'year' | 'diasLaborales' | 'id'>[]) {
  console.log(`🔧 Agregando quincenas para el año ${year}...`)
  
  const quincenasCompletas: QuincenaSirius[] = quincenas.map((q, index) => ({
    ...q,
    year,
    diasLaborales: calcularDiasLaborales(q.fechaInicio, q.fechaFin),
    id: `${year}-${String(Math.floor(index / 2) + 1).padStart(2, '0')}-Q${q.quincena}`
  }))
  
  QUINCENAS_ADICIONALES[year] = quincenasCompletas
  
  console.log(`✅ Año ${year} agregado exitosamente con ${quincenasCompletas.length} quincenas`)
  console.log(`📅 Años disponibles: ${getAnosDisponibles().join(', ')}`)
} 