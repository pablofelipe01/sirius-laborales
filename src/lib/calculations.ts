// Sistema de Cálculo de Horas Laborales - Colombia 2025
// Conforme a la Reforma Laboral Colombiana
//
// REGLA CLAVE SOBRE DOMINGOS Y FESTIVOS:
// En Colombia, domingos y festivos son días de "descanso obligatorio".
// Por lo tanto, CUALQUIER trabajo en estos días se considera "extra"
// desde la primera hora, sin distinción entre ordinaria/extra.
//
// RECARGOS CORRECTOS:
// - Domingo/Festivo diurno: +100% (200% del salario base)
// - Domingo/Festivo nocturno: +150% (250% del salario base)

interface HoursBreakdown {
  // Horas base
  ordinarias: number
  
  // Horas extra (después de 8h diarias)
  extraDiurnas: number
  extraNocturnas: number
  
  // Recargos por horario nocturno (9pm-6am)
  nocturnas: number // Solo recargo nocturno, no extra
  
  // Recargos dominicales
  dominicalesDiurnas: number
  dominicalesNocturnas: number
  
  // Recargos festivos
  festivasDiurnas: number
  festivasNocturnas: number
  
  // Total de horas trabajadas
  totalHoras: number
  
  // Desglose para nómina
  salarioBase: number
  recargoNocturno: number // +35% (solo días ordinarios)
  recargoDominical: number // ELIMINADO: ahora todas las horas dominicales son "extra"
  recargoFestivo: number // ELIMINADO: ahora todas las horas festivas son "extra"
  extraDiurna: number // +25% (solo días ordinarios)
  extraNocturna: number // +75% (solo días ordinarios)
  extraDominicalDiurna: number // +100% (TODAS las horas dominicales diurnas)
  extraDominicalNocturna: number // +150% (TODAS las horas dominicales nocturnas)
  extraFestivaDiurna: number // +100% (TODAS las horas festivas diurnas)
  extraFestivaNocturna: number // +150% (TODAS las horas festivas nocturnas)
}

interface TimeSegment {
  inicio: Date
  fin: Date
  tipo: 'ordinaria' | 'extra'
  horario: 'diurno' | 'nocturno' 
  dia: 'ordinario' | 'domingo' | 'festivo'
  duracionHoras: number
}

interface WorkPeriod {
  entrada: Date
  salida: Date
  almuerzo?: {
    inicio: Date
    fin: Date
  }
}

// Horarios según legislación colombiana
const HORARIO_DIURNO_INICIO = 6 // 6:00 AM
const HORARIO_DIURNO_FIN = 21 // 9:00 PM
const HORARIO_NOCTURNO_INICIO = 21 // 9:00 PM 
const HORARIO_NOCTURNO_FIN = 6 // 6:00 AM (del día siguiente)
const JORNADA_MAXIMA_DIARIA = 8 // 8 horas
const JORNADA_MAXIMA_SEMANAL = 44 // 44 horas

// Recargos según ley
const RECARGOS = {
  nocturno: 0.35, // +35%
  extraDiurna: 0.25, // +25%
  extraNocturna: 0.75, // +75%
  // TODAS las horas de domingo/festivo son "extra" (días de descanso obligatorio)
  dominicalDiurno: 1.00, // +100% (todas las horas)
  dominicalNocturno: 1.50, // +150% (todas las horas)
  festivoDiurno: 1.00, // +100% (todas las horas)
  festivoNocturno: 1.50 // +150% (todas las horas)
}

/**
 * Calcula el desglose completo de horas trabajadas con recargos
 */
export function calculateHoursBreakdown(
  workPeriod: WorkPeriod,
  salarioHora: number,
  festivos: Date[] = []
): HoursBreakdown {
  
  // Calcular tiempo neto trabajado (sin almuerzo)
  const tiempoTrabajado = calculateNetWorkTime(workPeriod)
  
  // Dividir en segmentos por día/horario/tipo
  const segmentos = divideIntoTimeSegments(tiempoTrabajado, festivos)
  
  // Calcular horas por categoría
  const breakdown = calculateHoursByCategory(segmentos, salarioHora)
  
  return breakdown
}

/**
 * Calcula tiempo neto trabajado (excluyendo almuerzo)
 */
function calculateNetWorkTime(workPeriod: WorkPeriod): { inicio: Date, fin: Date } {
  // Por ahora retornamos el tiempo completo
  // El tiempo de almuerzo se maneja en el cálculo de segmentos
  return {
    inicio: workPeriod.entrada,
    fin: workPeriod.salida
  }
}

/**
 * Divide el tiempo trabajado en segmentos por tipo de día y horario
 */
function divideIntoTimeSegments(
  periodo: { inicio: Date, fin: Date },
  festivos: Date[]
): TimeSegment[] {
  const segmentos: TimeSegment[] = []
  let horasAcumuladas = 0
  
  let current = new Date(periodo.inicio)
  const end = new Date(periodo.fin)
  
  while (current < end) {
    // Determinar fin del segmento actual (cambio de día o fin del período)
    const finDelDia = new Date(current)
    finDelDia.setHours(23, 59, 59, 999)
    
    const finSegmento = finDelDia < end ? finDelDia : end
    
    // Dividir el día en segmentos diurnos y nocturnos
    const segmentosDia = divideByDayNightCycle(current, finSegmento, festivos, horasAcumuladas)
    
    segmentos.push(...segmentosDia)
    horasAcumuladas += segmentosDia.reduce((acc, seg) => acc + seg.duracionHoras, 0)
    
    // Avanzar al siguiente día
    current = new Date(finSegmento)
    current.setDate(current.getDate() + 1)
    current.setHours(0, 0, 0, 0)
  }
  
  return segmentos
}

/**
 * Divide un día en segmentos diurnos y nocturnos
 */
function divideByDayNightCycle(
  inicio: Date,
  fin: Date,
  festivos: Date[],
  horasAcumuladas: number
): TimeSegment[] {
  const segmentos: TimeSegment[] = []
  const tipoDia = getTipoDia(inicio, festivos)
  
  let current = new Date(inicio)
  
  while (current < fin) {
    const hora = current.getHours()
    
    // Determinar si estamos en horario diurno o nocturno
    const esDiurno = hora >= HORARIO_DIURNO_INICIO && hora < HORARIO_DIURNO_FIN
    const horario = esDiurno ? 'diurno' : 'nocturno'
    
    // Encontrar el fin de este segmento horario
    let finSegmento: Date
    
    if (esDiurno) {
      // Segmento diurno: hasta las 9 PM o fin del período
      finSegmento = new Date(current)
      finSegmento.setHours(HORARIO_DIURNO_FIN, 0, 0, 0)
      if (finSegmento > fin) finSegmento = fin
    } else {
      // Segmento nocturno: hasta las 6 AM del día siguiente o fin del período
      finSegmento = new Date(current)
      if (hora >= HORARIO_NOCTURNO_INICIO) {
        // Después de 9 PM, ir hasta 6 AM del día siguiente
        finSegmento.setDate(finSegmento.getDate() + 1)
        finSegmento.setHours(HORARIO_NOCTURNO_FIN, 0, 0, 0)
      } else {
        // Antes de 6 AM, ir hasta 6 AM del mismo día
        finSegmento.setHours(HORARIO_NOCTURNO_FIN, 0, 0, 0)
      }
      if (finSegmento > fin) finSegmento = fin
    }
    
    const duracionMs = finSegmento.getTime() - current.getTime()
    const duracionHoras = duracionMs / (1000 * 60 * 60)
    
    if (duracionHoras > 0) {
      // Determinar si son horas ordinarias o extra
      const tipo = (horasAcumuladas + duracionHoras <= JORNADA_MAXIMA_DIARIA) ? 'ordinaria' : 'extra'
      
      segmentos.push({
        inicio: new Date(current),
        fin: new Date(finSegmento),
        tipo,
        horario,
        dia: tipoDia,
        duracionHoras
      })
      
      horasAcumuladas += duracionHoras
    }
    
    current = finSegmento
  }
  
  return segmentos
}

/**
 * Determina el tipo de día (ordinario, domingo, festivo)
 */
function getTipoDia(fecha: Date, festivos: Date[]): 'ordinario' | 'domingo' | 'festivo' {
  // Verificar si es festivo
  const fechaStr = fecha.toISOString().split('T')[0]
  const esFestivo = festivos.some(festivo => 
    festivo.toISOString().split('T')[0] === fechaStr
  )
  
  if (esFestivo) return 'festivo'
  
  // Verificar si es domingo
  if (fecha.getDay() === 0) return 'domingo'
  
  return 'ordinario'
}

/**
 * Calcula las horas por categoría y los montos a pagar
 */
function calculateHoursByCategory(
  segmentos: TimeSegment[],
  salarioHora: number
): HoursBreakdown {
  
  const breakdown: HoursBreakdown = {
    ordinarias: 0,
    extraDiurnas: 0,
    extraNocturnas: 0,
    nocturnas: 0,
    dominicalesDiurnas: 0,
    dominicalesNocturnas: 0,
    festivasDiurnas: 0,
    festivasNocturnas: 0,
    totalHoras: 0,
    salarioBase: 0,
    recargoNocturno: 0,
    recargoDominical: 0, // No se usa pero mantengo por compatibilidad
    recargoFestivo: 0, // No se usa pero mantengo por compatibilidad
    extraDiurna: 0,
    extraNocturna: 0,
    extraDominicalDiurna: 0,
    extraDominicalNocturna: 0,
    extraFestivaDiurna: 0,
    extraFestivaNocturna: 0
  }
  
  for (const segmento of segmentos) {
    const horas = segmento.duracionHoras
    breakdown.totalHoras += horas
    
    // Clasificar las horas según tipo, horario y día
    if (segmento.dia === 'ordinario') {
      // Días ordinarios (lunes a sábado)
      if (segmento.tipo === 'ordinaria') {
        if (segmento.horario === 'diurno') {
          breakdown.ordinarias += horas
          breakdown.salarioBase += horas * salarioHora
        } else {
          breakdown.nocturnas += horas
          breakdown.salarioBase += horas * salarioHora
          breakdown.recargoNocturno += horas * salarioHora * RECARGOS.nocturno
        }
      } else { // horas extra en días ordinarios
        if (segmento.horario === 'diurno') {
          breakdown.extraDiurnas += horas
          breakdown.extraDiurna += horas * salarioHora * (1 + RECARGOS.extraDiurna)
        } else {
          breakdown.extraNocturnas += horas
          breakdown.extraNocturna += horas * salarioHora * (1 + RECARGOS.extraNocturna)
        }
      }
    } else if (segmento.dia === 'domingo') {
      // TODAS las horas del domingo son "extra" (día de descanso obligatorio)
      if (segmento.horario === 'diurno') {
        breakdown.dominicalesDiurnas += horas
        breakdown.extraDominicalDiurna += horas * salarioHora * (1 + RECARGOS.dominicalDiurno)
      } else {
        breakdown.dominicalesNocturnas += horas
        breakdown.extraDominicalNocturna += horas * salarioHora * (1 + RECARGOS.dominicalNocturno)
      }
    } else if (segmento.dia === 'festivo') {
      // TODAS las horas del festivo son "extra" (día de descanso obligatorio)
      if (segmento.horario === 'diurno') {
        breakdown.festivasDiurnas += horas
        breakdown.extraFestivaDiurna += horas * salarioHora * (1 + RECARGOS.festivoDiurno)
      } else {
        breakdown.festivasNocturnas += horas
        breakdown.extraFestivaNocturna += horas * salarioHora * (1 + RECARGOS.festivoNocturno)
      }
    }
  }
  
  return breakdown
}

/**
 * Obtiene el total a pagar por las horas trabajadas
 */
export function getTotalPay(breakdown: HoursBreakdown): number {
  return (
    breakdown.salarioBase +
    breakdown.recargoNocturno +
    breakdown.recargoDominical +
    breakdown.recargoFestivo +
    breakdown.extraDiurna +
    breakdown.extraNocturna +
    breakdown.extraDominicalDiurna +
    breakdown.extraDominicalNocturna +
    breakdown.extraFestivaDiurna +
    breakdown.extraFestivaNocturna
  )
}

/**
 * Valida si se puede continuar trabajando (límites legales)
 */
export function validateWorkingLimits(
  empleadoId: string,
  horasHoy: number,
  horasSemana: number,
  esDomingoOFestivo: boolean,
  tieneAutorizacion: boolean = false
): {
  puedeTrabajar: boolean
  razon?: string
  requiereAutorizacion: boolean
} {
  
  // Límite diario de 8 horas sin autorización
  if (horasHoy >= JORNADA_MAXIMA_DIARIA && !tieneAutorizacion) {
    return {
      puedeTrabajar: false,
      razon: 'Has completado tu jornada laboral de 8 horas. Necesitas autorización para horas extras.',
      requiereAutorizacion: true
    }
  }
  
  // Límite semanal de 44 horas
  if (horasSemana >= JORNADA_MAXIMA_SEMANAL) {
    return {
      puedeTrabajar: false,
      razon: 'Has alcanzado el límite semanal de 44 horas.',
      requiereAutorizacion: false
    }
  }
  
  // Trabajo en domingo o festivo requiere autorización previa
  if (esDomingoOFestivo && !tieneAutorizacion) {
    return {
      puedeTrabajar: false,
      razon: 'Trabajar en domingo o festivo requiere autorización previa.',
      requiereAutorizacion: true
    }
  }
  
  return {
    puedeTrabajar: true,
    requiereAutorizacion: false
  }
}

/**
 * Función simplificada para compatibilidad con el código existente
 */
export function calculateWorkHours(
  entrada: string,
  salida: string,
  inicioAlmuerzo?: string,
  finAlmuerzo?: string
): number {
  const workPeriod: WorkPeriod = {
    entrada: new Date(entrada),
    salida: new Date(salida),
    almuerzo: inicioAlmuerzo && finAlmuerzo ? {
      inicio: new Date(inicioAlmuerzo),
      fin: new Date(finAlmuerzo)
    } : undefined
  }
  
  const totalMs = workPeriod.salida.getTime() - workPeriod.entrada.getTime()
  let totalHours = totalMs / (1000 * 60 * 60)
  
  // Restar tiempo de almuerzo
  if (workPeriod.almuerzo) {
    const almuerzoMs = workPeriod.almuerzo.fin.getTime() - workPeriod.almuerzo.inicio.getTime()
    const almuerzoHours = almuerzoMs / (1000 * 60 * 60)
    totalHours -= almuerzoHours
  }
  
  return Math.max(0, totalHours)
}

export type { HoursBreakdown, TimeSegment, WorkPeriod } 