import { createClient } from '@supabase/supabase-js'
import { calculateHoursBreakdown, getTotalPay, validateWorkingLimits, type HoursBreakdown, type WorkPeriod } from './calculations'
import { getAllHolidays, isHoliday, isSundayOrHoliday, type Holiday } from './holidays'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Cliente principal para operaciones normales
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Cliente administrativo para operaciones con permisos elevados
export const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null

// Tipos TypeScript para la base de datos
export interface Employee {
  id: string
  cedula: string
  nombre: string
  apodo?: string
  salario: number // Salario por hora
  cargo: string // Campo agregado para empleados reales
  departamento: string // Campo agregado para empleados reales
  pausas_activas_enabled: boolean
  racha_pausas: number
  emoji_favorito: string
  created_at: string
}

export interface TimeRecord {
  id: string
  employee_id: string
  tipo: 'entrada' | 'inicio_almuerzo' | 'fin_almuerzo' | 'salida' | 'inicio_pausa_activa' | 'fin_pausa_activa'
  timestamp: string
  mensaje_motivacional?: string
  created_at: string
}

export interface ActiveBreak {
  id: string
  employee_id: string
  fecha_inicio: string
  fecha_fin?: string
  duracion_segundos?: number
  tipo: 'respiracion' | 'estiramiento' | 'caminata' | 'gratitud'
  completada: boolean
  estado_animo_antes?: 'estresado' | 'cansado' | 'bien' | 'feliz'
  estado_animo_despues?: 'estresado' | 'cansado' | 'bien' | 'feliz'
  created_at: string
}

export interface MotivationalMessage {
  id: string
  tipo: 'entrada' | 'almuerzo' | 'pausa_activa' | 'salida' | 'logro'
  mensaje: string
  emoji?: string
  activo: boolean
}

export interface Achievement {
  id: string
  employee_id: string
  tipo: string
  fecha: string
  mensaje?: string
  celebrado: boolean
}

// Nuevas interfaces para el sistema extendido
export interface HoursSummary {
  id: string
  employee_id: string
  fecha: string
  horas_ordinarias: number
  horas_extra_diurnas: number
  horas_extra_nocturnas: number
  horas_nocturnas: number
  horas_dominicales_diurnas: number
  horas_dominicales_nocturnas: number
  horas_festivas_diurnas: number
  horas_festivas_nocturnas: number
  total_horas: number
  salario_base: number
  recargo_nocturno: number
  recargo_dominical: number
  recargo_festivo: number
  extra_diurna: number
  extra_nocturna: number
  extra_dominical_diurna: number
  extra_dominical_nocturna: number
  extra_festiva_diurna: number
  extra_festiva_nocturna: number
  total_pago: number
  pausas_activas_realizadas: number
  created_at: string
  updated_at: string
}

export interface OvertimeRequest {
  id: string
  employee_id: string
  fecha: string
  tipo: 'extra' | 'dominical' | 'festivo'
  horas_estimadas: number
  motivo: string
  justificacion?: string
  estado: 'pendiente' | 'aprobado' | 'rechazado'
  aprobado_por?: string
  aprobado_en?: string
  comentarios_aprobacion?: string
  created_at: string
  updated_at: string
}

// Funciones helper para interactuar con la base de datos
export class SiriusDB {
  // Autenticación por cédula
  static async authenticateEmployee(cedula: string): Promise<Employee | null> {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('cedula', cedula)
        .single()
      
      if (error) {
        console.error('Error autenticando empleado:', error)
        return null
      }
      
      return data
    } catch (error) {
      console.error('Error en autenticación:', error)
      return null
    }
  }

  // Registrar tiempo (entrada, almuerzo, salida, etc.)
  static async recordTime(
    employeeId: string, 
    tipo: TimeRecord['tipo'], 
    mensajeMotivacional?: string
  ): Promise<TimeRecord | null> {
    try {
      const { data, error } = await supabase
        .from('time_records')
        .insert([{
          employee_id: employeeId,
          tipo,
          timestamp: new Date().toISOString(),
          mensaje_motivacional: mensajeMotivacional
        }])
        .select()
        .single()
      
      if (error) {
        console.error('Error registrando tiempo:', error)
        return null
      }
      
      return data
    } catch (error) {
      console.error('Error en registro de tiempo:', error)
      return null
    }
  }

  // Obtener registros del día actual
  static async getTodayRecords(employeeId: string): Promise<TimeRecord[]> {
    try {
      const today = new Date().toISOString().split('T')[0]
      
      const { data, error } = await supabase
        .from('time_records')
        .select('*')
        .eq('employee_id', employeeId)
        .gte('timestamp', `${today}T00:00:00`)
        .lt('timestamp', `${today}T23:59:59`)
        .order('timestamp', { ascending: true })
      
      if (error) {
        console.error('Error obteniendo registros:', error)
        return []
      }
      
      return data || []
    } catch (error) {
      console.error('Error en obtención de registros:', error)
      return []
    }
  }

  // Iniciar pausa activa
  static async startActiveBreak(
    employeeId: string, 
    tipo: ActiveBreak['tipo'],
    estadoAnimoAntes?: ActiveBreak['estado_animo_antes']
  ): Promise<ActiveBreak | null> {
    try {
      const { data, error } = await supabase
        .from('active_breaks')
        .insert([{
          employee_id: employeeId,
          fecha_inicio: new Date().toISOString(),
          tipo,
          estado_animo_antes: estadoAnimoAntes,
          completada: false
        }])
        .select()
        .single()
      
      if (error) {
        console.error('Error iniciando pausa activa:', error)
        return null
      }
      
      return data
    } catch (error) {
      console.error('Error en inicio de pausa activa:', error)
      return null
    }
  }

  // Completar pausa activa
  static async completeActiveBreak(
    breakId: string,
    estadoAnimoDespues?: ActiveBreak['estado_animo_despues']
  ): Promise<ActiveBreak | null> {
    try {
      const fechaFin = new Date().toISOString()
      
      // Primero obtenemos la pausa activa para calcular duración
      const { data: breakData } = await supabase
        .from('active_breaks')
        .select('fecha_inicio')
        .eq('id', breakId)
        .single()
      
      if (!breakData) return null
      
      const duracionSegundos = Math.floor(
        (new Date(fechaFin).getTime() - new Date(breakData.fecha_inicio).getTime()) / 1000
      )
      
      const { data, error } = await supabase
        .from('active_breaks')
        .update({
          fecha_fin: fechaFin,
          duracion_segundos: duracionSegundos,
          estado_animo_despues: estadoAnimoDespues,
          completada: true
        })
        .eq('id', breakId)
        .select()
        .single()
      
      if (error) {
        console.error('Error completando pausa activa:', error)
        return null
      }
      
      return data
    } catch (error) {
      console.error('Error en completar pausa activa:', error)
      return null
    }
  }

  // Obtener mensaje motivacional aleatorio
  static async getMotivationalMessage(tipo: MotivationalMessage['tipo']): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('motivational_messages')
        .select('mensaje, emoji')
        .eq('tipo', tipo)
        .eq('activo', true)
      
      if (error || !data || data.length === 0) {
        // Mensajes de respaldo
        const fallbackMessages = {
          entrada: '¡Hola! 🌟 ¿Listo para un día increíble?',
          almuerzo: '¡Mmm, hora de nutrir el cuerpo! 🍽️',
          pausa_activa: '¡Momento de respirar! Tu cuerpo te lo agradecerá 🌱',
          salida: '¡Qué día tan productivo! Descansa, te lo mereces 🌙',
          logro: '¡Increíble! Has conseguido algo especial 🎉'
        }
        return fallbackMessages[tipo] || '¡Que tengas un gran día! 😊'
      }
      
      // Seleccionar mensaje aleatorio
      const randomMessage = data[Math.floor(Math.random() * data.length)]
      return `${randomMessage.mensaje} ${randomMessage.emoji || ''}`
    } catch (error) {
      console.error('Error obteniendo mensaje motivacional:', error)
      return '¡Que tengas un gran día! 😊'
    }
  }

  // Actualizar racha de pausas
  static async updatePausaStreak(employeeId: string): Promise<void> {
    try {
      const { data: employee } = await supabase
        .from('employees')
        .select('racha_pausas')
        .eq('id', employeeId)
        .single()
      
      if (!employee) return
      
      await supabase
        .from('employees')
        .update({ racha_pausas: employee.racha_pausas + 1 })
        .eq('id', employeeId)
    } catch (error) {
      console.error('Error actualizando racha de pausas:', error)
    }
  }

  // ======== SISTEMA EXTENDIDO DE HORAS CON RECARGOS ========

  // Calcular y guardar resumen de horas del día
  static async calculateAndSaveDailyHours(
    employeeId: string,
    fecha: string = new Date().toISOString().split('T')[0]
  ): Promise<HoursSummary | null> {
    try {
      // Obtener empleado con salario
      const { data: employee } = await supabase
        .from('employees')
        .select('salario_hora')
        .eq('id', employeeId)
        .single()
      
      if (!employee || !employee.salario_hora) return null
      
      // Obtener registros del día
      const records = await this.getTodayRecords(employeeId)
      
      // Buscar entrada y salida
      const entrada = records.find(r => r.tipo === 'entrada')
      const salida = records.find(r => r.tipo === 'salida')
      
      if (!entrada || !salida) return null
      
      // Buscar almuerzo
      const inicioAlmuerzo = records.find(r => r.tipo === 'inicio_almuerzo')
      const finAlmuerzo = records.find(r => r.tipo === 'fin_almuerzo')
      
      // Construir período de trabajo
      const workPeriod: WorkPeriod = {
        entrada: new Date(entrada.timestamp),
        salida: new Date(salida.timestamp),
        almuerzo: inicioAlmuerzo && finAlmuerzo ? {
          inicio: new Date(inicioAlmuerzo.timestamp),
          fin: new Date(finAlmuerzo.timestamp)
        } : undefined
      }
      
      // Obtener festivos del año
      const festivos = getAllHolidays().map(h => h.fecha)
      
      // Calcular desglose de horas
      const breakdown = calculateHoursBreakdown(workPeriod, employee.salario_hora, festivos)
      const totalPago = getTotalPay(breakdown)
      
      // Contar pausas activas realizadas
      const pausasHoy = await this.getTodayActiveBreaks(employeeId)
      
      // Preparar datos para guardar
      const summaryData = {
        employee_id: employeeId,
        fecha,
        horas_ordinarias: breakdown.ordinarias,
        horas_extra_diurnas: breakdown.extraDiurnas,
        horas_extra_nocturnas: breakdown.extraNocturnas,
        horas_nocturnas: breakdown.nocturnas,
        horas_dominicales_diurnas: breakdown.dominicalesDiurnas,
        horas_dominicales_nocturnas: breakdown.dominicalesNocturnas,
        horas_festivas_diurnas: breakdown.festivasDiurnas,
        horas_festivas_nocturnas: breakdown.festivasNocturnas,
        total_horas: breakdown.totalHoras,
        salario_base: breakdown.salarioBase,
        recargo_nocturno: breakdown.recargoNocturno,
        recargo_dominical: breakdown.recargoDominical,
        recargo_festivo: breakdown.recargoFestivo,
        extra_diurna: breakdown.extraDiurna,
        extra_nocturna: breakdown.extraNocturna,
        extra_dominical_diurna: breakdown.extraDominicalDiurna,
        extra_dominical_nocturna: breakdown.extraDominicalNocturna,
        extra_festiva_diurna: breakdown.extraFestivaDiurna,
        extra_festiva_nocturna: breakdown.extraFestivaNocturna,
        total_pago: totalPago,
        pausas_activas_realizadas: pausasHoy.length
      }
      
      // Guardar en hours_summary (upsert)
      const { data, error } = await supabase
        .from('hours_summary')
        .upsert([summaryData], {
          onConflict: 'employee_id,fecha'
        })
        .select()
        .single()
      
      if (error) {
        console.error('Error guardando resumen de horas:', error)
        return null
      }
      
      return data
    } catch (error) {
      console.error('Error en cálculo de horas:', error)
      return null
    }
  }

  // Validar límites de trabajo
  static async validateWorkingLimitsForEmployee(
    employeeId: string
  ): Promise<{
    puedeTrabajar: boolean
    razon?: string
    requiereAutorizacion: boolean
  }> {
    try {
      // Obtener horas de hoy
      const today = new Date().toISOString().split('T')[0]
      const { data: todaySummary } = await supabase
        .from('hours_summary')
        .select('total_horas')
        .eq('employee_id', employeeId)
        .eq('fecha', today)
        .single()
      
      const horasHoy = todaySummary?.total_horas || 0
      
      // Obtener horas de la semana
      const startOfWeek = new Date()
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
      const weekStart = startOfWeek.toISOString().split('T')[0]
      
      const { data: weekSummary } = await supabase
        .from('hours_summary')
        .select('total_horas')
        .eq('employee_id', employeeId)
        .gte('fecha', weekStart)
        .lte('fecha', today)
      
      const horasSemana = weekSummary?.reduce((acc, day) => acc + day.total_horas, 0) || 0
      
      // Verificar si es domingo o festivo
      const hoy = new Date()
      const esDomingoOFestivo = isSundayOrHoliday(hoy)
      
      // Verificar si tiene autorización
      const { data: authorization } = await supabase
        .from('overtime_requests')
        .select('id')
        .eq('employee_id', employeeId)
        .eq('fecha', today)
        .eq('estado', 'aprobado')
        .single()
      
      const tieneAutorizacion = !!authorization
      
      return validateWorkingLimits(
        employeeId,
        horasHoy,
        horasSemana,
        esDomingoOFestivo,
        tieneAutorizacion
      )
    } catch (error) {
      console.error('Error validando límites de trabajo:', error)
      return {
        puedeTrabajar: true,
        requiereAutorizacion: false
      }
    }
  }

  // Obtener pausas activas del día
  static async getTodayActiveBreaks(employeeId: string): Promise<ActiveBreak[]> {
    try {
      const today = new Date().toISOString().split('T')[0]
      
      const { data, error } = await supabase
        .from('active_breaks')
        .select('*')
        .eq('employee_id', employeeId)
        .gte('fecha_inicio', `${today}T00:00:00`)
        .lt('fecha_inicio', `${today}T23:59:59`)
        .order('fecha_inicio', { ascending: true })
      
      if (error) {
        console.error('Error obteniendo pausas activas:', error)
        return []
      }
      
      return data || []
    } catch (error) {
      console.error('Error en obtención de pausas activas:', error)
      return []
    }
  }

  // Crear solicitud de horas extras
  static async createOvertimeRequest(
    employeeId: string,
    tipo: OvertimeRequest['tipo'],
    fecha: string,
    horasEstimadas: number,
    motivo: string,
    justificacion?: string
  ): Promise<OvertimeRequest | null> {
    try {
      const { data, error } = await supabase
        .from('overtime_requests')
        .insert([{
          employee_id: employeeId,
          fecha,
          tipo,
          horas_estimadas: horasEstimadas,
          motivo,
          justificacion,
          estado: 'pendiente'
        }])
        .select()
        .single()
      
      if (error) {
        console.error('Error creando solicitud de horas extras:', error)
        return null
      }
      
      return data
    } catch (error) {
      console.error('Error en creación de solicitud:', error)
      return null
    }
  }

  // Verificar si una fecha es festivo
  static async isHolidayDate(date: Date): Promise<boolean> {
    return isHoliday(date)
  }

  // Obtener festivos del año
  static getYearHolidays(year: number = new Date().getFullYear()): Holiday[] {
    return getAllHolidays().filter(h => h.fecha.getFullYear() === year)
  }

  // Calcular desglose de horas sin guardar (para preview)
  static calculateHoursPreview(
    workPeriod: WorkPeriod,
    salarioHora: number
  ): HoursBreakdown {
    const festivos = getAllHolidays().map(h => h.fecha)
    return calculateHoursBreakdown(workPeriod, salarioHora, festivos)
  }

  // Obtener estadísticas avanzadas para el dashboard administrativo
  static async getEmployeeStats(employeeId: string, startDate?: string, endDate?: string) {
    try {
      const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      const end = endDate || new Date().toISOString().split('T')[0]
      
      const { data, error } = await supabase
        .from('hours_summary')
        .select('*')
        .eq('employee_id', employeeId)
        .gte('fecha', start)
        .lte('fecha', end)
        .order('fecha', { ascending: false })
      
      if (error) {
        console.error('Error obteniendo estadísticas:', error)
        return null
      }
      
      return data
    } catch (error) {
      console.error('Error en estadísticas:', error)
      return null
    }
  }

  // ========== FUNCIONES ADMINISTRATIVAS ==========

  // Obtener estadísticas generales para el dashboard administrativo
  static async getAdminStats() {
    try {
      const today = new Date().toISOString().split('T')[0]
      
      // Contar empleados totales
      const { count: totalEmpleados } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true })
        .eq('activo', true)
      
      // Contar empleados activos hoy (que registraron entrada)
      const { data: empleadosActivos } = await supabase
        .from('time_records')
        .select('employee_id')
        .eq('tipo', 'entrada')
        .gte('timestamp', `${today}T00:00:00`)
        .lt('timestamp', `${today}T23:59:59`)
      
      // Obtener horas del día
      const { data: horasHoy } = await supabase
        .from('hours_summary')
        .select('total_horas')
        .eq('fecha', today)
      
      const horasDelDia = horasHoy?.reduce((acc, h) => acc + h.total_horas, 0) || 0
      
      // Obtener solicitudes pendientes
      const { count: solicitudesPendientes } = await supabase
        .from('overtime_requests')
        .select('*', { count: 'exact', head: true })
        .eq('estado', 'pendiente')
      
      // Calcular nómina estimada del mes
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
      const { data: nominaData } = await supabase
        .from('hours_summary')
        .select('total_pago')
        .gte('fecha', startOfMonth)
        .lte('fecha', today)
      
      const nominaMensual = nominaData?.reduce((acc, p) => acc + p.total_pago, 0) || 0
      
      return {
        totalEmpleados: totalEmpleados || 0,
        empleadosActivos: empleadosActivos?.length || 0,
        horasDelDia,
        horasPendientes: 0, // TODO: Implementar lógica de horas pendientes
        solicitudesPendientes: solicitudesPendientes || 0,
        nominaMensual
      }
    } catch (error) {
      console.error('Error obteniendo estadísticas administrativas:', error)
      return {
        totalEmpleados: 0,
        empleadosActivos: 0,
        horasDelDia: 0,
        horasPendientes: 0,
        solicitudesPendientes: 0,
        nominaMensual: 0
      }
    }
  }

  // Obtener empleados activos hoy con su estado
  static async getActiveEmployeesToday() {
    try {
      const today = new Date().toISOString().split('T')[0]
      
      // Obtener empleados que registraron entrada hoy
      const { data: empleadosConEntrada } = await supabase
        .from('time_records')
        .select(`
          employee_id,
          employees!inner(
            id,
            nombre,
            apodo,
            cedula
          )
        `)
        .eq('tipo', 'entrada')
        .gte('timestamp', `${today}T00:00:00`)
        .lt('timestamp', `${today}T23:59:59`)
      
      if (!empleadosConEntrada) return []
      
      // Para cada empleado, obtener su estado actual y horas
      const empleadosActivos = await Promise.all(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        empleadosConEntrada.map(async (record: any) => {
          const emp = record.employees
          
          // Obtener último registro para determinar estado
          const { data: ultimoRegistro } = await supabase
            .from('time_records')
            .select('tipo, timestamp')
            .eq('employee_id', emp.id)
            .gte('timestamp', `${today}T00:00:00`)
            .lt('timestamp', `${today}T23:59:59`)
            .order('timestamp', { ascending: false })
            .limit(1)
            .single()
          
          // Obtener horas del día
          const { data: horasData } = await supabase
            .from('hours_summary')
            .select('total_horas')
            .eq('employee_id', emp.id)
            .eq('fecha', today)
            .single()
          
          // Determinar estado actual
          let estado = 'sin_actividad'
          if (ultimoRegistro) {
            switch (ultimoRegistro.tipo) {
              case 'entrada':
              case 'fin_almuerzo':
              case 'fin_pausa_activa':
                estado = 'trabajando'
                break
              case 'inicio_almuerzo':
                estado = 'almorzando'
                break
              case 'inicio_pausa_activa':
                estado = 'pausa_activa'
                break
              case 'salida':
                estado = 'jornada_terminada'
                break
            }
          }
          
          return {
            id: emp.id,
            nombre: emp.nombre,
            apodo: emp.apodo || emp.nombre,
            estado,
            horasHoy: horasData?.total_horas || 0,
            ultimaActividad: ultimoRegistro?.timestamp || ''
          }
        })
      )
      
      return empleadosActivos
    } catch (error) {
      console.error('Error obteniendo empleados activos:', error)
      return []
    }
  }

  // Obtener todos los empleados con estadísticas completas
  static async getAllEmployeesWithStats(fecha?: string) {
    try {
      const targetDate = fecha || new Date().toISOString().split('T')[0]
      
      const { data: empleados, error } = await supabase
        .from('employees')
        .select(`
          *,
          hours_summary!left(
            fecha,
            total_horas,
            total_pago,
            horas_ordinarias,
            horas_extra_diurnas,
            horas_extra_nocturnas,
            horas_nocturnas,
            horas_dominicales_diurnas,
            horas_dominicales_nocturnas,
            horas_festivas_diurnas,
            horas_festivas_nocturnas,
            salario_base,
            recargo_nocturno,
            extra_diurna,
            extra_nocturna,
            extra_dominical_diurna,
            extra_dominical_nocturna,
            extra_festiva_diurna,
            extra_festiva_nocturna
          )
        `)
        .eq('activo', true)
        .eq('hours_summary.fecha', targetDate)
        .order('nombre', { ascending: true })
      
      if (error) {
        console.error('Error obteniendo empleados con estadísticas:', error)
        return []
      }
      
      return empleados || []
    } catch (error) {
      console.error('Error en obtención de empleados con estadísticas:', error)
      return []
    }
  }

  // Actualizar información de empleado
  static async updateEmployee(employeeId: string, updates: Partial<Employee>) {
    try {
      const { data, error } = await supabase
        .from('employees')
        .update(updates)
        .eq('id', employeeId)
        .select()
        .single()
      
      if (error) {
        console.error('Error actualizando empleado:', error)
        return null
      }
      
      return data
    } catch (error) {
      console.error('Error en actualización de empleado:', error)
      return null
    }
  }

  // Aprobar o rechazar solicitud de horas extra
  static async updateOvertimeRequest(
    requestId: string,
    estado: 'aprobado' | 'rechazado',
    aprobadoPor: string,
    comentarios?: string
  ) {
    try {
      const { data, error } = await supabase
        .from('overtime_requests')
        .update({
          estado,
          aprobado_por: aprobadoPor,
          aprobado_en: new Date().toISOString(),
          comentarios_aprobacion: comentarios
        })
        .eq('id', requestId)
        .select()
        .single()
      
      if (error) {
        console.error('Error actualizando solicitud de horas extra:', error)
        return null
      }
      
      return data
    } catch (error) {
      console.error('Error en actualización de solicitud:', error)
      return null
    }
  }

  // Obtener reporte de nómina
  static async getPayrollReport(startDate: string, endDate: string) {
    try {
      const { data, error } = await supabase
        .from('hours_summary')
        .select(`
          *,
          employees!inner(
            nombre,
            apodo,
            cedula,
            cargo,
            salario_hora
          )
        `)
        .gte('fecha', startDate)
        .lte('fecha', endDate)
        .order('fecha', { ascending: false })
      
      if (error) {
        console.error('Error obteniendo reporte de nómina:', error)
        return []
      }
      
      return data || []
    } catch (error) {
      console.error('Error en reporte de nómina:', error)
      return []
    }
  }

  // Exportar datos de empleados (para Excel/CSV)
  static async exportEmployeeData(startDate: string, endDate: string, format: 'csv' | 'excel' = 'csv') {
    try {
      const data = await this.getPayrollReport(startDate, endDate)
      
      // TODO: Implementar lógica de exportación según formato
      // Por ahora retornamos los datos raw
      return {
        success: true,
        data,
        message: `Datos exportados correctamente (${data.length} registros) en formato ${format}`
      }
    } catch (error) {
      console.error('Error exportando datos:', error)
      return {
        success: false,
        data: [],
        message: 'Error al exportar los datos'
      }
    }
  }
} 