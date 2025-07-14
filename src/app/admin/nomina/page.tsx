'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { SiriusButton } from '@/components/ui/SiriusButton'
import { SiriusDB } from '@/lib/supabase'
import { 
  DollarSign, 
  ArrowLeft, 
  Calendar,
  Clock,
  Download,
  Users,
  Calculator
} from 'lucide-react'

interface PayrollData {
  employee: {
    id: string
    nombre: string
    cedula: string
    apodo: string
    salario: number
  }
  summary: {
    fecha: string
    horas_ordinarias: number
    horas_extra_diurnas: number
    horas_extra_nocturnas: number
    horas_nocturnas: number
    horas_dominicales_diurnas: number
    horas_dominicales_nocturnas: number
    horas_festivas_diurnas: number
    horas_festivas_nocturnas: number
    total_horas: number
    salario_base: number
    recargo_nocturno: number
    recargo_dominical: number
    recargo_festivo: number
    extra_diurna: number
    extra_nocturna: number
    total_pago: number
    pausas_activas_realizadas: number
  }
}

export default function NominaPage() {
  const { employee } = useAuth()
  const router = useRouter()
  const [payrollData, setPayrollData] = useState<PayrollData[]>([])
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

    loadPayrollData()
  }, [employee, router, selectedMonth])

  const loadPayrollData = async () => {
    try {
      setLoading(true)
      const startDate = `${selectedMonth}-01`
      const endDate = `${selectedMonth}-31`
      
      // Usar datos reales de la base de datos
      const data = await SiriusDB.getPayrollReport(startDate, endDate)
      setPayrollData(data)
    } catch (error) {
      console.error('Error loading payroll data:', error)
      // Si hay error, mostrar array vacío
      setPayrollData([])
    } finally {
      setLoading(false)
    }
  }

  const exportData = async (format: 'csv' | 'excel') => {
    try {
      const startDate = `${selectedMonth}-01`
      const endDate = `${selectedMonth}-31`
      
      await SiriusDB.exportEmployeeData(startDate, endDate, format)
      
      // Mostrar mensaje de éxito
      alert(`Datos exportados en formato ${format.toUpperCase()}`)
    } catch (error) {
      console.error('Error exporting data:', error)
      alert('Error al exportar los datos')
    }
  }

  const getTotalPayroll = () => {
    return payrollData.reduce((total, item) => {
      return total + (item.summary?.total_pago || 0)
    }, 0)
  }

  const getTotalHours = () => {
    return payrollData.reduce((total, item) => {
      return total + (item.summary?.total_horas || 0)
    }, 0)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-starry-night flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Calculando nómina...</p>
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
                <div className="w-12 h-12 bg-gradient-to-r from-sirius-sun-main to-sirius-sun-light rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">
                    Nómina SIRIUS 💰
                  </h1>
                  <p className="text-gray-600">
                    Cálculos de pago y horas laborales
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Controles */}
        <motion.div
          className="bg-white/95 backdrop-blur-lg rounded-2xl p-4 shadow-xl border border-white/30 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-600" />
                <label className="text-sm font-medium text-gray-700">Mes:</label>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-gray-200 focus:border-sirius-green-main focus:ring-2 focus:ring-sirius-green-light/30 transition-all duration-300"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <SiriusButton
                onClick={() => exportData('csv')}
                variant="secondary"
                size="sm"
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                CSV
              </SiriusButton>
              <SiriusButton
                onClick={() => exportData('excel')}
                variant="secondary"
                size="sm"
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Excel
              </SiriusButton>
            </div>
          </div>
        </motion.div>

        {/* Resumen totales */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/30">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-sirius-green-main to-sirius-green-dark rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Empleados</p>
                <p className="text-2xl font-bold text-gray-800">{payrollData.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/30">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-sirius-sky-main to-sirius-sky-light rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Horas</p>
                <p className="text-2xl font-bold text-gray-800">{getTotalHours().toFixed(1)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/30">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-sirius-sun-main to-sirius-sun-light rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Nómina</p>
                <p className="text-2xl font-bold text-gray-800">
                  ${getTotalPayroll().toLocaleString('es-CO')}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabla de nómina */}
        <motion.div
          className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-white/30 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-sirius-green-main to-sirius-green-dark text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Empleado</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold">Horas Ord.</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold">Horas Extra</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold">Horas Noct.</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold">Salario Base</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold">Recargos</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold">Total Pago</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold">Pausas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                                 {payrollData.map((item) => (
                  <tr key={item.employee.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{item.employee.nombre}</div>
                        <div className="text-sm text-gray-500">
                          {item.employee.apodo && `"${item.employee.apodo}" • `}
                          {item.employee.cedula}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-medium text-gray-900">
                        {item.summary.horas_ordinarias.toFixed(1)}h
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-medium text-sirius-green-main">
                        {(item.summary.horas_extra_diurnas + item.summary.horas_extra_nocturnas).toFixed(1)}h
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-medium text-sirius-sky-main">
                        {item.summary.horas_nocturnas.toFixed(1)}h
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-medium text-gray-900">
                        ${item.summary.salario_base.toLocaleString('es-CO')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-medium text-sirius-sun-main">
                        ${(item.summary.recargo_nocturno + item.summary.recargo_dominical + item.summary.recargo_festivo).toLocaleString('es-CO')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-lg font-bold text-sirius-green-dark">
                        ${item.summary.total_pago.toLocaleString('es-CO')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-sirius-green-light/20 text-sirius-green-dark">
                        {item.summary.pausas_activas_realizadas} pausas
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {payrollData.length === 0 && (
          <motion.div
            className="bg-white/95 backdrop-blur-lg rounded-2xl p-12 shadow-xl border border-white/30 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <Calculator className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No hay datos de nómina
            </h3>
            <p className="text-gray-500">
              No se encontraron registros para el mes seleccionado
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
} 