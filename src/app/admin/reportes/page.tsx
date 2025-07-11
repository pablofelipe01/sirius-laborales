'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { SiriusButton } from '@/components/ui/SiriusButton'
import { SiriusDB } from '@/lib/supabase'
import { 
  BarChart3, 
  ArrowLeft, 
  TrendingUp,
  Users,
  Clock,
  DollarSign,
  Calendar,
  Star,
  Activity
} from 'lucide-react'

interface ReportStats {
  totalEmpleados: number
  empleadosActivos: number
  horasDelMes: number
  horasPromedioDia: number
  nominaDelMes: number
  pausasRealizadas: number
  productividadPromedio: number
  crecimientoMensual: number
}

export default function ReportesPage() {
  const { employee } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<ReportStats>({
    totalEmpleados: 0,
    empleadosActivos: 0,
    horasDelMes: 0,
    horasPromedioDia: 0,
    nominaDelMes: 0,
    pausasRealizadas: 0,
    productividadPromedio: 0,
    crecimientoMensual: 0
  })
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))

  useEffect(() => {
    if (!employee) {
      router.replace('/login')
      return
    }
    
    const isAdmin = employee.cedula === '1019090206'
    if (!isAdmin) {
      router.replace('/dashboard')
      return
    }

    loadReportData()
  }, [employee, router, selectedMonth])

  const loadReportData = async () => {
    try {
      setLoading(true)
      
      // Obtener estadísticas reales de la base de datos
      const adminStats = await SiriusDB.getAdminStats()
      const employeesWithStats = await SiriusDB.getAllEmployeesWithStats()
      
      // Calcular estadísticas para el reporte
      const totalHoras = employeesWithStats.reduce((sum, emp) => sum + (emp.total_horas || 0), 0)
      const totalPausas = employeesWithStats.reduce((sum, emp) => sum + (emp.pausas_activas_realizadas || 0), 0)
      const totalNomina = employeesWithStats.reduce((sum, emp) => sum + (emp.total_pago || 0), 0)
      
      setStats({
        totalEmpleados: employeesWithStats.length,
        empleadosActivos: adminStats.empleadosActivos,
        horasDelMes: totalHoras,
        horasPromedioDia: totalHoras / 30, // Promedio mensual
        nominaDelMes: totalNomina,
        pausasRealizadas: totalPausas,
        productividadPromedio: totalHoras > 0 ? (totalPausas / totalHoras) * 100 : 0,
        crecimientoMensual: 0 // Calcular en base a datos históricos si es necesario
      })
    } catch (error) {
      console.error('Error loading report data:', error)
      // Si hay error, mantener valores por defecto en 0
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-starry-night flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Generando reportes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-starry-night relative overflow-hidden">
      {/* Partículas flotantes de fondo */}
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
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 p-4 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="bg-white/95 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-white/30 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <SiriusButton
                variant="secondary"
                onClick={() => router.back()}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver
              </SiriusButton>
              
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-sirius-green-dark to-sirius-green-main rounded-full flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">
                    Reportes y Analytics 📊
                  </h1>
                  <p className="text-gray-600">
                    Estadísticas y tendencias del jardín laboral
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-600" />
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-2 rounded-xl border border-gray-200 focus:border-sirius-green-main focus:ring-2 focus:ring-sirius-green-light/30 transition-all duration-300"
              />
            </div>
          </div>
        </motion.div>

        {/* Métricas principales */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Empleados</p>
                <p className="text-3xl font-bold text-gray-800">{stats.totalEmpleados}</p>
                <p className="text-sm text-green-600">+{stats.crecimientoMensual.toFixed(1)}% este mes</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-r from-sirius-green-main to-sirius-green-dark rounded-full flex items-center justify-center">
                <Users className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Horas del Mes</p>
                <p className="text-3xl font-bold text-gray-800">{stats.horasDelMes.toFixed(0)}</p>
                <p className="text-sm text-blue-600">{stats.horasPromedioDia.toFixed(1)}h promedio/día</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-r from-sirius-sky-main to-sirius-sky-light rounded-full flex items-center justify-center">
                <Clock className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Nómina del Mes</p>
                <p className="text-3xl font-bold text-gray-800">${stats.nominaDelMes.toLocaleString('es-CO')}</p>
                <p className="text-sm text-orange-600">Calculado automáticamente</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-r from-sirius-sun-main to-sirius-sun-light rounded-full flex items-center justify-center">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pausas Activas</p>
                <p className="text-3xl font-bold text-gray-800">{stats.pausasRealizadas}</p>
                <p className="text-sm text-purple-600">{stats.productividadPromedio.toFixed(1)}% productividad</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Star className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Indicadores de rendimiento */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/30">
            <div className="flex items-center gap-3 mb-4">
              <Activity className="w-6 h-6 text-sirius-green-main" />
              <h3 className="text-xl font-semibold text-gray-800">Actividad General</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Empleados Activos</span>
                <span className="font-semibold">{stats.empleadosActivos}/{stats.totalEmpleados}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-sirius-green-main h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(stats.empleadosActivos / stats.totalEmpleados) * 100}%` }}
                />
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Productividad</span>
                <span className="font-semibold">{stats.productividadPromedio.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-sirius-sky-main h-2 rounded-full transition-all duration-300"
                  style={{ width: `${stats.productividadPromedio}%` }}
                />
              </div>
            </div>
          </div>
          
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/30">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-6 h-6 text-sirius-sun-main" />
              <h3 className="text-xl font-semibold text-gray-800">Crecimiento</h3>
            </div>
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-4xl font-bold text-sirius-green-main mb-2">
                  +{stats.crecimientoMensual.toFixed(1)}%
                </p>
                <p className="text-gray-600">Crecimiento mensual</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-sirius-green-light/20 rounded-xl p-3">
                  <p className="text-2xl font-bold text-sirius-green-dark">{stats.horasDelMes.toFixed(0)}</p>
                  <p className="text-sm text-gray-600">Horas totales</p>
                </div>
                <div className="bg-sirius-sky-light/20 rounded-xl p-3">
                  <p className="text-2xl font-bold text-sirius-sky-dark">{stats.pausasRealizadas}</p>
                  <p className="text-sm text-gray-600">Pausas activas</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Mensaje inspiracional */}
        <motion.div
          className="bg-gradient-to-r from-sirius-green-main to-sirius-sky-main rounded-2xl p-6 shadow-xl border border-white/30 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <div className="text-white">
            <h3 className="text-2xl font-bold mb-2">¡El jardín SIRIUS florece! 🌺</h3>
            <p className="text-lg opacity-90">
              Cada hora trabajada, cada pausa activa, cada momento de crecimiento contribuye al ecosistema regenerativo
            </p>
            <p className="text-sm mt-2 opacity-80">
              Datos actualizados en tiempo real • Mes de {new Date(selectedMonth).toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 