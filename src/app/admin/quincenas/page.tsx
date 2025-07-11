'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { SiriusButton } from '@/components/ui/SiriusButton'
import { SiriusDB } from '@/lib/supabase'
import { 
  Calendar, 
  ArrowLeft,
  DollarSign,
  Clock,
  Users,
  Download,

  Award,
  BarChart3,
  Filter,
  ChevronDown,
  Eye
} from 'lucide-react'
import { 
  getQuincenasSirius, 
  getQuincenaActual, 
  formatearNombreQuincena,
  getEstadisticasQuincena,
  getAnosDisponibles,
  type QuincenaSirius 
} from '@/lib/quincenas-sirius'

interface QuincenaReport {
  empleado: {
    id: string
    cedula: string
    nombre: string
    apodo: string
    cargo: string
    departamento: string
    salario: number
  }
  quincenaId: string
  totalHoras: number
  totalPago: number
  horasOrdinarias: number
  horasExtras: number
  horasNocturnas: number
  horasDominicales: number
  horasFestivas: number
  pausasActivas: number
  diasTrabajados: number
  detalleDias: unknown[]
}

interface QuincenaSummary {
  quincenaId: string
  totalEmpleados: number
  empleadosActivos: number
  totalHorasEquipo: number
  totalPagoEquipo: number
  totalPausasActivas: number
  promedioHorasPorEmpleado: number
  promedioPagoPorEmpleado: number
  estatsPorDepartamento: Record<string, {
    empleados: number
    totalHoras: number
    totalPago: number
    empleadosActivos: number
  }>
  empleados: QuincenaReport[]
}

export default function QuincenasAdmin() {
  const { employee } = useAuth()
  const router = useRouter()
  
  const [quincenas] = useState<QuincenaSirius[]>(getQuincenasSirius(2025))
  const [quincenaSeleccionada, setQuincenaSeleccionada] = useState<QuincenaSirius | null>(null)
  const [reporteQuincena, setReporteQuincena] = useState<QuincenaSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [mostrarDetalle, setMostrarDetalle] = useState<string | null>(null)
  const [filtroDepto, setFiltroDepto] = useState('all')

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

    // Seleccionar quincena actual por defecto
    const quincenaActual = getQuincenaActual()
    if (quincenaActual) {
      setQuincenaSeleccionada(quincenaActual)
    } else {
      // Si no hay quincena actual, seleccionar la más reciente
      const ultimaQuincena = quincenas[quincenas.length - 1]
      setQuincenaSeleccionada(ultimaQuincena)
    }
  }, [employee, router, quincenas])

  useEffect(() => {
    if (quincenaSeleccionada) {
      loadQuincenaData(quincenaSeleccionada.id)
    }
  }, [quincenaSeleccionada])

  const loadQuincenaData = async (quincenaId: string) => {
    try {
      setLoading(true)
      const summary = await SiriusDB.getQuincenaSummary(quincenaId)
      setReporteQuincena(summary)
    } catch (error) {
      console.error('Error cargando datos de quincena:', error)
      setReporteQuincena(null)
    } finally {
      setLoading(false)
    }
  }

  const exportarQuincena = () => {
    if (!reporteQuincena || !quincenaSeleccionada) return
    
    console.log('Exportando quincena:', quincenaSeleccionada.id)
    alert('Función de exportación en desarrollo')
  }

  const departamentos = reporteQuincena ? Object.keys(reporteQuincena.estatsPorDepartamento) : []
  
  const empleadosFiltrados = reporteQuincena?.empleados.filter(emp => {
    if (filtroDepto === 'all') return true
    return emp.empleado.departamento === filtroDepto
  }) || []

  if (loading && !reporteQuincena) {
    return (
      <div className="min-h-screen bg-starry-night flex items-center justify-center">
        <div className="text-center">
          <motion.div
            className="w-16 h-16 border-4 border-sirius-green-main border-t-transparent rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-sirius-green-main">Cargando reporte de quincena...</p>
        </div>
      </div>
    )
  }

  const statsQuincena = quincenaSeleccionada ? getEstadisticasQuincena(quincenaSeleccionada) : null

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
          className="bg-white rounded-3xl p-6 shadow-lg border-2 border-gray-300 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <SiriusButton
                variant="secondary"
                onClick={() => router.back()}
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800"
              >
                <ArrowLeft className="w-4 h-4" />
                Panel Admin
              </SiriusButton>
              
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-sirius-green-main to-sirius-green-dark rounded-full flex items-center justify-center shadow-lg">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Reportes por Quincenas 📊
                  </h1>
                  <p className="text-gray-700 font-medium">
                    Acumulados según calendario SIRIUS
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Selector de Quincena */}
              <div className="relative">
                <select
                  value={quincenaSeleccionada?.id || ''}
                  onChange={(e) => {
                    const selected = quincenas.find(q => q.id === e.target.value)
                    setQuincenaSeleccionada(selected || null)
                  }}
                  className="appearance-none px-4 py-2 pr-8 rounded-xl border-2 border-gray-300 focus:border-sirius-green-main focus:ring-4 focus:ring-sirius-green-light/30 transition-all duration-300 bg-white text-gray-900 min-w-[250px]"
                >
                  {quincenas.map((q) => (
                    <option key={q.id} value={q.id}>
                      {formatearNombreQuincena(q)}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
              </div>
              
              <SiriusButton
                onClick={exportarQuincena}
                variant="primary"
                size="sm"
                className="flex items-center gap-2 bg-sirius-green-main hover:bg-sirius-green-dark text-white"
              >
                <Download className="w-4 h-4" />
                Exportar
              </SiriusButton>
            </div>
          </div>
        </motion.div>

        {/* Información de la Quincena */}
        {quincenaSeleccionada && (
          <motion.div
            className="bg-white rounded-3xl p-6 shadow-lg border-2 border-gray-300 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {formatearNombreQuincena(quincenaSeleccionada)}
              </h2>
              {statsQuincena && (
                <div className="flex items-center gap-4 text-sm">
                  <span className={`px-3 py-1 rounded-full font-bold ${
                    statsQuincena.estaActiva ? 'bg-green-100 text-green-800' :
                    statsQuincena.yaTermino ? 'bg-gray-100 text-gray-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {statsQuincena.estaActiva ? '🟢 Activa' :
                     statsQuincena.yaTermino ? '✅ Completada' :
                     '⏳ Próxima'}
                  </span>
                  <span className="text-gray-600">
                    {statsQuincena.diasTranscurridos} de {statsQuincena.diasTotales} días
                  </span>
                  <span className="text-gray-600">
                    ({statsQuincena.diasLaborales} días laborales)
                  </span>
                </div>
              )}
            </div>
            
            {/* Progreso de la quincena */}
            {statsQuincena && (
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div 
                  className="bg-gradient-to-r from-sirius-green-main to-sirius-green-dark h-2 rounded-full transition-all duration-500"
                  style={{ width: `${statsQuincena.porcentajeCompleto}%` }}
                />
              </div>
            )}
          </motion.div>
        )}

        {/* Estadísticas Generales */}
        {reporteQuincena && (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <div className="bg-white rounded-2xl p-4 shadow-lg border-2 border-gray-300">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-sirius-green-main/20 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-sirius-green-main" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">Empleados Activos</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {reporteQuincena.empleadosActivos}/{reporteQuincena.totalEmpleados}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-lg border-2 border-gray-300">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-sirius-sky-main/20 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-sirius-sky-main" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">Horas del Equipo</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {reporteQuincena.totalHorasEquipo.toFixed(1)}h
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-lg border-2 border-gray-300">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-sirius-sun-main/20 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-sirius-sun-main" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">Nómina Quincena</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${reporteQuincena.totalPagoEquipo.toLocaleString('es-CO')}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-lg border-2 border-gray-300">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-sirius-earth-main/20 rounded-lg flex items-center justify-center">
                  <Award className="w-5 h-5 text-sirius-earth-main" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">Pausas Activas</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {reporteQuincena.totalPausasActivas}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Estadísticas por Departamento */}
        {reporteQuincena && Object.keys(reporteQuincena.estatsPorDepartamento).length > 0 && (
          <motion.div
            className="bg-white rounded-3xl p-6 shadow-lg border-2 border-gray-300 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-sirius-green-main" />
              Estadísticas por Departamento
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(reporteQuincena.estatsPorDepartamento).map(([dept, stats]) => (
                <div key={dept} className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
                  <h4 className="font-bold text-gray-900 mb-2">{dept}</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-700">Empleados:</span>
                      <span className="font-bold text-gray-900">{stats.empleadosActivos}/{stats.empleados}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Horas:</span>
                      <span className="font-bold text-gray-900">{stats.totalHoras.toFixed(1)}h</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Nómina:</span>
                      <span className="font-bold text-gray-900">${stats.totalPago.toLocaleString('es-CO')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Lista de Empleados */}
        {reporteQuincena && (
          <motion.div
            className="bg-white rounded-3xl p-6 shadow-lg border-2 border-gray-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                Detalle por Empleado ({empleadosFiltrados.length})
              </h3>
              
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-700" />
                <select
                  value={filtroDepto}
                  onChange={(e) => setFiltroDepto(e.target.value)}
                  className="px-3 py-2 rounded-xl border-2 border-gray-300 focus:border-sirius-green-main focus:ring-4 focus:ring-sirius-green-light/30 transition-all duration-300 bg-white text-gray-900"
                >
                  <option value="all">Todos los departamentos</option>
                  {departamentos.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-4">
              {empleadosFiltrados.map((empleado) => (
                <motion.div
                  key={empleado.empleado.id}
                  className="bg-gray-50 rounded-2xl p-4 border-2 border-gray-200"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-sirius-green-main to-sirius-green-dark rounded-full flex items-center justify-center text-white font-bold">
                        {empleado.empleado.nombre.charAt(0)}
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-3">
                          <h4 className="text-lg font-bold text-gray-900">
                            {empleado.empleado.nombre} {empleado.empleado.apodo && `(${empleado.empleado.apodo})`}
                          </h4>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full">
                            {empleado.empleado.departamento}
                          </span>
                        </div>
                        <p className="text-gray-700 text-sm font-medium">
                          {empleado.empleado.cargo} • {empleado.empleado.cedula}
                        </p>
                      </div>
                    </div>
                    
                    <SiriusButton
                      onClick={() => setMostrarDetalle(mostrarDetalle === empleado.empleado.id ? null : empleado.empleado.id)}
                      variant="secondary"
                      size="sm"
                      className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800"
                    >
                      <Eye className="w-4 h-4" />
                      Ver detalle
                    </SiriusButton>
                  </div>
                  
                  {/* Resumen rápido */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
                    <div className="text-center bg-white rounded-xl p-3 border border-gray-300">
                      <p className="text-xs font-bold text-gray-800">Total Horas</p>
                      <p className="text-xl font-bold text-gray-900">{empleado.totalHoras.toFixed(1)}h</p>
                    </div>
                    
                    <div className="text-center bg-green-50 rounded-xl p-3 border border-green-300">
                      <p className="text-xs font-bold text-green-800">Ordinarias</p>
                      <p className="text-xl font-bold text-green-900">{empleado.horasOrdinarias.toFixed(1)}h</p>
                    </div>
                    
                    <div className="text-center bg-blue-50 rounded-xl p-3 border border-blue-300">
                      <p className="text-xs font-bold text-blue-800">Extras</p>
                      <p className="text-xl font-bold text-blue-900">{empleado.horasExtras.toFixed(1)}h</p>
                    </div>
                    
                    <div className="text-center bg-purple-50 rounded-xl p-3 border border-purple-300">
                      <p className="text-xs font-bold text-purple-800">Días Trabajados</p>
                      <p className="text-xl font-bold text-purple-900">{empleado.diasTrabajados}</p>
                    </div>
                    
                    <div className="text-center bg-yellow-50 rounded-xl p-3 border border-yellow-400">
                      <p className="text-xs font-bold text-yellow-800">Total Nómina</p>
                      <p className="text-xl font-bold text-yellow-900">${empleado.totalPago.toLocaleString('es-CO')}</p>
                    </div>
                  </div>
                  
                  {/* Detalle expandible */}
                  {mostrarDetalle === empleado.empleado.id && (
                    <motion.div
                      className="mt-4 p-4 bg-white rounded-xl border border-gray-300"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ duration: 0.3 }}
                    >
                      <h5 className="font-bold text-gray-900 mb-3">Desglose Detallado</h5>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-700 font-medium">Horas Nocturnas:</p>
                          <p className="font-bold text-gray-900">{empleado.horasNocturnas.toFixed(1)}h</p>
                        </div>
                        <div>
                          <p className="text-gray-700 font-medium">Horas Dominicales:</p>
                          <p className="font-bold text-gray-900">{empleado.horasDominicales.toFixed(1)}h</p>
                        </div>
                        <div>
                          <p className="text-gray-700 font-medium">Horas Festivas:</p>
                          <p className="font-bold text-gray-900">{empleado.horasFestivas.toFixed(1)}h</p>
                        </div>
                        <div>
                          <p className="text-gray-700 font-medium">Pausas Activas:</p>
                          <p className="font-bold text-gray-900">{empleado.pausasActivas}</p>
                        </div>
                      </div>
                      
                      <div className="mt-4 p-3 bg-green-100 rounded-lg">
                        <p className="text-sm text-green-800 font-medium">
                          <strong>Promedio diario:</strong> {empleado.diasTrabajados > 0 ? (empleado.totalHoras / empleado.diasTrabajados).toFixed(1) : '0'}h/día
                        </p>
                        <p className="text-sm text-green-800 font-medium">
                          <strong>Pago promedio:</strong> ${empleado.diasTrabajados > 0 ? (empleado.totalPago / empleado.diasTrabajados).toLocaleString('es-CO') : '0'}/día
                        </p>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
} 