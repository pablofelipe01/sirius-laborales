'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { SiriusButton } from '@/components/ui/SiriusButton'
import { SiriusDB } from '@/lib/supabase'
import { 
  Users, 
  Clock, 
  ArrowLeft, 
  User,
  Calendar,
  Star,
  Search
} from 'lucide-react'

interface EmployeeData {
  id: string
  nombre: string
  cedula: string
  apodo: string
  email: string
  telefono: string
  horas_trabajadas: number
  pausas_completadas: number
  ultimo_login: string
}

export default function EmpleadosPage() {
  const { employee } = useAuth()
  const router = useRouter()
  const [employees, setEmployees] = useState<EmployeeData[]>([])
  const [loading, setLoading] = useState(true)
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

    loadEmployees()
  }, [employee, router])

  const loadEmployees = async () => {
    try {
      setLoading(true)
      
      // Usar los datos reales de la base de datos
      const employeesData = await SiriusDB.getAllEmployeesWithStats()
      
      // Formatear los datos para el componente
      const formattedEmployees = employeesData.map((emp) => ({
        id: emp.id,
        nombre: emp.nombre,
        cedula: emp.cedula,
        apodo: emp.apodo || '',
        email: emp.email || `${emp.cedula}@sirius.com`,
        telefono: emp.telefono || `+57 300 ${emp.cedula.slice(-7)}`,
        horas_trabajadas: emp.total_horas || 0,
        pausas_completadas: emp.pausas_activas_realizadas || 0,
        ultimo_login: emp.ultimo_acceso || new Date().toISOString()
      }))

      setEmployees(formattedEmployees)
    } catch (error) {
      console.error('Error loading employees:', error)
      // Si hay error, mostrar array vacío en lugar de datos dummy
      setEmployees([])
    } finally {
      setLoading(false)
    }
  }

  const filteredEmployees = employees.filter(emp =>
    emp.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.cedula.includes(searchTerm) ||
    emp.apodo.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-starry-night flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Cargando empleados...</p>
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
      <div className="relative z-10 p-4 max-w-6xl mx-auto">
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
                <div className="w-12 h-12 bg-gradient-to-r from-sirius-green-main to-sirius-green-dark rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">
                    Jardín de Empleados 🌱
                  </h1>
                  <p className="text-gray-600">
                    Gestiona tu equipo de trabajo
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Total empleados</p>
                <p className="text-2xl font-bold text-sirius-green-main">{employees.length}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Barra de búsqueda */}
        <motion.div
          className="bg-white/95 backdrop-blur-lg rounded-2xl p-4 shadow-xl border border-white/30 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nombre, cédula o apodo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:border-sirius-green-main focus:ring-2 focus:ring-sirius-green-light/30 transition-all duration-300"
            />
          </div>
        </motion.div>

        {/* Lista de empleados */}
        <div className="grid gap-4">
          {filteredEmployees.map((emp, index) => (
            <motion.div
              key={emp.id}
              className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/30"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.6 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-sirius-green-main to-sirius-green-dark rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-semibold text-gray-800">
                        {emp.nombre}
                      </h3>
                      {emp.apodo && (
                                                 <span className="px-2 py-1 bg-sirius-green-light/20 text-sirius-green-dark text-sm rounded-full">
                           &quot;{emp.apodo}&quot;
                         </span>
                      )}
                    </div>
                    <p className="text-gray-600 mt-1">
                      Cédula: {emp.cedula}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span>📧 {emp.email}</span>
                      <span>📱 {emp.telefono}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="flex items-center gap-2 text-sirius-green-main">
                      <Clock className="w-5 h-5" />
                      <span className="text-2xl font-bold">{emp.horas_trabajadas}</span>
                    </div>
                    <p className="text-sm text-gray-500">Horas trabajadas</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center gap-2 text-sirius-sky-main">
                      <Star className="w-5 h-5" />
                      <span className="text-2xl font-bold">{emp.pausas_completadas}</span>
                    </div>
                    <p className="text-sm text-gray-500">Pausas activas</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center gap-2 text-sirius-sun-main">
                      <Calendar className="w-5 h-5" />
                      <span className="text-sm font-medium">
                        {new Date(emp.ultimo_login).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">Último acceso</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredEmployees.length === 0 && (
          <motion.div
            className="bg-white/95 backdrop-blur-lg rounded-2xl p-12 shadow-xl border border-white/30 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No se encontraron empleados
            </h3>
            <p className="text-gray-500">
              {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Aún no hay empleados registrados'}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
} 