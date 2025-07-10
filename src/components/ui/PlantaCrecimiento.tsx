'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface PlantaCrecimientoProps {
  nivel: number // 1-10
  tipo?: 'suculenta' | 'arbol' | 'flor' | 'helecho'
  animation?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showProgress?: boolean
  className?: string
}

export const PlantaCrecimiento: React.FC<PlantaCrecimientoProps> = ({
  nivel = 1,
  tipo = 'suculenta',
  animation = true,
  size = 'md',
  showProgress = true,
  className = ''
}) => {
  // Asegurar que el nivel esté entre 1 y 10
  const nivelSeguro = Math.max(1, Math.min(10, nivel))
  
  const sizes = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
    xl: 'w-48 h-48'
  }

  const getPlantEmoji = () => {
    const plantas = {
      suculenta: {
        1: '🌱', 2: '🌱', 3: '🪴', 4: '🪴', 5: '🌿',
        6: '🌿', 7: '🌵', 8: '🌵', 9: '🌵', 10: '🌵'
      },
      arbol: {
        1: '🌱', 2: '🌱', 3: '🪴', 4: '🌿', 5: '🌿',
        6: '🌳', 7: '🌳', 8: '🌳', 9: '🌳', 10: '🌳'
      },
      flor: {
        1: '🌱', 2: '🌱', 3: '🪴', 4: '🌸', 5: '🌸',
        6: '🌺', 7: '🌺', 8: '🌻', 9: '🌻', 10: '🌻'
      },
      helecho: {
        1: '🌱', 2: '🌱', 3: '🪴', 4: '🌿', 5: '🌿',
        6: '🌿', 7: '🌿', 8: '🌿', 9: '🌿', 10: '🌿'
      }
    }
    
    return plantas[tipo][nivelSeguro as keyof typeof plantas[typeof tipo]]
  }

  const getNivelText = () => {
    const niveles = {
      1: 'Semilla recién plantada',
      2: 'Germinando con amor',
      3: 'Primeras hojas',
      4: 'Creciendo fuerte',
      5: 'Desarrollo saludable',
      6: 'Floreciendo',
      7: 'En plena forma',
      8: 'Majestuosa',
      9: 'Inspiradora',
      10: 'Jardín maestro'
    }
    
    return niveles[nivelSeguro as keyof typeof niveles]
  }

  const getHealthStatus = () => {
    if (nivelSeguro >= 8) return 'plant-healthy'
    if (nivelSeguro >= 5) return ''
    return 'plant-needs-care'
  }

  const animationProps = animation ? {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { 
      duration: 0.8, 
      type: "spring" as const, 
      stiffness: 200, 
      damping: 15 
    }
  } : {}

  const floatingAnimation = animation ? {
    animate: {
      y: [0, -5, 0],
      rotate: [0, 2, -2, 0]
    },
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut" as const
    }
  } : {}

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      {/* Contenedor de la planta */}
      <motion.div
        className={`${sizes[size]} flex items-center justify-center relative`}
        {...animationProps}
      >
        {/* Fondo decorativo */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-sirius-sky-light/20 to-sirius-earth-light/20 rounded-full"
          animate={animation ? {
            scale: [1, 1.05, 1],
            opacity: [0.3, 0.5, 0.3]
          } : {}}
          transition={animation ? {
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          } : {}}
        />
        
        {/* La planta */}
        <motion.div
          className={`text-4xl md:text-5xl lg:text-6xl ${getHealthStatus()}`}
          {...floatingAnimation}
        >
          {getPlantEmoji()}
        </motion.div>

        {/* Partículas de crecimiento */}
        {animation && nivelSeguro >= 5 && (
          <>
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-sirius-green-main rounded-full"
                style={{
                  left: `${30 + i * 20}%`,
                  top: `${20 + i * 15}%`
                }}
                animate={{
                  y: [0, -20, -40],
                  opacity: [1, 0.5, 0],
                  scale: [0.5, 1, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.4,
                  ease: "easeOut"
                }}
              />
            ))}
          </>
        )}
      </motion.div>

      {/* Información del nivel */}
      {showProgress && (
        <motion.div
          className="text-center"
          initial={animation ? { opacity: 0, y: 10 } : {}}
          animate={animation ? { opacity: 1, y: 0 } : {}}
          transition={animation ? { delay: 0.5, duration: 0.5 } : {}}
        >
          <div className="text-sm font-medium text-sirius-green-dark">
            Nivel {nivelSeguro}/10
          </div>
          <div className="text-xs text-gray-600 mt-1">
            {getNivelText()}
          </div>
          
          {/* Barra de progreso */}
          <div className="w-20 h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-sirius-green-main to-sirius-green-light rounded-full"
              initial={animation ? { width: 0 } : { width: `${(nivelSeguro / 10) * 100}%` }}
              animate={{ width: `${(nivelSeguro / 10) * 100}%` }}
              transition={animation ? { delay: 0.8, duration: 1, ease: "easeOut" } : {}}
            />
          </div>
        </motion.div>
      )}

      {/* Consejos según el nivel */}
      {nivelSeguro <= 3 && (
        <motion.div
          className="text-xs text-center text-gray-500 max-w-32"
          initial={animation ? { opacity: 0 } : {}}
          animate={animation ? { opacity: 1 } : {}}
          transition={animation ? { delay: 1.2, duration: 0.5 } : {}}
        >
          ¡Haz más pausas activas para ayudar a crecer tu planta! 💚
        </motion.div>
      )}
    </div>
  )
}

// Componente de jardín para mostrar múltiples plantas
export const JardinVirtual: React.FC<{
  plantas: Array<{ id: string; nivel: number; tipo?: PlantaCrecimientoProps['tipo']; nombre?: string }>
  className?: string
}> = ({ plantas, className = '' }) => {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 ${className}`}>
      {plantas.map((planta, index) => (
        <motion.div
          key={planta.id}
          className="bg-white/50 backdrop-blur-sm rounded-xl p-3 border border-sirius-green-light/30"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1, duration: 0.5 }}
        >
          <PlantaCrecimiento
            nivel={planta.nivel}
            tipo={planta.tipo}
            size="sm"
            animation={true}
          />
          {planta.nombre && (
            <div className="text-xs text-center mt-2 text-gray-600 font-medium">
              {planta.nombre}
            </div>
          )}
        </motion.div>
      ))}
    </div>
  )
}

// Componente de celebración cuando la planta crece
export const CelebrationPlanta: React.FC<{
  show: boolean
  mensaje?: string
  onComplete?: () => void
}> = ({ show, mensaje = "¡Tu planta ha crecido!", onComplete }) => {
  if (!show) return null

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center z-50 bg-black/20 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onComplete}
    >
      <motion.div
        className="bg-white rounded-2xl p-8 text-center shadow-2xl max-w-sm mx-4"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        exit={{ scale: 0, rotate: 180 }}
        transition={{ type: "spring" as const, stiffness: 200, damping: 15 }}
      >
        <motion.div
          className="text-6xl mb-4"
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 10, -10, 0]
          }}
          transition={{ 
            duration: 0.6, 
            repeat: 3 
          }}
        >
          🎉
        </motion.div>
        
        <h3 className="text-2xl font-bold text-sirius-green-dark mb-2">
          ¡Felicitaciones!
        </h3>
        
        <p className="text-gray-600 mb-4">
          {mensaje}
        </p>
        
        <motion.button
          className="px-6 py-2 bg-gradient-to-r from-sirius-green-main to-sirius-green-light text-white rounded-full font-medium"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onComplete}
        >
          ¡Genial! 🌱
        </motion.button>

        {/* Confetti de hojas */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-2xl pointer-events-none"
            style={{
              left: `${20 + i * 10}%`,
              top: `${10 + (i % 3) * 20}%`
            }}
            initial={{ y: -50, opacity: 0, rotate: 0 }}
            animate={{ 
              y: 100, 
              opacity: [0, 1, 0], 
              rotate: 360 
            }}
            transition={{ 
              duration: 2, 
              delay: i * 0.1,
              ease: "easeOut"
            }}
          >
            🍃
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  )
} 