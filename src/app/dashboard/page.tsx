'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { SiriusButton, TimeActionButton } from '@/components/ui/SiriusButton'
import { SaludoAnimado, MensajeRapido } from '@/components/ui/SaludoAnimado'
import { PlantaCrecimiento } from '@/components/ui/PlantaCrecimiento'
import { OvertimeNotification } from '@/components/ui/OvertimeNotification'
import { SiriusDB, TimeRecord } from '@/lib/supabase'
import { calculateWorkHours, getTodayLocal } from '@/lib/utils'
import { 
  Clock, 
  Heart, 
  LogOut, 
  User, 
  Calendar,
  Star
} from 'lucide-react'

interface DashboardStats {
  horasHoy: number
  pausasHoy: number
  rachaActual: number
  estado: string
  ultimoRegistro?: string
}

export default function DashboardPage() {
  const { employee, logout, isLoading } = useAuth()
  const router = useRouter()
  
  const [stats, setStats] = useState<DashboardStats>({
    horasHoy: 0,
    pausasHoy: 0,
    rachaActual: 0,
    estado: 'sin_actividad'
  })
  const [registrosHoy, setRegistrosHoy] = useState<TimeRecord[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'info' | 'warning' }>()
  const [showCelebration, setShowCelebration] = useState(false)
  const [showOvertimeNotification, setShowOvertimeNotification] = useState(false)
  const [overtimeData, setOvertimeData] = useState<{
    currentHours: number
    maxRegularHours: number
    isDomingoFestivo?: boolean
    isSundayOrHoliday?: boolean
    reason?: string
  }>({ currentHours: 0, maxRegularHours: 8 })

  // Redirigir a login si no está autenticado
  useEffect(() => {
    if (!isLoading && !employee) {
      router.replace('/login')
    }
  }, [employee, isLoading, router])

  // Cargar datos del empleado
  useEffect(() => {
    if (employee) {
      loadDashboardData()
      // Actualizar cada 30 segundos
      const interval = setInterval(loadDashboardData, 30000)
      return () => clearInterval(interval)
    }
  }, [employee])

  const loadDashboardData = async () => {
    if (!employee) return

    try {
      const registros = await SiriusDB.getTodayRecords(employee.id)
      setRegistrosHoy(registros)
      
      // Calcular estadísticas
      const entrada = registros.find(r => r.tipo === 'entrada')
      const salida = registros.find(r => r.tipo === 'salida')
      const inicioAlmuerzo = registros.find(r => r.tipo === 'inicio_almuerzo')
      const finAlmuerzo = registros.find(r => r.tipo === 'fin_almuerzo')
      const ultimoRegistro = registros[registros.length - 1]
      
      let horasHoy = 0
      // Solo calcular horas si hay entrada registrada
      if (entrada) {
        // Si hay salida, usar ese tiempo. Si no, usar tiempo actual solo si está trabajando
        const estaActivo = ultimoRegistro && ultimoRegistro.tipo !== 'salida'
        
        if (salida) {
          // Jornada completada, calcular con tiempo de salida
          horasHoy = calculateWorkHours(
            entrada.timestamp, 
            salida.timestamp, 
            inicioAlmuerzo?.timestamp, 
            finAlmuerzo?.timestamp
          )
        } else if (estaActivo) {
          // Está trabajando actualmente, calcular hasta ahora
          horasHoy = calculateWorkHours(
            entrada.timestamp, 
            new Date().toISOString(), 
            inicioAlmuerzo?.timestamp, 
            finAlmuerzo?.timestamp
          )
        } else {
          // No ha empezado o no está activo
          horasHoy = 0
        }
      }

      // Determinar estado actual
      let estadoActual = 'sin_actividad'
      
      if (ultimoRegistro) {
        switch (ultimoRegistro.tipo) {
          case 'entrada':
            estadoActual = 'trabajando'
            break
          case 'inicio_almuerzo':
            estadoActual = 'almorzando'
            break
          case 'fin_almuerzo':
            estadoActual = 'trabajando'
            break
          case 'salida':
            estadoActual = 'jornada_terminada'
            break
          case 'inicio_pausa_activa':
            estadoActual = 'pausa_activa'
            break
          case 'fin_pausa_activa':
            estadoActual = 'trabajando'
            break
        }
      }

      setStats({
        horasHoy: Math.max(0, horasHoy),
        pausasHoy: 0, // TODO: calcular desde active_breaks
        rachaActual: employee.racha_pausas,
        estado: estadoActual,
        ultimoRegistro: ultimoRegistro?.timestamp
      })
    } catch (error) {
      console.error('Error cargando datos del dashboard:', error)
    }
  }

  const registrarTiempo = async (tipo: TimeRecord['tipo']) => {
    if (!employee) return

    // VERIFICACIÓN PREVIA: Si va a registrar entrada, verificar si es domingo/festivo
    if (tipo === 'entrada') {
      try {
        const authResult = await SiriusDB.shouldRequestOvertimeAuthorization(employee.id)
        
        if (authResult.needsAuthorization && authResult.isSundayOrHoliday) {
          // Es domingo/festivo sin autorización - mostrar notificación antes de permitir trabajar
          setOvertimeData({
            currentHours: authResult.currentHours,
            maxRegularHours: authResult.maxRegularHours,
            isDomingoFestivo: authResult.isDomingoFestivo,
            isSundayOrHoliday: authResult.isSundayOrHoliday,
            reason: authResult.reason
          })
          setShowOvertimeNotification(true)
          return // No permitir registrar entrada hasta que tenga autorización
        }
      } catch (error) {
        console.error('Error verificando autorización previa:', error)
      }
    }

    setIsRecording(true)
    
    try {
      // Obtener mensaje motivacional
      const mensajeMotivacional = await SiriusDB.getMotivationalMessage(
        tipo === 'entrada' ? 'entrada' :
        tipo.includes('almuerzo') ? 'almuerzo' :
        tipo === 'salida' ? 'salida' : 'entrada'
      )

      // Registrar tiempo
      const registro = await SiriusDB.recordTime(employee.id, tipo, mensajeMotivacional)
      
      if (registro) {
        setMessage({ text: mensajeMotivacional, type: 'success' })
        
        // Mostrar celebración para ciertos eventos
        if (tipo === 'entrada' || tipo === 'salida') {
          setShowCelebration(true)
          setTimeout(() => setShowCelebration(false), 3000)
        }
        
        // Recargar datos
        await loadDashboardData()
        
        // Verificar si necesita autorización para horas extras (solo en días ordinarios después de trabajar)
        if (tipo !== 'salida') {
          await checkOvertimeAuthorization()
        }
        
        // Limpiar mensaje después de 5 segundos
        setTimeout(() => setMessage(undefined), 5000)
      } else {
        setMessage({ 
          text: '¡Ups! Algo no salió bien. Inténtalo de nuevo 😊', 
          type: 'warning' 
        })
      }
    } catch (error) {
      console.error('Error registrando tiempo:', error)
      setMessage({ 
        text: '¡Ops! Hubo un problemita. Inténtalo en un momento 🤔', 
        type: 'warning' 
      })
    } finally {
      setIsRecording(false)
    }
  }

  // Verificar si necesita autorización para horas extras
  const checkOvertimeAuthorization = async () => {
    if (!employee) return

    try {
      const result = await SiriusDB.shouldRequestOvertimeAuthorization(employee.id)
      
      if (result.needsAuthorization) {
        setOvertimeData({
          currentHours: result.currentHours,
          maxRegularHours: result.maxRegularHours,
          isDomingoFestivo: result.isDomingoFestivo,
          isSundayOrHoliday: result.isSundayOrHoliday,
          reason: result.reason
        })
        setShowOvertimeNotification(true)
      }
    } catch (error) {
      console.error('Error verificando autorización de horas extras:', error)
    }
  }

  // Enviar solicitud de horas extras
  const handleOvertimeRequest = async (request: {
    horasEstimadas: number
    motivo: string
    justificacion: string
  }) => {
    if (!employee) {
      return { success: false, message: 'Error: usuario no autenticado' }
    }

    try {
      const result = await SiriusDB.createOvertimeRequest({
        employeeId: employee.id,
        fecha: getTodayLocal(),
        horasEstimadas: request.horasEstimadas,
        motivo: request.motivo,
        justificacion: request.justificacion
      })

      return result
    } catch (error) {
      console.error('Error enviando solicitud de horas extras:', error)
      return {
        success: false,
        message: 'Error inesperado al enviar la solicitud'
      }
    }
  }

  const getEstadoMessage = () => {
    const messages = {
      sin_actividad: 'Listo para empezar el día ☀️',
      trabajando: 'Estás en modo productivo 💪',
      almorzando: '¡Disfruta tu almuerzo! 🍽️',
      pausa_activa: 'Momento de recargar energías 🧘',
      jornada_terminada: '¡Jornada completada! Descansa bien 🌙'
    }
    return messages[stats.estado as keyof typeof messages] || 'Estado desconocido'
  }

  const getDisponibleButtons = () => {
    const ultima = registrosHoy[registrosHoy.length - 1]
    
    if (!ultima) {
      return ['entrada']
    }
    
    switch (ultima.tipo) {
      case 'entrada':
        return ['inicio_almuerzo', 'salida', 'pausa']
      case 'inicio_almuerzo':
        return ['fin_almuerzo']
      case 'fin_almuerzo':
        return ['salida', 'pausa']
      case 'salida':
        return []
      default:
        return ['entrada']
    }
  }

  const buttonActions = getDisponibleButtons()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <motion.div
            className="w-16 h-16 border-4 border-sirius-green-main border-t-transparent rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" as const }}
          />
          <p className="text-sirius-green-dark">Cargando tu jardín personal...</p>
        </div>
      </div>
    )
  }

  if (!employee) {
    return null
  }

  return (
    <div className="min-h-screen bg-starry-night p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header con saludo */}
        <motion.div
          className="bg-white/95 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-white/30"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <SaludoAnimado 
                momento="entrada" 
                className="text-left"
                showEmoji={false}
              />
              
              <motion.div
                className="flex items-center gap-3 mt-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <div className="w-12 h-12 bg-gradient-to-r from-sirius-green-main to-sirius-green-light rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-800">
                    {employee.apodo || employee.nombre}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {getEstadoMessage()}
                  </p>
                </div>
              </motion.div>
            </div>
            
            <div className="flex gap-2">
              <motion.button
                onClick={() => router.push('/admin')}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Calendar className="w-5 h-5" />
              </motion.button>
              
              <motion.button
                onClick={logout}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <LogOut className="w-5 h-5" />
              </motion.button>
            </div>
          </div>

          {/* Mensaje de estado */}
          <AnimatePresence>
            {message && (
              <motion.div
                className="mb-4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <MensajeRapido 
                  mensaje={message.text}
                  tipo={message.type}
                  emoji="🌱"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Estadísticas del día */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          {/* Horas trabajadas */}
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 border border-white/30">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-6 h-6 text-sirius-sky-main" />
              <h3 className="font-semibold text-gray-800">Horas de hoy</h3>
            </div>
            <div className="text-3xl font-bold text-sirius-sky-dark">
              {stats.horasHoy.toFixed(1)}h
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {stats.horasHoy >= 8 ? '¡Meta alcanzada!' : `Faltan ${(8 - stats.horasHoy).toFixed(1)}h`}
            </p>
          </div>

          {/* Pausas activas */}
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 border border-white/30">
            <div className="flex items-center gap-3 mb-2">
              <Heart className="w-6 h-6 text-sirius-green-main" />
              <h3 className="font-semibold text-gray-800">Pausas hoy</h3>
            </div>
            <div className="text-3xl font-bold text-sirius-green-dark">
              {stats.pausasHoy}/3
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {stats.pausasHoy >= 3 ? '¡Excelente cuidado!' : 'Tu cuerpo te lo agradecerá'}
            </p>
          </div>

          {/* Racha de bienestar */}
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 border border-white/30">
            <div className="flex items-center gap-3 mb-2">
              <Star className="w-6 h-6 text-sirius-sun-main" />
              <h3 className="font-semibold text-gray-800">Racha</h3>
            </div>
            <div className="text-3xl font-bold text-sirius-sun-dark">
              {stats.rachaActual}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Días consecutivos de bienestar
            </p>
          </div>
        </motion.div>

        {/* Botones de acción principales */}
        <motion.div
          className="bg-white/95 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-white/30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
            ¿Qué quieres hacer ahora?
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Botones de tiempo */}
            {buttonActions.includes('entrada') && (
              <TimeActionButton
                timeType="entrada"
                size="lg"
                loading={isRecording}
                onClick={() => registrarTiempo('entrada')}
              >
                Iniciar mi día
              </TimeActionButton>
            )}
            
            {buttonActions.includes('inicio_almuerzo') && (
              <TimeActionButton
                timeType="almuerzo"
                size="lg"
                loading={isRecording}
                onClick={() => registrarTiempo('inicio_almuerzo')}
              >
                Hora de almorzar
              </TimeActionButton>
            )}
            
            {buttonActions.includes('fin_almuerzo') && (
              <TimeActionButton
                timeType="almuerzo"
                size="lg"
                loading={isRecording}
                onClick={() => registrarTiempo('fin_almuerzo')}
              >
                Ya almorcé
              </TimeActionButton>
            )}
            
            {buttonActions.includes('salida') && (
              <TimeActionButton
                timeType="salida"
                size="lg"
                loading={isRecording}
                onClick={() => registrarTiempo('salida')}
              >
                Fin del día
              </TimeActionButton>
            )}
            
            {/* Botón de pausa activa siempre disponible */}
            <SiriusButton
              variant="pausa"
              size="lg"
              onClick={() => registrarTiempo('inicio_pausa_activa')}
              disabled={isRecording || stats.estado === 'pausa_activa'}
            >
              {stats.estado === 'pausa_activa' ? 'En pausa activa' : 'Pausa activa'}
            </SiriusButton>
          </div>
        </motion.div>

        {/* Planta de crecimiento */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <PlantaCrecimiento 
            nivel={Math.min(Math.floor(stats.horasHoy), 8)}
            size="lg"
            animation={true}
          />
        </motion.div>

        {/* Celebración animada */}
        <AnimatePresence>
          {showCelebration && (
            <motion.div
              className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="text-8xl"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                transition={{ type: "spring", duration: 0.8 }}
              >
                🌟
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Notificación de horas extras */}
        {showOvertimeNotification && (
          <OvertimeNotification
            employeeName={employee.apodo || employee.nombre}
            currentHours={overtimeData.currentHours}
            onRequestSubmit={handleOvertimeRequest}
            isDomingoFestivo={overtimeData.isDomingoFestivo}
            isSundayOrHoliday={overtimeData.isSundayOrHoliday}
            reason={overtimeData.reason}
            onDismiss={() => setShowOvertimeNotification(false)}
          />
        )}
      </div>
    </div>
  )
} 