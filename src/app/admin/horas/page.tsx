'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { SiriusButton } from '@/components/ui/SiriusButton'
import { calculateHoursBreakdown, getTotalPay, HoursBreakdown } from '@/lib/calculations'
import { getAllHolidays } from '@/lib/holidays'
import { SiriusDB } from '@/lib/supabase'
import { 
  Clock, 
  ArrowLeft,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  Users,
  Download,
  Filter,
  Search
} from 'lucide-react'

interface EmpleadoHoras {
  id: string
  nombre: string
  apodo: string
  cedula: string
  cargo: string
  salarioHora: number
  estado: 'activo' | 'almuerzo' | 'terminado' | 'ausente'
  horasHoy: HoursBreakdown
  totalPago: number
  horasSemanales: number
  alertas: string[]
  registros: {
    entrada?: string
    inicioAlmuerzo?: string
    finAlmuerzo?: string
    salida?: string
  }
}

export default function ControlHorasAdmin() {
  const { employee } = useAuth()
  const router = useRouter()
  
  const [empleados, setEmpleados] = useState<EmpleadoHoras[]>([])
  const [filtroEstado, setFiltroEstado] = useState<string>('todos')
  const [busqueda, setBusqueda] = useState('')
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date().toISOString().split('T')[0])
  const [isLoading, setIsLoading] = useState(true)
  const [mostrarDetalle, setMostrarDetalle] = useState<string | null>(null)

  // Verificar permisos de admin
  useEffect(() => {
    if (!employee || employee.cedula !== '123456789') {
      router.replace('/admin')
      return
    }
    loadEmpleadosData()
  }, [employee, router, fechaSeleccionada])

  const loadEmpleadosData = async () => {
    try {
      setIsLoading(true)
      
      // Cargar empleados con estadísticas reales de la base de datos
      const empleadosData = await SiriusDB.getAllEmployeesWithStats(fechaSeleccionada)
      const festivos = getAllHolidays().map(h => h.fecha)
      
      // Transformar datos de la BD al formato esperado por la interfaz
      const empleadosFormateados: EmpleadoHoras[] = await Promise.all(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        empleadosData.map(async (emp: any) => {
          // Obtener registros del día para determinar estado y horarios
          const registros = await SiriusDB.getTodayRecords(emp.id)
          const entrada = registros.find(r => r.tipo === 'entrada')
          const salida = registros.find(r => r.tipo === 'salida')
          const inicioAlmuerzo = registros.find(r => r.tipo === 'inicio_almuerzo')
          const finAlmuerzo = registros.find(r => r.tipo === 'fin_almuerzo')
          const ultimoRegistro = registros[registros.length - 1]
          
          // Determinar estado actual
          let estado: 'activo' | 'almuerzo' | 'terminado' | 'ausente' = 'ausente'
          if (ultimoRegistro) {
            switch (ultimoRegistro.tipo) {
              case 'entrada':
              case 'fin_almuerzo':
              case 'fin_pausa_activa':
                estado = 'activo'
                break
              case 'inicio_almuerzo':
                estado = 'almuerzo'
                break
              case 'salida':
                estado = 'terminado'
                break
            }
          }
          
          // Calcular desglose de horas si hay registros
          let horasHoy: HoursBreakdown = {
            ordinarias: 0, extraDiurnas: 0, extraNocturnas: 0, nocturnas: 0,
            dominicalesDiurnas: 0, dominicalesNocturnas: 0, festivasDiurnas: 0, festivasNocturnas: 0,
            totalHoras: 0, salarioBase: 0, recargoNocturno: 0, recargoDominical: 0, recargoFestivo: 0,
            extraDiurna: 0, extraNocturna: 0, extraDominicalDiurna: 0, extraDominicalNocturna: 0,
            extraFestivaDiurna: 0, extraFestivaNocturna: 0
          }
          
          if (entrada) {
            const workPeriod = {
              entrada: new Date(entrada.timestamp),
              salida: salida ? new Date(salida.timestamp) : new Date(),
              almuerzo: inicioAlmuerzo && finAlmuerzo ? {
                inicio: new Date(inicioAlmuerzo.timestamp),
                fin: new Date(finAlmuerzo.timestamp)
              } : undefined
            }
            
            horasHoy = calculateHoursBreakdown(workPeriod, emp.salario_hora || 5000, festivos)
          }
          
          return {
            id: emp.id,
            nombre: emp.nombre,
            apodo: emp.apodo || emp.nombre,
            cedula: emp.cedula,
            cargo: emp.cargo || 'Sin cargo',
            salarioHora: emp.salario_hora || 5000,
            estado,
            horasHoy,
            totalPago: getTotalPay(horasHoy),
            horasSemanales: 0, // TODO: Calcular horas semanales
            alertas: [],
            registros: {
              entrada: entrada ? new Date(entrada.timestamp).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }) : undefined,
              inicioAlmuerzo: inicioAlmuerzo ? new Date(inicioAlmuerzo.timestamp).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }) : undefined,
              finAlmuerzo: finAlmuerzo ? new Date(finAlmuerzo.timestamp).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }) : undefined,
              salida: salida ? new Date(salida.timestamp).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }) : undefined,
            }
          }
        })
      )

      setEmpleados(empleadosFormateados)
      
    } catch (error) {
      console.error('Error cargando datos de empleados:', error)
      setEmpleados([])
    } finally {
      setIsLoading(false)
    }
  }

  const empleadosFiltrados = empleados.filter(emp => {
    const cumpleFiltro = filtroEstado === 'todos' || emp.estado === filtroEstado
    const cumpleBusqueda = emp.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                          emp.apodo.toLowerCase().includes(busqueda.toLowerCase()) ||
                          emp.cedula.includes(busqueda)
    return cumpleFiltro && cumpleBusqueda
  })

  const estadisticasDelDia = {
    totalEmpleados: empleados.length,
    empleadosActivos: empleados.filter(e => e.estado === 'activo').length,
    horasTotales: empleados.reduce((acc, emp) => acc + emp.horasHoy.totalHoras, 0),
    pagoTotal: empleados.reduce((acc, emp) => acc + emp.totalPago, 0),
    alertas: empleados.reduce((acc, emp) => acc + emp.alertas.length, 0)
  }

  const getEstadoColor = (estado: string) => {
    const colores = {
      activo: 'bg-green-100 text-green-800 border-green-200',
      almuerzo: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      terminado: 'bg-blue-100 text-blue-800 border-blue-200',
      ausente: 'bg-gray-100 text-gray-800 border-gray-200'
    }
    return colores[estado as keyof typeof colores] || colores.ausente
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const exportarReporte = () => {
    // TODO: Implementar exportación a Excel/PDF
    console.log('Exportando reporte del día', fechaSeleccionada)
  }

  if (isLoading) {
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
    <div className="min-h-screen bg-starry-night p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          className="bg-white/95 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-white/30"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <SiriusButton
                variant="secondary"
                onClick={() => router.push('/admin')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Panel Admin
              </SiriusButton>
              
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-sirius-sky-main to-sirius-sky-light rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">
                    Control de Horas ⏰
                  </h1>
                  <p className="text-gray-600">
                    Gestión completa de jornadas laborales
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <input
                type="date"
                value={fechaSeleccionada}
                onChange={(e) => setFechaSeleccionada(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sirius-sky-main focus:border-transparent"
              />
              <SiriusButton
                variant="secondary"
                onClick={exportarReporte}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Exportar
              </SiriusButton>
            </div>
          </div>
        </motion.div>

        {/* Estadísticas del día */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-5 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 border border-white/30">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-sirius-green-main" />
              <div>
                <p className="text-sm text-gray-600">Empleados</p>
                <p className="text-xl font-bold">{estadisticasDelDia.empleadosActivos}/{estadisticasDelDia.totalEmpleados}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 border border-white/30">
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6 text-sirius-sky-main" />
              <div>
                <p className="text-sm text-gray-600">Horas Totales</p>
                <p className="text-xl font-bold">{estadisticasDelDia.horasTotales.toFixed(1)}h</p>
              </div>
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 border border-white/30">
            <div className="flex items-center gap-3">
              <DollarSign className="w-6 h-6 text-sirius-sun-main" />
              <div>
                <p className="text-sm text-gray-600">Pago del Día</p>
                <p className="text-lg font-bold">{formatCurrency(estadisticasDelDia.pagoTotal)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 border border-white/30">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">Alertas</p>
                <p className="text-xl font-bold">{estadisticasDelDia.alertas}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 border border-white/30">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-sirius-earth-main" />
              <div>
                <p className="text-sm text-gray-600">Eficiencia</p>
                <p className="text-xl font-bold">94%</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filtros y búsqueda */}
        <motion.div
          className="bg-white/95 backdrop-blur-md rounded-2xl p-4 border border-white/30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sirius-sky-main"
              >
                <option value="todos">Todos los estados</option>
                <option value="activo">Activos</option>
                <option value="almuerzo">En almuerzo</option>
                <option value="terminado">Terminados</option>
                <option value="ausente">Ausentes</option>
              </select>
            </div>

            <div className="flex items-center gap-2 flex-1 max-w-md">
              <Search className="w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Buscar por nombre, apodo o cédula..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sirius-sky-main focus:border-transparent"
              />
            </div>
          </div>
        </motion.div>

        {/* Lista de empleados */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          {empleadosFiltrados.map((empleado, index) => (
            <motion.div
              key={empleado.id}
              className="bg-white/95 backdrop-blur-md rounded-2xl border border-white/30 overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.6 }}
            >
              {/* Header del empleado */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-sirius-green-main to-sirius-green-light rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">
                        {empleado.apodo.charAt(0)}
                      </span>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {empleado.nombre} ({empleado.apodo})
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <span>{empleado.cargo}</span>
                        <span>•</span>
                        <span>{empleado.cedula}</span>
                        <span>•</span>
                        <span>{formatCurrency(empleado.salarioHora)}/hora</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getEstadoColor(empleado.estado)}`}>
                      {empleado.estado}
                    </span>
                    
                    {empleado.alertas.length > 0 && (
                      <div className="flex items-center gap-1 text-orange-500">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="text-xs">{empleado.alertas.length}</span>
                      </div>
                    )}

                    <SiriusButton
                      variant="secondary"
                      size="sm"
                      onClick={() => setMostrarDetalle(mostrarDetalle === empleado.id ? null : empleado.id)}
                    >
                      {mostrarDetalle === empleado.id ? 'Ocultar' : 'Ver detalle'}
                    </SiriusButton>
                  </div>
                </div>
              </div>

              {/* Resumen rápido */}
              <div className="p-4 bg-gray-50/50">
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Horas Hoy</p>
                    <p className="font-bold text-gray-800">{empleado.horasHoy.totalHoras.toFixed(1)}h</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Ordinarias</p>
                    <p className="font-bold text-sirius-green-dark">{empleado.horasHoy.ordinarias.toFixed(1)}h</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Extras</p>
                    <p className="font-bold text-sirius-sky-dark">{(empleado.horasHoy.extraDiurnas + empleado.horasHoy.extraNocturnas).toFixed(1)}h</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Nocturnas</p>
                    <p className="font-bold text-sirius-earth-dark">{empleado.horasHoy.nocturnas.toFixed(1)}h</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Semanales</p>
                    <p className="font-bold text-gray-600">{empleado.horasSemanales.toFixed(1)}h</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Pago Total</p>
                    <p className="font-bold text-sirius-sun-dark">{formatCurrency(empleado.totalPago)}</p>
                  </div>
                </div>
              </div>

              {/* Detalle expandible */}
              {mostrarDetalle === empleado.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border-t border-gray-100"
                >
                  <div className="p-6 space-y-6">
                    {/* Registros de tiempo */}
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Registros del Día
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                          <p className="text-xs text-green-600 font-medium">Entrada</p>
                          <p className="text-lg font-bold text-green-800">
                            {empleado.registros.entrada || '--:--'}
                          </p>
                        </div>
                        <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                          <p className="text-xs text-yellow-600 font-medium">Inicio Almuerzo</p>
                          <p className="text-lg font-bold text-yellow-800">
                            {empleado.registros.inicioAlmuerzo || '--:--'}
                          </p>
                        </div>
                        <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                          <p className="text-xs text-yellow-600 font-medium">Fin Almuerzo</p>
                          <p className="text-lg font-bold text-yellow-800">
                            {empleado.registros.finAlmuerzo || '--:--'}
                          </p>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                          <p className="text-xs text-blue-600 font-medium">Salida</p>
                          <p className="text-lg font-bold text-blue-800">
                            {empleado.registros.salida || '--:--'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Desglose de horas y pagos */}
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Desglose de Pagos (Legislación Colombiana)
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Horas base */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h5 className="font-medium text-gray-700 mb-3">Horas Base</h5>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Ordinarias diurnas:</span>
                              <span className="font-medium">{empleado.horasHoy.ordinarias.toFixed(1)}h × {formatCurrency(empleado.salarioHora)} = {formatCurrency(empleado.horasHoy.salarioBase)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Recargo nocturno (+35%):</span>
                              <span className="font-medium">{empleado.horasHoy.nocturnas.toFixed(1)}h = {formatCurrency(empleado.horasHoy.recargoNocturno)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Horas extra */}
                        <div className="bg-sirius-sky-main/10 p-4 rounded-lg">
                          <h5 className="font-medium text-gray-700 mb-3">Horas Extra</h5>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Extra diurnas (+25%):</span>
                              <span className="font-medium">{empleado.horasHoy.extraDiurnas.toFixed(1)}h = {formatCurrency(empleado.horasHoy.extraDiurna)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Extra nocturnas (+75%):</span>
                              <span className="font-medium">{empleado.horasHoy.extraNocturnas.toFixed(1)}h = {formatCurrency(empleado.horasHoy.extraNocturna)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Dominicales/Festivos */}
                        <div className="bg-sirius-sun-main/10 p-4 rounded-lg">
                          <h5 className="font-medium text-gray-700 mb-3">Dominicales/Festivos</h5>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Dominical diurno (+100%):</span>
                              <span className="font-medium">{empleado.horasHoy.dominicalesDiurnas.toFixed(1)}h = {formatCurrency(empleado.horasHoy.extraDominicalDiurna)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Dominical nocturno (+150%):</span>
                              <span className="font-medium">{empleado.horasHoy.dominicalesNocturnas.toFixed(1)}h = {formatCurrency(empleado.horasHoy.extraDominicalNocturna)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Festivo diurno (+100%):</span>
                              <span className="font-medium">{empleado.horasHoy.festivasDiurnas.toFixed(1)}h = {formatCurrency(empleado.horasHoy.extraFestivaDiurna)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Festivo nocturno (+150%):</span>
                              <span className="font-medium">{empleado.horasHoy.festivasNocturnas.toFixed(1)}h = {formatCurrency(empleado.horasHoy.extraFestivaNocturna)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Total */}
                        <div className="bg-sirius-green-main/10 p-4 rounded-lg">
                          <h5 className="font-medium text-gray-700 mb-3">Total a Pagar</h5>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-sirius-green-dark">
                              {formatCurrency(empleado.totalPago)}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {empleado.horasHoy.totalHoras.toFixed(1)} horas trabajadas
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Alertas */}
                    {empleado.alertas.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-orange-500" />
                          Alertas y Avisos
                        </h4>
                        <div className="space-y-2">
                          {empleado.alertas.map((alerta, idx) => (
                            <div key={idx} className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-orange-800">
                              {alerta}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </motion.div>

        {empleadosFiltrados.length === 0 && (
          <motion.div
            className="bg-white/95 backdrop-blur-md rounded-2xl p-8 text-center border border-white/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No se encontraron empleados con los filtros aplicados</p>
            <p className="text-sm text-gray-500 mt-1">Intenta cambiar los filtros de búsqueda</p>
          </motion.div>
        )}
      </div>
    </div>
  )
} 