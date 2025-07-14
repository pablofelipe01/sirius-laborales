'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { SiriusButton } from '@/components/ui/SiriusButton'
import { SiriusDB } from '@/lib/supabase'
import { getTodayLocal, formatTimeInColombia } from '@/lib/utils'
import { 
  Clock, 
  ArrowLeft,
  DollarSign,
  TrendingUp,
  Users,
  Download,
  Filter,
  Search,
  Calendar,
  Eye,
  AlertCircle
} from 'lucide-react'

// Interface para empleados activos
interface EmpleadoActivo {
  id: string;
  nombre: string;
  apodo: string;
  cedula: string;
  cargo: string;
  salario_hora: number;
  estado: string;
  horasHoy: number;
  horasOrdinarias: number;
  horasExtras: number;
  horasNocturnas: number;
  horasSemanales: number;
  pagoTotal: number;
  ultimaActividad: string;
  alertas: string[];
  registros_del_dia?: {
    entrada?: { timestamp: string };
    inicio_almuerzo?: { timestamp: string };
    fin_almuerzo?: { timestamp: string };
    salida?: { timestamp: string };
  };
}

export default function ControlHorasAdmin() {
  const { employee } = useAuth()
  const router = useRouter()
  
  const [empleadosActivos, setEmpleadosActivos] = useState<EmpleadoActivo[]>([])
  const [loading, setLoading] = useState(true)
  const [mostrarDetalle, setMostrarDetalle] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState(getTodayLocal())
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

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

    loadEmpleadosActivos()
  }, [employee, router, selectedDate])

  const loadEmpleadosActivos = async () => {
    try {
      setLoading(true)
      
      // Obtener datos reales de la base de datos
      const empleadosData = await SiriusDB.getAllEmployeesWithStats(selectedDate)
      
      // Formatear los datos para el componente
      const empleadosFormateados: EmpleadoActivo[] = empleadosData.map((emp) => ({
        id: emp.id,
        nombre: emp.nombre,
        apodo: emp.apodo || '',
        cedula: emp.cedula,
        cargo: 'Empleado',
        salario_hora: emp.salario || 15000,
        estado: emp.estado || 'Ausente',
        horasHoy: emp.total_horas || 0,
        horasOrdinarias: emp.horas_ordinarias || 0,
        horasExtras: (emp.horas_extra_diurnas || 0) + (emp.horas_extra_nocturnas || 0),
        horasNocturnas: emp.horas_nocturnas || 0,
        horasSemanales: emp.horas_semanales || 0,
        pagoTotal: emp.total_pago || 0,
        ultimaActividad: emp.ultimo_acceso || new Date().toISOString(),
        alertas: [],
        registros_del_dia: emp.registros_del_dia
      }))
      
      setEmpleadosActivos(empleadosFormateados)
    } catch (error) {
      console.error('Error loading empleados activos:', error)
      
      // Si hay error, mostrar mensaje pero no datos dummy
      setEmpleadosActivos([])
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'Trabajando':
        return 'bg-green-100 text-green-900 border-green-400'
      case 'En almuerzo':
        return 'bg-orange-100 text-orange-900 border-orange-400'
      case 'En pausa activa':
        return 'bg-blue-100 text-blue-900 border-blue-400'
      case 'Terminado':
        return 'bg-gray-100 text-gray-900 border-gray-400'
      case 'Ausente':
        return 'bg-red-100 text-red-900 border-red-400'
      default:
        return 'bg-gray-100 text-gray-900 border-gray-400'
    }
  }

  const filteredEmployees = empleadosActivos.filter(emp => {
    const matchesSearch = emp.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.apodo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.cedula.includes(searchTerm)
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'working' && emp.estado === 'Trabajando') ||
                         (statusFilter === 'break' && (emp.estado === 'En pausa activa' || emp.estado === 'En almuerzo')) ||
                         (statusFilter === 'finished' && emp.estado === 'Terminado') ||
                         (statusFilter === 'absent' && emp.estado === 'Ausente')
    
    return matchesSearch && matchesStatus
  })

  // Estadísticas calculadas
  const summaryCards = [
    {
      title: 'Empleados',
      value: `${empleadosActivos.filter(e => e.estado !== 'Ausente').length}/${empleadosActivos.length}`,
      icon: <Users className="w-6 h-6 text-sirius-green-main" />,
      bgColor: 'bg-sirius-green-main/20'
    },
    {
      title: 'Horas del Equipo',
      value: `${empleadosActivos.reduce((sum, e) => sum + e.horasHoy, 0).toFixed(1)}h`,
      icon: <Clock className="w-6 h-6 text-sirius-sky-main" />,
      bgColor: 'bg-sirius-sky-main/20'
    },
    {
      title: 'Pago del Día',
      value: `$${empleadosActivos.reduce((sum, e) => sum + e.pagoTotal, 0).toLocaleString('es-CO')}`,
      icon: <DollarSign className="w-6 h-6 text-sirius-sun-main" />,
      bgColor: 'bg-sirius-sun-main/20'
    },
    {
      title: 'Alertas',
      value: empleadosActivos.reduce((sum, e) => sum + e.alertas.length, 0).toString(),
      icon: <AlertCircle className="w-6 h-6 text-orange-500" />,
      bgColor: 'bg-orange-100'
    },
    {
      title: 'Eficiencia',
      value: '94%',
      icon: <TrendingUp className="w-6 h-6 text-sirius-earth-main" />,
      bgColor: 'bg-sirius-earth-main/20'
    }
  ]

  const exportData = () => {
    // Función para exportar datos
    console.log('Exportando datos...')
    alert('Función de exportación en desarrollo')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-starry-night flex items-center justify-center">
        <div className="text-center">
          <motion.div
            className="w-16 h-16 border-4 border-sirius-green-main border-t-transparent rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-sirius-green-main">Cargando control de horas...</p>
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

      {/* Contenido principal con mejor contraste */}
      <div className="relative z-10 p-4 max-w-7xl mx-auto">
        {/* Header con mejor contraste */}
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
                <div className="w-12 h-12 bg-gradient-to-r from-sirius-sky-main to-sirius-sky-dark rounded-full flex items-center justify-center shadow-lg">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Control de Horas ⏰
                  </h1>
                  <p className="text-gray-700 font-medium">
                    Gestión completa de jornadas laborales
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-700" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-2 rounded-xl border-2 border-gray-300 focus:border-sirius-sky-main focus:ring-4 focus:ring-sirius-sky-light/30 transition-all duration-300 bg-white text-gray-900"
                />
              </div>
              <SiriusButton
                onClick={exportData}
                variant="primary"
                size="sm"
                className="flex items-center gap-2 bg-sirius-sky-main hover:bg-sirius-sky-dark text-white"
              >
                <Download className="w-4 h-4" />
                Exportar
              </SiriusButton>
            </div>
          </div>
        </motion.div>

        {/* Resumen con mejor contraste */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          {summaryCards.map((card, index) => (
            <div key={index} className="bg-white rounded-2xl p-4 shadow-lg border-2 border-gray-300">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-full shadow-sm ${card.bgColor}`}>
                  {card.icon}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Filtros con mejor contraste */}
        <motion.div
          className="bg-white rounded-2xl p-4 shadow-lg border-2 border-gray-300 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-700" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border-2 border-gray-300 focus:border-sirius-sky-main focus:ring-4 focus:ring-sirius-sky-light/30 transition-all duration-300 bg-white text-gray-900"
                >
                  <option value="all">Todos los estados</option>
                  <option value="working">Trabajando</option>
                  <option value="break">En pausa/Almuerzo</option>
                  <option value="finished">Terminado</option>
                  <option value="absent">Ausente</option>
                </select>
              </div>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por nombre, apodo o cédula..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-xl border-2 border-gray-300 focus:border-sirius-sky-main focus:ring-4 focus:ring-sirius-sky-light/30 transition-all duration-300 bg-white text-gray-900 min-w-[300px]"
              />
            </div>
          </div>
        </motion.div>

        {/* Lista de empleados con mejor contraste */}
        <div className="space-y-4">
          {filteredEmployees.map((empleado, index) => (
            <motion.div
              key={empleado.id}
              className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-300 hover:shadow-xl transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.6 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-sirius-green-main to-sirius-green-dark rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white text-xl font-bold">
                      {empleado.apodo?.charAt(0) || empleado.nombre.charAt(0)}
                    </span>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-bold text-gray-900">
                        {empleado.nombre} {empleado.apodo && `(${empleado.apodo})`}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-bold border-2 ${getStatusColor(empleado.estado)}`}>
                        {empleado.estado}
                      </span>
                    </div>
                    <p className="text-gray-700 font-medium">
                      Empleado • {empleado.cedula} • ${empleado.salario_hora.toLocaleString('es-CO')}/hora
                    </p>
                  </div>
                </div>
                
                <SiriusButton
                  onClick={() => setMostrarDetalle(mostrarDetalle === empleado.id ? null : empleado.id)}
                  variant="secondary"
                  size="sm"
                  className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800"
                >
                  <Eye className="w-4 h-4" />
                  Ver detalle
                </SiriusButton>
              </div>
              
              {/* Estadísticas de horas con mejor contraste */}
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mt-6">
                <div className="text-center bg-white rounded-xl p-3 border-2 border-gray-300 shadow-sm">
                  <p className="text-sm font-bold text-gray-800">Horas Hoy</p>
                  <p className="text-2xl font-bold text-gray-900">{empleado.horasHoy.toFixed(1)}h</p>
                </div>
                
                <div className="text-center bg-green-50 rounded-xl p-3 border-2 border-green-300 shadow-sm">
                  <p className="text-sm font-bold text-green-800">Ordinarias</p>
                  <p className="text-2xl font-bold text-green-900">{empleado.horasOrdinarias.toFixed(1)}h</p>
                </div>
                
                <div className="text-center bg-blue-50 rounded-xl p-3 border-2 border-blue-300 shadow-sm">
                  <p className="text-sm font-bold text-blue-800">Extras</p>
                  <p className="text-2xl font-bold text-blue-900">{(empleado.horasExtras + empleado.horasNocturnas).toFixed(1)}h</p>
                </div>
                
                <div className="text-center bg-orange-50 rounded-xl p-3 border-2 border-orange-300 shadow-sm">
                  <p className="text-sm font-bold text-orange-800">Nocturnas</p>
                  <p className="text-2xl font-bold text-orange-900">{empleado.horasNocturnas.toFixed(1)}h</p>
                </div>
                
                <div className="text-center bg-purple-50 rounded-xl p-3 border-2 border-purple-300 shadow-sm">
                  <p className="text-sm font-bold text-purple-800">Semanales</p>
                  <p className="text-2xl font-bold text-purple-900">{empleado.horasSemanales.toFixed(1)}h</p>
                </div>
                
                <div className="text-center bg-yellow-50 rounded-xl p-3 border-2 border-yellow-400 shadow-sm">
                  <p className="text-sm font-bold text-yellow-800">Pago Total</p>
                  <p className="text-2xl font-bold text-yellow-900">${empleado.pagoTotal.toLocaleString('es-CO')}</p>
                </div>
              </div>
              
              {/* Detalles expandibles con contraste corregido */}
              {mostrarDetalle === empleado.id && (
                <motion.div
                  className="mt-6 space-y-4"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Registros del día */}
                  <div className="bg-white rounded-xl p-4 border-2 border-gray-300 shadow-sm">
                    <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-gray-700" />
                      Registros del Día
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div className="bg-green-100 p-3 rounded-lg border-2 border-green-300">
                        <p className="text-xs font-bold text-green-800">Entrada</p>
                        <p className="text-lg font-bold text-green-900">
                          {empleado.registros_del_dia?.entrada 
                            ? formatTimeInColombia(empleado.registros_del_dia.entrada.timestamp)
                            : '-- : --'
                          }
                        </p>
                      </div>
                      <div className="bg-yellow-100 p-3 rounded-lg border-2 border-yellow-300">
                        <p className="text-xs font-bold text-yellow-800">Inicio Almuerzo</p>
                        <p className="text-lg font-bold text-yellow-900">
                          {empleado.registros_del_dia?.inicio_almuerzo 
                            ? formatTimeInColombia(empleado.registros_del_dia.inicio_almuerzo.timestamp)
                            : '-- : --'
                          }
                        </p>
                      </div>
                      <div className="bg-yellow-100 p-3 rounded-lg border-2 border-yellow-300">
                        <p className="text-xs font-bold text-yellow-800">Fin Almuerzo</p>
                        <p className="text-lg font-bold text-yellow-900">
                          {empleado.registros_del_dia?.fin_almuerzo 
                            ? formatTimeInColombia(empleado.registros_del_dia.fin_almuerzo.timestamp)
                            : '-- : --'
                          }
                        </p>
                      </div>
                      <div className="bg-blue-100 p-3 rounded-lg border-2 border-blue-300">
                        <p className="text-xs font-bold text-blue-800">Salida</p>
                        <p className="text-lg font-bold text-blue-900">
                          {empleado.registros_del_dia?.salida 
                            ? formatTimeInColombia(empleado.registros_del_dia.salida.timestamp)
                            : '-- : --'
                          }
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Desglose de pagos */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-xl p-4 border-2 border-gray-300 shadow-sm">
                      <h5 className="font-bold text-gray-900 mb-3">Horas Base</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-800">Ordinarias diurnas:</span>
                          <span className="font-bold text-gray-900">{empleado.horasOrdinarias.toFixed(1)}h × ${empleado.salario_hora.toLocaleString('es-CO')} = ${(empleado.horasOrdinarias * empleado.salario_hora).toLocaleString('es-CO')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-800">Recargo nocturno (+35%):</span>
                          <span className="font-bold text-gray-900">{empleado.horasNocturnas.toFixed(1)}h = ${(empleado.horasNocturnas * empleado.salario_hora * 1.35).toLocaleString('es-CO')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-4 border-2 border-gray-300 shadow-sm">
                      <h5 className="font-bold text-gray-900 mb-3">Horas Extra</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-800">Extra diurnas (+25%):</span>
                          <span className="font-bold text-gray-900">{empleado.horasExtras.toFixed(1)}h = ${(empleado.horasExtras * empleado.salario_hora * 1.25).toLocaleString('es-CO')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-800">Extra nocturnas (+75%):</span>
                          <span className="font-bold text-gray-900">{empleado.horasNocturnas.toFixed(1)}h = ${(empleado.horasNocturnas * empleado.salario_hora * 1.75).toLocaleString('es-CO')}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-xl p-4 border-2 border-gray-300 shadow-sm">
                      <h5 className="font-bold text-gray-900 mb-3">Dominicales/Festivos</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-800">Dominical diurno (+100%):</span>
                          <span className="font-bold text-gray-900">0h = $0</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-800">Dominical nocturno (+150%):</span>
                          <span className="font-bold text-gray-900">0h = $0</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-800">Festivo diurno (+100%):</span>
                          <span className="font-bold text-gray-900">0h = $0</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-800">Festivo nocturno (+150%):</span>
                          <span className="font-bold text-gray-900">0h = $0</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-100 rounded-xl p-4 border-2 border-green-400 shadow-sm">
                      <h5 className="font-bold text-green-900 mb-3">Total a Pagar</h5>
                      <div className="text-center">
                        <p className="text-3xl font-bold text-green-900">
                          ${empleado.pagoTotal.toLocaleString('es-CO')}
                        </p>
                        <p className="text-sm text-green-800 mt-1 font-medium">
                          {empleado.horasHoy.toFixed(1)} horas trabajadas
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Alertas si las hay */}
                  {empleado.alertas.length > 0 && (
                    <div className="bg-orange-100 rounded-xl p-4 border-2 border-orange-400 shadow-sm">
                      <h5 className="font-bold text-orange-900 mb-2 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        Alertas
                      </h5>
                      <ul className="space-y-1">
                        {empleado.alertas.map((alerta, idx) => (
                          <li key={idx} className="text-sm text-orange-800 font-medium">
                            • {alerta}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {filteredEmployees.length === 0 && (
          <motion.div
            className="bg-white rounded-2xl p-12 shadow-lg border-2 border-gray-300 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              No se encontraron empleados
            </h3>
            <p className="text-gray-600 font-medium">
              {searchTerm || statusFilter !== 'all' 
                ? 'Intenta ajustar los filtros de búsqueda' 
                : 'No hay registros para la fecha seleccionada'}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
} 