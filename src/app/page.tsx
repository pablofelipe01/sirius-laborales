'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion } from 'framer-motion'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Redirigir a login después de una breve animación
    const timer = setTimeout(() => {
      router.replace('/login')
    }, 2000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen bg-starry-night flex items-center justify-center">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" as const }}
      >
        <motion.div
          className="mb-4"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, type: "spring" as const, stiffness: 200 }}
        >
          <Image
            src="/logo-sirius.png"
            alt="SIRIUS Regenerative Logo"
            width={250}
            height={100}
            className="h-auto w-auto max-w-[250px] max-h-[100px] object-contain"
            priority
          />
        </motion.div>
        
        <motion.p
          className="text-sirius-sky-light text-lg mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          Regenerative
        </motion.p>

        <motion.div
          className="w-8 h-8 border-2 border-sirius-green-main border-t-transparent rounded-full mx-auto"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" as const }}
        />
        
        <motion.p
          className="text-white/60 text-sm mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          Transformando personas, regenerando el mundo...
        </motion.p>
      </motion.div>
    </div>
  )
}
