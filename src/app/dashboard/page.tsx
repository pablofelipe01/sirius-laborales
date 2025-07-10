'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { SiriusButton, TimeActionButton } from '@/components/ui/SiriusButton'
import { SaludoAnimado, MensajeRapido } from '@/components/ui/SaludoAnimado'
import { PlantaCrecimiento } from '@/components/ui/PlantaCrecimiento'
import { NotificationSetup } from '@/components/ui/NotificationSetup'
import { useNotifications } from '@/lib/useNotifications'
import { SiriusDB, TimeRecord } from '@/lib/supabase'
import { calculateWorkHours } from '@/lib/utils'
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
  const { setupWorkdayReminders, notifyAchievement, permission } = useNotifications()
  
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
        
        // Configurar notificaciones automáticas cuando se registre entrada
        if (tipo === 'entrada' && permission === 'granted') {
          setupWorkdayReminders()
        }
        
        // Notificaciones de logros para eventos importantes
        if (permission === 'granted') {
          if (tipo === 'entrada') {
            notifyAchievement('¡Has iniciado un nuevo día de crecimiento! 🌱')
          } else if (tipo === 'salida') {
            notifyAchievement('¡Jornada completada con éxito! Has cuidado tu bienestar 🌟')
          }
        }
        
        // Mostrar celebración para ciertos eventos
        if (tipo === 'entrada' || tipo === 'salida') {
          setShowCelebration(true)
          setTimeout(() => setShowCelebration(false), 3000)
        }
        
        // Recargar datos
        await loadDashboardData()
        
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

  const getEstadoMessage = () => {
    const messages = {
      sin_actividad: 'Listo para comenzar tu día 🌅',
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

        {/* Sistema de notificaciones */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <NotificationSetup />
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
              onClick={() => router.push('/pausa-activa')}
              className="flex flex-col items-center gap-2 h-20"
            >
              <Heart className="w-6 h-6" />
              <span>Pausa Activa</span>
              <span className="text-xs opacity-80">Cuida tu bienestar</span>
            </SiriusButton>
          </div>
        </motion.div>

        {/* Jardín personal */}
        <motion.div
          className="bg-white/95 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-white/30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
            Tu jardín personal {employee.emoji_favorito}
          </h3>
          
          <div className="flex justify-center">
            <PlantaCrecimiento
              nivel={Math.min(10, Math.max(1, stats.rachaActual))}
              tipo="suculenta"
              size="lg"
              animation={true}
            />
          </div>
          
          <div className="text-center mt-4">
            <p className="text-gray-600">
              Cada pausa activa ayuda a crecer tu planta
            </p>
            <SiriusButton
              variant="secondary"
              size="sm"
              className="mt-3"
              onClick={() => router.push('/jardin')}
            >
              Ver jardín completo 🌿
            </SiriusButton>
          </div>
        </motion.div>
      </div>

      {/* Celebración */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-4xl pointer-events-none"
                style={{
                  left: `${50 + (Math.random() - 0.5) * 60}%`,
                  top: `${50 + (Math.random() - 0.5) * 60}%`
                }}
                initial={{ scale: 0, rotate: 0 }}
                animate={{ 
                  scale: [0, 1.5, 0],
                  rotate: 360,
                  y: [0, -100, -200]
                }}
                transition={{ 
                  duration: 3, 
                  delay: i * 0.1,
                  ease: "easeOut" as const
                }}
              >
                {['🌱', '🌟', '💚', '🎉'][i % 4]}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 