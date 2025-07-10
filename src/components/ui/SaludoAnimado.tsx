'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGreeting } from '@/contexts/AuthContext'

interface SaludoAnimadoProps {
  momento?: 'entrada' | 'pausa' | 'almuerzo' | 'salida'
  mensajeCustom?: string
  className?: string
  showEmoji?: boolean
}

export const SaludoAnimado: React.FC<SaludoAnimadoProps> = ({
  momento = 'entrada',
  mensajeCustom,
  className = '',
  showEmoji = true
}) => {
  const { getGreeting, employee } = useGreeting()
  const [currentMessage, setCurrentMessage] = useState('')
  const [emoji, setEmoji] = useState('🌱')

  const mensajes = {
    entrada: [
      'Como el sol nutre las plantas, tu energía nutre los proyectos',
      'Cada día es una nueva oportunidad de crecer',
      '¡Qué bueno verte! Hagamos de hoy un gran día',
      'Tu presencia hace la diferencia. ¡Bienvenid@!'
    ],
    pausa: [
      'Las mejores ideas vienen después de respirar profundo',
      'Como la tierra necesita lluvia, tú necesitas pausas',
      '3 minutos de inversión en tu bienestar = horas de mejor energía',
      'Tu cuerpo es sabio, escúchalo'
    ],
    almuerzo: [
      'Como las plantas necesitan nutrientes, tú necesitas esta pausa',
      '¡Disfruta cada bocado! Te lo mereces',
      'Alimenta tu cuerpo, alimenta tu alma',
      'Un almuerzo consciente es un acto de amor propio'
    ],
    salida: [
      'Como las plantas al atardecer, es hora de descansar',
      'Tu trabajo de hoy hace crecer nuestros sueños',
      'El descanso también es productividad',
      'Como la luna cuida las plantas de noche, ve a descansar'
    ]
  }

  const emojis = {
    entrada: ['🌅', '🌱', '☀️', '🌟'],
    pausa: ['🌱', '🌬️', '💚', '🧘'],
    almuerzo: ['🍽️', '🌿', '💚', '😋'],
    salida: ['🌙', '🌅', '🌟', '😌']
  }

  useEffect(() => {
    const randomMessage = mensajes[momento][Math.floor(Math.random() * mensajes[momento].length)]
    const randomEmoji = emojis[momento][Math.floor(Math.random() * emojis[momento].length)]
    
    setCurrentMessage(mensajeCustom || randomMessage)
    setEmoji(randomEmoji)
  }, [momento, mensajeCustom])

  return (
    <motion.div 
      className={`text-center space-y-4 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Saludo principal */}
      <motion.h1
        className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-sirius-green-dark to-sirius-sky-dark bg-clip-text text-transparent"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5, type: "spring" as const, stiffness: 200 }}
      >
        {getGreeting()}
      </motion.h1>

      {/* Emoji animado */}
      {showEmoji && (
        <motion.div
          className="text-6xl md:text-7xl"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            delay: 0.4, 
            duration: 0.8, 
            type: "spring" as const, 
            stiffness: 200, 
            damping: 10 
          }}
        >
          <motion.span
            animate={{ 
              y: [0, -10, 0],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          >
            {emoji}
          </motion.span>
        </motion.div>
      )}

      {/* Mensaje motivacional */}
      <AnimatePresence mode="wait">
        <motion.p
          key={currentMessage}
          className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          {currentMessage}
        </motion.p>
      </AnimatePresence>

      {/* Partículas flotantes */}
      <div className="relative">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-sirius-green-main/30 rounded-full"
            style={{
              left: `${20 + i * 15}%`,
              top: `${10 + (i % 2) * 20}px`
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 0.8, 0.3],
              scale: [0.8, 1.2, 0.8]
            }}
            transition={{
              duration: 4 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.3,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Personalización adicional si tiene emoji favorito */}
      {employee?.emoji_favorito && employee.emoji_favorito !== '🌱' && (
        <motion.div
          className="flex justify-center items-center gap-2 mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <span className="text-sm text-gray-500">Tu planta favorita:</span>
          <motion.span
            className="text-2xl"
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 10, -10, 0]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {employee.emoji_favorito}
          </motion.span>
        </motion.div>
      )}
    </motion.div>
  )
}

// Componente simplificado para mensajes rápidos
export const MensajeRapido: React.FC<{ 
  mensaje: string
  tipo?: 'success' | 'info' | 'warning'
  emoji?: string
}> = ({ mensaje, tipo = 'info', emoji }) => {
  const colores = {
    success: 'from-sirius-green-main to-sirius-green-light',
    info: 'from-sirius-sky-main to-sirius-sky-light',
    warning: 'from-sirius-sun-main to-sirius-sun-light'
  }

  return (
    <motion.div
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${colores[tipo]} text-white shadow-lg`}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring" as const, stiffness: 400, damping: 17 }}
    >
      {emoji && (
        <motion.span
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {emoji}
        </motion.span>
      )}
      <span className="font-medium">{mensaje}</span>
    </motion.div>
  )
} 