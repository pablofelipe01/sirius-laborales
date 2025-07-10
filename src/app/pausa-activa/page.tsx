'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { SiriusButton } from '@/components/ui/SiriusButton'
import { PlantaCrecimiento } from '@/components/ui/PlantaCrecimiento'
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Heart, 
  Leaf, 
  Sun, 
  Moon, 
  ArrowLeft,
  Timer,
  CheckCircle
} from 'lucide-react'

interface PausaActiva {
  id: string
  titulo: string
  descripcion: string
  duracion: number // en minutos
  categoria: 'respiracion' | 'estiramiento' | 'mindfulness' | 'energia'
  icono: React.ReactNode
  color: string
  audio?: string
  pasos: string[]
}

interface SessionData {
  pausasHoy: number
  tiempoTotal: number // en minutos
  ultimaPausa: Date | null
  racha: number
}

export default function PausaActivaPage() {
  const [pausaSeleccionada, setPausaSeleccionada] = useState<PausaActiva | null>(null)
  const [tiempoRestante, setTiempoRestante] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [pasoActual, setPasoActual] = useState(0)
  const [sessionData, setSessionData] = useState<SessionData>({
    pausasHoy: 0,
    tiempoTotal: 0,
    ultimaPausa: null,
    racha: 0
  })
  const [showCompletion, setShowCompletion] = useState(false)
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const { employee } = useAuth()
  const router = useRouter()

  // Pausas activas disponibles
  const pausasActivas: PausaActiva[] = [
    {
      id: 'respiracion-energia',
      titulo: 'Respiración Energizante',
      descripcion: 'Técnica 4-7-8 para renovar tu energía y claridad mental',
      duracion: 5,
      categoria: 'respiracion',
      icono: <Sun className="w-6 h-6" />,
      color: 'sirius-sun-main',
      pasos: [
        'Siéntate cómodamente con la espalda recta',
        'Coloca una mano en el pecho y otra en el abdomen',
        'Inhala por la nariz durante 4 segundos',
        'Mantén la respiración por 7 segundos',
        'Exhala lentamente por la boca durante 8 segundos',
        'Repite este ciclo sintiendo como la energía fluye por tu cuerpo'
      ]
    },
    {
      id: 'estiramiento-cuello',
      titulo: 'Estiramiento de Cuello y Hombros',
      descripcion: 'Libera la tensión acumulada en cuello y hombros',
      duracion: 7,
      categoria: 'estiramiento',
      icono: <Leaf className="w-6 h-6" />,
      color: 'sirius-green-main',
      pasos: [
        'Siéntate derecho con los pies apoyados en el suelo',
        'Inclina suavemente la cabeza hacia la derecha, mantén 15 segundos',
        'Repite hacia la izquierda',
        'Gira los hombros hacia atrás 5 veces lentamente',
        'Entrelaza los dedos y estira los brazos hacia arriba',
        'Mantén cada estiramiento respirando profundamente'
      ]
    },
    {
      id: 'mindfulness-presente',
      titulo: 'Momento Presente',
      descripcion: 'Reconecta contigo mismo y encuentra tu centro interior',
      duracion: 10,
      categoria: 'mindfulness',
      icono: <Heart className="w-6 h-6" />,
      color: 'sirius-sky-main',
      pasos: [
        'Cierra los ojos suavemente y respira natural',
        'Siente tu cuerpo en contacto con la silla',
        'Observa tus pensamientos sin juzgarlos, déjalos pasar',
        'Enfócate en el sonido de tu respiración',
        'Siente gratitud por este momento de autocuidado',
        'Cuando termines, abre los ojos lentamente'
      ]
    },
    {
      id: 'meditacion-noche',
      titulo: 'Calma Regenerativa',
      descripcion: 'Encuentra paz y serenidad para cerrar el día',
      duracion: 8,
      categoria: 'mindfulness',
      icono: <Moon className="w-6 h-6" />,
      color: 'sirius-earth-main',
      pasos: [
        'Siéntate cómodamente y cierra los ojos',
        'Imagina que estás en un bosque sereno al atardecer',
        'Siente la calma de la naturaleza que te rodea',
        'Con cada exhalación, libera las tensiones del día',
        'Con cada inhalación, recibe paz y tranquilidad',
        'Permanece en esta sensación de calma regenerativa'
      ]
    }
  ]

  // Cargar datos de sesión al montar el componente
  useEffect(() => {
    const savedData = localStorage.getItem('sirius_pausa_data')
    if (savedData) {
      const data = JSON.parse(savedData)
      data.ultimaPausa = data.ultimaPausa ? new Date(data.ultimaPausa) : null
      setSessionData(data)
    }
  }, [])

  // Gestión del temporizador
  useEffect(() => {
    if (isActive && !isPaused && tiempoRestante > 0) {
      intervalRef.current = setInterval(() => {
        setTiempoRestante((time) => {
          if (time <= 1) {
            completarPausa()
            return 0
          }
          return time - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isActive, isPaused, tiempoRestante])

  // Cambiar paso automáticamente
  useEffect(() => {
    if (pausaSeleccionada && isActive && !isPaused) {
      const tiempoPorPaso = (pausaSeleccionada.duracion * 60) / pausaSeleccionada.pasos.length
      const pasoCalculado = Math.floor((pausaSeleccionada.duracion * 60 - tiempoRestante) / tiempoPorPaso)
      if (pasoCalculado < pausaSeleccionada.pasos.length) {
        setPasoActual(pasoCalculado)
      }
    }
  }, [tiempoRestante, pausaSeleccionada, isActive, isPaused])

  const iniciarPausa = (pausa: PausaActiva) => {
    setPausaSeleccionada(pausa)
    setTiempoRestante(pausa.duracion * 60)
    setIsActive(true)
    setIsPaused(false)
    setPasoActual(0)
    setShowCompletion(false)
  }

  const togglePausa = () => {
    setIsPaused(!isPaused)
  }

  const reiniciarPausa = () => {
    if (pausaSeleccionada) {
      setTiempoRestante(pausaSeleccionada.duracion * 60)
      setIsActive(false)
      setIsPaused(false)
      setPasoActual(0)
    }
  }

  const completarPausa = () => {
    if (pausaSeleccionada) {
      const nuevaData = {
        ...sessionData,
        pausasHoy: sessionData.pausasHoy + 1,
        tiempoTotal: sessionData.tiempoTotal + pausaSeleccionada.duracion,
        ultimaPausa: new Date(),
        racha: sessionData.racha + 1
      }
      
      setSessionData(nuevaData)
      localStorage.setItem('sirius_pausa_data', JSON.stringify(nuevaData))
      
      setIsActive(false)
      setShowCompletion(true)
      
      // Auto-cerrar después de 3 segundos
      setTimeout(() => {
        setShowCompletion(false)
        setPausaSeleccionada(null)
      }, 3000)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getColorClass = (color: string) => {
    const colorMap: { [key: string]: string } = {
      'sirius-sun-main': 'text-sirius-sun-main bg-sirius-sun-main/10 border-sirius-sun-main/30',
      'sirius-green-main': 'text-sirius-green-main bg-sirius-green-main/10 border-sirius-green-main/30',
      'sirius-sky-main': 'text-sirius-sky-main bg-sirius-sky-main/10 border-sirius-sky-main/30',
      'sirius-earth-main': 'text-sirius-earth-main bg-sirius-earth-main/10 border-sirius-earth-main/30'
    }
    return colorMap[color] || 'text-gray-600 bg-gray-100 border-gray-300'
  }

  // Redirigir a login si no está autenticado
  useEffect(() => {
    if (!employee) {
      router.replace('/login')
    }
  }, [employee, router])

  if (!employee) {
    return (
      <div className="min-h-screen bg-starry-night flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-sirius-green-main border-t-transparent rounded-full mx-auto mb-4 animate-spin" />
          <p className="text-sirius-green-main">Verificando acceso...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-starry-night relative overflow-hidden">
      {/* Partículas de fondo */}
      <div className="absolute inset-0">
        {Array.from({ length: 15 }, (_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full"
            style={{
              left: `${10 + (i * 6) % 90}%`,
              top: `${15 + (i * 7) % 80}%`
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: 4 + (i % 3),
              repeat: Infinity,
              delay: i * 0.3,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 p-4 max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          className="flex items-center justify-between mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <SiriusButton
            variant="secondary"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </SiriusButton>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-1">
              Pausas Activas
            </h1>
            <p className="text-sirius-sky-light text-sm">
              Cuida tu bienestar, {employee.apodo || employee.nombre} 🌱
            </p>
          </div>

          <div className="w-20"></div> {/* Spacer */}
        </motion.div>

        {/* Stats del día */}
        <motion.div
          className="grid grid-cols-3 gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 text-center">
            <div className="text-2xl font-bold text-sirius-green-main">
              {sessionData.pausasHoy}
            </div>
            <div className="text-sm text-white/70">Pausas hoy</div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 text-center">
            <div className="text-2xl font-bold text-sirius-sky-main">
              {sessionData.tiempoTotal}m
            </div>
            <div className="text-sm text-white/70">Total bienestar</div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 text-center">
            <div className="text-2xl font-bold text-sirius-sun-main">
              {sessionData.racha}
            </div>
            <div className="text-sm text-white/70">Racha días</div>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {!pausaSeleccionada ? (
            // Vista de selección de pausas
            <motion.div
              key="selection"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid gap-4 md:grid-cols-2"
            >
              {pausasActivas.map((pausa, index) => (
                <motion.div
                  key={pausa.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-white/95 backdrop-blur-md rounded-2xl p-6 border border-white/30 cursor-pointer hover:scale-105 transition-all duration-300 ${getColorClass(pausa.color)}`}
                  onClick={() => iniciarPausa(pausa)}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl bg-current/20`}>
                      {pausa.icono}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">
                        {pausa.titulo}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3">
                        {pausa.descripcion}
                      </p>
                      
                      <div className="flex items-center gap-3 text-sm">
                        <span className="flex items-center gap-1">
                          <Timer className="w-4 h-4" />
                          {pausa.duracion} min
                        </span>
                        <span className="capitalize px-2 py-1 bg-current/10 rounded-full">
                          {pausa.categoria}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            // Vista de pausa activa
            <motion.div
              key="active"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="max-w-2xl mx-auto"
            >
              <div className="bg-white/95 backdrop-blur-md rounded-3xl p-8 border border-white/30 text-center">
                {/* Título de la pausa */}
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {pausaSeleccionada.titulo}
                </h2>
                <p className="text-gray-600 mb-8">
                  {pausaSeleccionada.descripcion}
                </p>

                {/* Timer circular */}
                <div className="relative w-48 h-48 mx-auto mb-8">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                      className="text-gray-200"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                      strokeDasharray={`${283} 283`}
                      strokeDashoffset={283 - (283 * (pausaSeleccionada.duracion * 60 - tiempoRestante)) / (pausaSeleccionada.duracion * 60)}
                      className={`text-${pausaSeleccionada.color} transition-all duration-1000`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-800">
                        {formatTime(tiempoRestante)}
                      </div>
                      <div className="text-sm text-gray-500">restantes</div>
                    </div>
                  </div>
                </div>

                {/* Paso actual */}
                {isActive && (
                  <motion.div
                    key={pasoActual}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-50 rounded-xl p-4 mb-6"
                  >
                    <div className="text-sm text-gray-500 mb-2">
                      Paso {pasoActual + 1} de {pausaSeleccionada.pasos.length}
                    </div>
                    <div className="text-gray-700 leading-relaxed">
                      {pausaSeleccionada.pasos[pasoActual]}
                    </div>
                  </motion.div>
                )}

                {/* Controles */}
                <div className="flex justify-center gap-4">
                  <SiriusButton
                    variant="primary"
                    onClick={togglePausa}
                    className="flex items-center gap-2"
                  >
                    {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                    {isPaused ? 'Continuar' : 'Pausar'}
                  </SiriusButton>
                  
                  <SiriusButton
                    variant="secondary"
                    onClick={reiniciarPausa}
                    className="flex items-center gap-2"
                  >
                    <RotateCcw className="w-5 h-5" />
                    Reiniciar
                  </SiriusButton>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal de completación */}
        <AnimatePresence>
          {showCompletion && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-white rounded-3xl p-8 max-w-sm mx-4 text-center"
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.6 }}
                  className="w-16 h-16 bg-sirius-green-main rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <CheckCircle className="w-8 h-8 text-white" />
                </motion.div>
                
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  ¡Pausa completada! ✨
                </h3>
                <p className="text-gray-600 mb-4">
                  Has cuidado tu bienestar. ¡Tu planta está creciendo!
                </p>
                
                <div className="flex justify-center">
                  <PlantaCrecimiento nivel={sessionData.racha} size="md" />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Planta de progreso */}
        <motion.div
          className="fixed bottom-6 right-6"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 border border-white/30">
            <div className="text-center">
              <PlantaCrecimiento nivel={sessionData.racha} size="sm" />
              <div className="text-xs text-gray-600 mt-2">
                Tu bienestar
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 