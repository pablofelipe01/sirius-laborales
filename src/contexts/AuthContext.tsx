'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Employee, SiriusDB } from '@/lib/supabase'

interface AuthContextType {
  employee: Employee | null
  isLoading: boolean
  isAdmin: boolean
  login: (cedula: string) => Promise<{ success: boolean; message: string }>
  logout: () => void
  refreshEmployee: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Verificar si es administrador (Luisa Ramírez - Coordinadora líder en gestión del ser)
  const isAdmin = employee?.cedula === process.env.ADMIN_CEDULA || employee?.cedula === '1019090206'

  useEffect(() => {
    // Verificar si hay una sesión guardada al cargar la app
    const savedEmployee = localStorage.getItem('sirius_employee')
    if (savedEmployee) {
      try {
        const parsedEmployee = JSON.parse(savedEmployee)
        setEmployee(parsedEmployee)
      } catch (error) {
        console.error('Error parsing saved employee:', error)
        localStorage.removeItem('sirius_employee')
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (cedula: string): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true)
    
    try {
      // Validar formato de cédula (solo números, 6-12 dígitos)
      const cedulaRegex = /^\d{6,12}$/
      if (!cedulaRegex.test(cedula)) {
        return {
          success: false,
          message: '¡Ups! Parece que hay un pequeño error en tu cédula 😊 Recuerda que son solo números'
        }
      }

      // Autenticar con la base de datos
      const employeeData = await SiriusDB.authenticateEmployee(cedula)
      
      if (!employeeData) {
        return {
          success: false,
          message: '¡Hmm! No encuentro tu cédula en nuestro jardín de empleados 🌱 ¿Podrías verificarla?'
        }
      }

      // Guardar en estado y localStorage
      setEmployee(employeeData)
      localStorage.setItem('sirius_employee', JSON.stringify(employeeData))

      // Mensaje de bienvenida personalizado
      const welcomeMessages = [
        `¡Hola ${employeeData.apodo || employeeData.nombre}! 🌟 ¿Listo para un día increíble?`,
        `¡Buenos días ${employeeData.apodo || employeeData.nombre}! ☀️ Que tu jornada esté llena de energía`,
        `¡Bienvenid@ ${employeeData.apodo || employeeData.nombre}! 🌱 Hoy es un gran día para crecer`,
        `¡Hey ${employeeData.apodo || employeeData.nombre}! 😊 Nos alegra verte por aquí`
      ]
      
      const randomMessage = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)]

      return {
        success: true,
        message: randomMessage
      }
    } catch (error) {
      console.error('Error en login:', error)
      return {
        success: false,
        message: '¡Ops! Algo no salió como esperábamos 🤔 Inténtalo de nuevo en un momentito'
      }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setEmployee(null)
    localStorage.removeItem('sirius_employee')
    
    // Mensaje de despedida amigable
    const goodbyeMessages = [
      '¡Gracias por tu energía hoy! 👋',
      '¡Que descanses bien! Nos vemos mañana 🌙',
      '¡Hasta luego! Que tengas una tarde hermosa ☀️'
    ]
    
    // Mostrar mensaje de despedida (opcional)
    const randomGoodbye = goodbyeMessages[Math.floor(Math.random() * goodbyeMessages.length)]
    console.log(randomGoodbye)
  }

  const refreshEmployee = async () => {
    if (!employee) return
    
    try {
      const updatedEmployee = await SiriusDB.authenticateEmployee(employee.cedula)
      if (updatedEmployee) {
        setEmployee(updatedEmployee)
        localStorage.setItem('sirius_employee', JSON.stringify(updatedEmployee))
      }
    } catch (error) {
      console.error('Error refreshing employee:', error)
    }
  }

  const value: AuthContextType = {
    employee,
    isLoading,
    isAdmin,
    login,
    logout,
    refreshEmployee
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook para obtener saludo personalizado según la hora
export const useGreeting = () => {
  const { employee } = useAuth()
  
  const getGreeting = () => {
    if (!employee) return '¡Hola!'
    
    const hour = new Date().getHours()
    const name = employee.apodo || employee.nombre.split(' ')[0]
    
    if (hour < 12) {
      return `¡Buenos días, ${name}! ☀️`
    } else if (hour < 18) {
      return `¡Buenas tardes, ${name}! 🌤️`
    } else {
      return `¡Buenas noches, ${name}! 🌙`
    }
  }
  
  return { getGreeting, employee }
}

// Hook para verificar permisos
export const usePermissions = () => {
  const { employee, isAdmin } = useAuth()
  
  const canAccessAdmin = isAdmin
  const canManageEmployees = isAdmin
  const canApproveOvertimeRequests = isAdmin
  const canViewReports = isAdmin
  
  return {
    canAccessAdmin,
    canManageEmployees,
    canApproveOvertimeRequests,
    canViewReports,
    isEmployee: !!employee,
    isAdmin
  }
} 