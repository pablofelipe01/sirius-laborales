'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { SiriusButton } from '@/components/ui/SiriusButton'
import { PlantaCrecimiento } from '@/components/ui/PlantaCrecimiento'
import { SiriusDB } from '@/lib/supabase'
import { 
  Users, 
  Clock, 
  DollarSign, 
  Calendar,
  BarChart3,
  Settings,
  Shield,
  ArrowLeft,
  Leaf,
  Sun,
  TrendingUp,
  AlertCircle
} from 'lucide-react'

interface AdminStats {
  totalEmpleados: number
  empleadosActivos: number
  horasDelDia: number
  horasPendientes: number
  solicitudesPendientes: number
  nominaMensual: number
}

interface EmpleadoActivo {
  id: string
  nombre: string
  apodo: string
  estado: string
  horasHoy: number
  ultimaActividad: string
}

export default function AdminDashboard() {
  const { employee, logout } = useAuth()
  const router = useRouter()
  
  const [stats, setStats] = useState<AdminStats>({
    totalEmpleados: 0,
    empleadosActivos: 0,
    horasDelDia: 0,
    horasPendientes: 0,
    solicitudesPendientes: 0,
    nominaMensual: 0
  })
  
  const [empleadosActivos, setEmpleadosActivos] = useState<EmpleadoActivo[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Verificar que el usuario tiene permisos de admin
  useEffect(() => {
    if (!employee) {
      router.replace('/login')
      return
    }
    
    // Solo Luisa tiene acceso administrativo (cédula específica)
    if (employee.cedula !== '123456789') {
      router.replace('/dashboard')
      return
    }
    
    loadAdminData()
  }, [employee, router])

  const loadAdminData = async () => {
    try {
      setIsLoading(true)
      
      // Cargar estadísticas administrativas reales
      const statsData = await SiriusDB.getAdminStats()
      setStats(statsData)
      
      // Cargar empleados activos hoy
      const activosData = await SiriusDB.getActiveEmployeesToday()
      setEmpleadosActivos(activosData)
      
    } catch (error) {
      console.error('Error cargando datos administrativos:', error)
      // En caso de error, usar datos de respaldo
      setStats({
        totalEmpleados: 0,
        empleadosActivos: 0,
        horasDelDia: 0,
        horasPendientes: 0,
        solicitudesPendientes: 0,
        nominaMensual: 0
      })
      setEmpleadosActivos([])
    } finally {
      setIsLoading(false)
    }
  }

  const adminSections = [
    {
      id: 'empleados',
      title: 'Gestión de Empleados',
      description: 'Administrar personal y perfiles',
      icon: <Users className="w-8 h-8" />,
      color: 'sirius-green-main',
      route: '/admin/empleados',
      stats: `${stats.totalEmpleados} empleados`
    },
    {
      id: 'horas',
      title: 'Control de Horas',
      description: 'Revisar y autorizar jornadas',
      icon: <Clock className="w-8 h-8" />,
      color: 'sirius-sky-main',
      route: '/admin/horas',
      stats: `${stats.horasDelDia}h hoy`
    },
    {
      id: 'nomina',
      title: 'Sistema de Nómina',
      description: 'Cálculos y pagos laborales',
      icon: <DollarSign className="w-8 h-8" />,
      color: 'sirius-sun-main',
      route: '/admin/nomina',
      stats: `$${stats.nominaMensual.toLocaleString()}`
    },
    {
      id: 'calendarios',
      title: 'Calendario y Festivos',
      description: 'Gestionar días especiales',
      icon: <Calendar className="w-8 h-8" />,
      color: 'sirius-earth-main',
      route: '/admin/calendario',
      stats: 'Colombia 2025-2030'
    },
    {
      id: 'reportes',
      title: 'Reportes y Analytics',
      description: 'Estadísticas y tendencias',
      icon: <BarChart3 className="w-8 h-8" />,
      color: 'sirius-green-dark',
      route: '/admin/reportes',
      stats: 'Dashboard avanzado'
    },
    {
      id: 'configuracion',
      title: 'Configuración',
      description: 'Ajustes del sistema',
      icon: <Settings className="w-8 h-8" />,
      color: 'gray-600',
      route: '/admin/configuracion',
      stats: 'Sistema general'
    }
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-starry-night flex items-center justify-center">
        <div className="text-center">
          <motion.div
            className="w-16 h-16 border-4 border-sirius-green-main border-t-transparent rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-sirius-green-main">Cargando jardín administrativo...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-starry-night">
      {/* Elementos decorativos de jardín */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 8 }, (_, i) => (
          <motion.div
            key={i}
            className="absolute opacity-20"
            style={{
              left: `${10 + (i * 12) % 80}%`,
              top: `${20 + (i * 8) % 60}%`
            }}
            animate={{
              y: [0, -10, 0],
              rotate: [0, 5, 0, -5, 0]
            }}
            transition={{
              duration: 6 + (i % 3),
              repeat: Infinity,
              delay: i * 0.5,
            }}
          >
            <Leaf className="w-6 h-6 text-sirius-green-main" />
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 p-4 max-w-7xl mx-auto">
        {/* Header Administrativo */}
        <motion.div
          className="bg-white/95 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-white/30 mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <SiriusButton
                variant="secondary"
                onClick={() => router.push('/dashboard')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Dashboard
              </SiriusButton>
              
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-sirius-sun-main to-sirius-sun-light rounded-full flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">
                    Panel Administrativo 🌺
                  </h1>
                  <p className="text-gray-600">
                    Bienvenida {employee?.apodo || employee?.nombre} - Gestiona tu jardín laboral
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <PlantaCrecimiento
                nivel={8}
                tipo="arbol"
                size="sm"
                animation={true}
              />
              <SiriusButton
                variant="secondary"
                onClick={logout}
                className="text-gray-600"
              >
                Salir
              </SiriusButton>
            </div>
          </div>
        </motion.div>

        {/* Estadísticas rápidas */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 border border-white/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-sirius-green-main/20 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-sirius-green-main" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Empleados Activos</p>
                <p className="text-xl font-bold text-gray-800">{stats.empleadosActivos}/{stats.totalEmpleados}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 border border-white/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-sirius-sky-main/20 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-sirius-sky-main" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Horas del Día</p>
                <p className="text-xl font-bold text-gray-800">{stats.horasDelDia}h</p>
              </div>
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 border border-white/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-sirius-sun-main/20 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-sirius-sun-main" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Nómina Estimada</p>
                <p className="text-xl font-bold text-gray-800">${stats.nominaMensual.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 border border-white/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pendientes</p>
                <p className="text-xl font-bold text-gray-800">{stats.solicitudesPendientes}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Grid principal de secciones administrativas */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          {adminSections.map((section, index) => (
            <motion.div
              key={section.id}
              className="bg-white/95 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-white/30 cursor-pointer hover:shadow-2xl transition-all duration-300"
              whileHover={{ y: -5, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push(section.route)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.6 }}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                  section.color === 'sirius-green-main' ? 'bg-sirius-green-main/20 text-sirius-green-main' :
                  section.color === 'sirius-sky-main' ? 'bg-sirius-sky-main/20 text-sirius-sky-main' :
                  section.color === 'sirius-sun-main' ? 'bg-sirius-sun-main/20 text-sirius-sun-main' :
                  section.color === 'sirius-earth-main' ? 'bg-sirius-earth-main/20 text-sirius-earth-main' :
                  section.color === 'sirius-green-dark' ? 'bg-sirius-green-dark/20 text-sirius-green-dark' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {section.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">
                    {section.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {section.description}
                  </p>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-500">{section.stats}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <SiriusButton
                  variant="secondary"
                  size="sm"
                  className="text-xs"
                >
                  Administrar →
                </SiriusButton>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Panel de empleados activos */}
        <motion.div
          className="bg-white/95 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-white/30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-800">
              Actividad del Día 🌱
            </h3>
            <SiriusButton
              variant="secondary"
              size="sm"
              onClick={() => router.push('/admin/horas')}
            >
              Ver detalle completo
            </SiriusButton>
          </div>
          
          {empleadosActivos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {empleadosActivos.map((empleado) => (
                <div
                  key={empleado.id}
                  className="bg-gradient-to-r from-sirius-green-light/20 to-sirius-sky-light/20 rounded-2xl p-4 border border-sirius-green-main/20"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-sirius-green-main rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {empleado.apodo?.charAt(0) || empleado.nombre.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">
                        {empleado.apodo || empleado.nombre}
                      </p>
                      <p className="text-xs text-gray-600">
                        {empleado.estado}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Horas hoy:</span>
                    <span className="font-medium text-sirius-green-dark">
                      {empleado.horasHoy.toFixed(1)}h
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Sun className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No hay empleados activos en este momento</p>
              <p className="text-sm text-gray-500 mt-1">Los registros aparecerán cuando inicien su jornada</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
} 