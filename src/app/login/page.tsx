'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'
import { SiriusButton } from '@/components/ui/SiriusButton'
import { PlantaCrecimiento } from '@/components/ui/PlantaCrecimiento'
import { MensajeRapido } from '@/components/ui/SaludoAnimado'
import { Leaf, Sun, Heart } from 'lucide-react'

export default function LoginPage() {
  const [cedula, setCedula] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' }>()
  const [currentWelcomeIndex, setCurrentWelcomeIndex] = useState(0)
  
  const { login, employee } = useAuth()
  const router = useRouter()

  // Mensajes de bienvenida rotativos
  const welcomeMessages = [
    { text: "¡Hola! 🌟 ¿Listo para un día increíble?", emoji: "🌟" },
    { text: "¡Buenos días! ☀️ Que tu jornada esté llena de energía", emoji: "☀️" },
    { text: "¡Bienvenid@! 🌱 Hoy es un gran día para crecer", emoji: "🌱" },
    { text: "¡Hey! 😊 Nos alegra verte por aquí", emoji: "😊" }
  ]

  // Rotar mensajes cada 4 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWelcomeIndex((prev) => (prev + 1) % welcomeMessages.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (employee) {
      router.replace('/dashboard')
    }
  }, [employee, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await handleLogin()
  }

  const handleLogin = async () => {
    if (!cedula.trim()) {
      setMessage({ 
        text: "¡Ups! Necesitamos tu cédula para reconocerte 😊", 
        type: 'error' 
      })
      return
    }

    setIsLoading(true)
    setMessage(undefined)

    try {
      const result = await login(cedula.trim())
      
      if (result.success) {
        setMessage({ text: result.message, type: 'success' })
        // Pequeña pausa para mostrar el mensaje de éxito antes de redirigir
        setTimeout(() => {
          router.replace('/dashboard')
        }, 1500)
      } else {
        setMessage({ text: result.message, type: 'error' })
      }
    } catch {
      setMessage({ 
        text: "¡Ops! Algo no salió como esperábamos 🤔 Inténtalo de nuevo", 
        type: 'error' 
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '') // Solo números
    setCedula(value)
    
    // Limpiar mensaje de error cuando empiece a escribir
    if (message?.type === 'error') {
      setMessage(undefined)
    }
  }

  return (
    <div className="min-h-screen bg-starry-night relative overflow-hidden flex flex-col items-center justify-center p-4 py-8">
      {/* Partículas flotantes de fondo - posiciones fijas para evitar hydration mismatch */}
      <div className="absolute inset-0">
        {[
          { left: 10, top: 20 }, { left: 80, top: 10 }, { left: 30, top: 60 }, { left: 90, top: 80 },
          { left: 15, top: 90 }, { left: 70, top: 30 }, { left: 50, top: 5 }, { left: 25, top: 40 },
          { left: 85, top: 65 }, { left: 5, top: 75 }, { left: 95, top: 35 }, { left: 40, top: 85 },
          { left: 60, top: 15 }, { left: 20, top: 70 }, { left: 75, top: 45 }, { left: 35, top: 25 },
          { left: 65, top: 95 }, { left: 45, top: 55 }, { left: 55, top: 8 }, { left: 12, top: 50 }
        ].map((pos, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full"
            style={{
              left: `${pos.left}%`,
              top: `${pos.top}%`
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.8, 0.2],
              scale: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 4 + (i % 3),
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut" as const
            }}
          />
        ))}
      </div>

      {/* Contenedor principal */}
      <motion.div
        className="w-full max-w-sm relative z-10 mx-auto"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" as const }}
      >
        {/* Logo y header */}
        <motion.div
          className="text-center mb-5"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          {/* Logo SIRIUS con animación */}
          <motion.div
            className="relative mb-4 flex flex-col items-center"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring" as const, stiffness: 400, damping: 17 }}
          >
            {/* Logo real de SIRIUS */}
            <motion.div
              className="relative mb-3"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.8, type: "spring" as const, stiffness: 200 }}
            >
              <Image
                src="/logo-sirius.png"
                alt="SIRIUS Regenerative Logo"
                width={180}
                height={70}
                className="h-auto w-auto max-w-[180px] max-h-[70px] object-contain"
                priority
              />
              
              {/* Elementos decorativos flotantes */}
              <motion.div
                className="absolute -top-2 -right-2"
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 20, 
                  repeat: Infinity,
                  ease: "linear" as const
                }}
              >
                <Leaf className="w-4 h-4 text-sirius-green-main opacity-80" />
              </motion.div>
              
              <motion.div
                className="absolute -bottom-2 -left-2"
                animate={{ 
                  y: [0, -5, 0],
                  opacity: [0.6, 1, 0.6]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity,
                  ease: "easeInOut" as const
                }}
              >
                <Sun className="w-4 h-4 text-sirius-sun-main opacity-80" />
              </motion.div>
            </motion.div>
            
            <motion.p
              className="text-sirius-sky-light text-base font-light"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              Regenerative
            </motion.p>
          </motion.div>

          {/* Mensaje de bienvenida rotativo */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentWelcomeIndex}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20 max-w-xs mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <motion.p
                className="text-white text-sm font-medium text-center"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 0.6 }}
              >
                {welcomeMessages[currentWelcomeIndex].text}
              </motion.p>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Formulario */}
        <motion.div
          className="bg-white/95 backdrop-blur-md rounded-3xl p-6 shadow-2xl border border-white/30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Input de cédula */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <label 
                htmlFor="cedula" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Tu cédula de ciudadanía
              </label>
              <motion.input
                id="cedula"
                type="text"
                value={cedula}
                onChange={handleInputChange}
                placeholder="12345678"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-sirius-green-main focus:ring-4 focus:ring-sirius-green-light/30 transition-all duration-300 text-base"
                maxLength={12}
                whileFocus={{ scale: 1.01 }}
                transition={{ type: "spring" as const, stiffness: 400, damping: 17 }}
              />
              <motion.p
                className="text-xs text-gray-500 mt-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.4 }}
              >
                Solo números, sin puntos ni espacios 😊
              </motion.p>
            </motion.div>

            {/* Mensaje de estado */}
            <AnimatePresence>
              {message && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <MensajeRapido
                    mensaje={message.text}
                    tipo={message.type === 'success' ? 'success' : message.type === 'error' ? 'warning' : 'info'}
                    emoji={message.type === 'success' ? '🎉' : message.type === 'error' ? '😅' : '💚'}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Botón de ingreso */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <SiriusButton
                onClick={handleLogin}
                size="lg"
                loading={isLoading}
                disabled={!cedula.trim()}
                className="w-full"
                icon={<Heart className="w-5 h-5" />}
              >
                {isLoading ? 'Verificando...' : '¡Empecemos! 🚀'}
              </SiriusButton>
            </motion.div>
          </form>

          {/* Planta decorativa */}
          <motion.div
            className="flex justify-center mt-4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
          >
            <PlantaCrecimiento
              nivel={3}
              tipo="flor"
              size="sm"
              showProgress={false}
              animation={true}
            />
          </motion.div>

          {/* Texto inspiracional */}
          <motion.p
            className="text-center text-gray-600 text-sm mt-4 leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.5 }}
          >
            En SIRIUS cuidamos de ti como cuidamos la tierra
            <br />
            <span className="text-sirius-green-dark font-medium">
              Transformando personas, regenerando el mundo 🌍
            </span>
          </motion.p>
        </motion.div>

        {/* Footer decorativo */}
        <motion.div
          className="text-center mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.5 }}
        >
          <div className="flex justify-center items-center gap-2 text-white/60 text-xs">
            <Leaf className="w-3 h-3" />
            <span>Cada día es una nueva oportunidad de crecer</span>
            <Leaf className="w-3 h-3" />
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
} 