'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface SiriusButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'earth' | 'sky' | 'sun' | 'pausa'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  disabled?: boolean
  loading?: boolean
  icon?: React.ReactNode
  className?: string
  animate?: boolean
}

export const SiriusButton: React.FC<SiriusButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  className,
  animate = true
}) => {
  const baseClasses = "relative inline-flex items-center justify-center font-medium rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
  
  const variants = {
    primary: "bg-gradient-to-r from-sirius-green-main to-sirius-green-light text-white shadow-glow hover:shadow-lg hover:scale-105 focus:ring-sirius-green-light",
    secondary: "bg-white border-2 border-sirius-green-main text-sirius-green-dark hover:bg-sirius-green-light hover:border-sirius-green-light focus:ring-sirius-green-light",
    earth: "bg-gradient-to-r from-sirius-earth-main to-sirius-earth-light text-white shadow-earth hover:shadow-lg hover:scale-105 focus:ring-sirius-earth-light",
    sky: "bg-gradient-to-r from-sirius-sky-main to-sirius-sky-light text-white shadow-sky hover:shadow-lg hover:scale-105 focus:ring-sirius-sky-light",
    sun: "bg-gradient-to-r from-sirius-sun-main to-sirius-sun-light text-gray-800 hover:shadow-lg hover:scale-105 focus:ring-sirius-sun-light",
    pausa: "bg-gradient-to-r from-sirius-green-main to-sirius-sky-main text-white shadow-glow animate-breathe hover:shadow-lg focus:ring-sirius-green-light"
  }
  
  const sizes = {
    sm: "px-3 py-2 text-sm gap-1",
    md: "px-4 py-3 text-base gap-2",
    lg: "px-6 py-4 text-lg gap-3",
    xl: "px-8 py-5 text-xl gap-4"
  }

  const motionProps = animate ? {
    whileHover: { scale: disabled ? 1 : 1.02 },
    whileTap: { scale: disabled ? 1 : 0.98 },
    transition: { type: "spring" as const, stiffness: 400, damping: 17 }
  } : {}

  return (
    <motion.button
      className={cn(baseClasses, variants[variant], sizes[size], className)}
      onClick={onClick}
      disabled={disabled || loading}
      {...motionProps}
    >
      {/* Efecto de onda al hacer click */}
      <motion.div
        className="absolute inset-0 rounded-xl"
        initial={{ scale: 0, opacity: 0.5 }}
        animate={{ scale: 0, opacity: 0.5 }}
        whileTap={{ scale: 1.5, opacity: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          background: variant === 'primary' ? 'rgba(127, 209, 174, 0.3)' : 'rgba(255, 255, 255, 0.3)'
        }}
      />
      
      {/* Contenido del botón */}
      <div className="relative flex items-center gap-2">
        {loading && (
          <motion.div
            className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        )}
        {!loading && icon && (
          <motion.div
            initial={{ scale: 1 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            {icon}
          </motion.div>
        )}
        <span>{children}</span>
      </div>
      
      {/* Partículas flotantes para el botón de pausa */}
      {variant === 'pausa' && (
        <>
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/30 rounded-full"
              style={{
                left: `${20 + i * 30}%`,
                top: `${20 + i * 20}%`
              }}
              animate={{
                y: [-10, 10, -10],
                opacity: [0.3, 0.7, 0.3]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.5,
                ease: "easeInOut"
              }}
            />
          ))}
        </>
      )}
    </motion.button>
  )
}

// Botón especializado para pausas activas
export const PausaActivaButton: React.FC<Omit<SiriusButtonProps, 'variant'>> = (props) => {
  return (
    <SiriusButton 
      {...props} 
      variant="pausa"
      icon={<span className="text-lg">🌱</span>}
    >
      {props.children}
    </SiriusButton>
  )
}

// Botón especializado para entrada/salida
export const TimeActionButton: React.FC<SiriusButtonProps & { timeType: 'entrada' | 'almuerzo' | 'salida' }> = ({ 
  timeType, 
  ...props 
}) => {
  const timeIcons = {
    entrada: '🌅',
    almuerzo: '🍽️',
    salida: '🌙'
  }
  
  const timeVariants = {
    entrada: 'sun' as const,
    almuerzo: 'earth' as const,
    salida: 'sky' as const
  }
  
  return (
    <SiriusButton 
      {...props}
      variant={timeVariants[timeType]}
      icon={<span className="text-lg">{timeIcons[timeType]}</span>}
    >
      {props.children}
    </SiriusButton>
  )
} 