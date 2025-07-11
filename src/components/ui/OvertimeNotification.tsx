'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Send, AlertTriangle, CheckCircle, Calendar } from 'lucide-react'
import { SiriusButton } from './SiriusButton'

interface OvertimeNotificationProps {
  employeeName: string
  currentHours: number
  isDomingoFestivo?: boolean
  isSundayOrHoliday?: boolean
  reason?: string
  onRequestSubmit: (request: {
    horasEstimadas: number
    motivo: string
    justificacion: string
  }) => Promise<{ success: boolean; message: string }>
  onDismiss: () => void
}

export const OvertimeNotification: React.FC<OvertimeNotificationProps> = ({
  employeeName,
  currentHours,
  isDomingoFestivo = false,
  isSundayOrHoliday = false,
  reason,
  onRequestSubmit,
  onDismiss
}) => {
  const [showForm, setShowForm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  
  const [formData, setFormData] = useState({
    horasEstimadas: isDomingoFestivo ? 8 : 1, // 8 horas para domingo/festivo, 1-4 para extras
    motivo: '',
    justificacion: ''
  })

  // Determinar tipo de día y motivos correspondientes
  const esHoy = new Date()
  const esDomingo = esHoy.getDay() === 0
  const tipoDia = esDomingo ? 'domingo' : (isDomingoFestivo ? 'festivo' : 'ordinario')

  const motivosComunes = isDomingoFestivo ? [
    // Motivos para domingos/festivos
    'Entrega urgente de proyecto',
    'Atención de emergencia operativa',
    'Mantenimiento programado de sistemas',
    'Soporte crítico a cliente',
    'Cierre de mes contable',
    'Proyecto con fecha límite crítica',
    'Otro motivo especial'
  ] : [
    // Motivos para horas extras normales
    'Entrega urgente de proyecto',
    'Reunión importante con cliente',
    'Cierre de mes contable',
    'Atención de emergencia operativa',
    'Capacitación especial',
    'Otro motivo'
  ]

  const handleSubmitRequest = async () => {
    if (!formData.motivo.trim() || !formData.justificacion.trim()) {
      return
    }

    setIsLoading(true)
    try {
      const response = await onRequestSubmit(formData)
      setResult(response)
      
      if (response.success) {
        setTimeout(() => {
          onDismiss()
        }, 3000)
      }
    } catch {
      setResult({
        success: false,
        message: 'Error al enviar la solicitud. Inténtalo de nuevo.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (result) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-4 right-4 max-w-md bg-white rounded-2xl shadow-2xl border-2 border-sirius-green-main p-6 z-50"
      >
        <div className="flex items-start space-x-3">
          {result.success ? (
            <CheckCircle className="w-6 h-6 text-green-500 mt-1" />
          ) : (
            <AlertTriangle className="w-6 h-6 text-red-500 mt-1" />
          )}
          <div className="flex-1">
            <h3 className={`font-semibold ${result.success ? 'text-green-700' : 'text-red-700'}`}>
              {result.success ? '¡Solicitud Enviada!' : 'Error en Solicitud'}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {result.message}
            </p>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`fixed top-4 right-4 max-w-md rounded-2xl shadow-2xl p-6 z-50 ${
          isDomingoFestivo 
            ? 'bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-400'
            : 'bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-400'
        }`}
      >
        {!showForm ? (
          // Notificación inicial
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className={`p-2 rounded-lg ${
                isDomingoFestivo ? 'bg-purple-100' : 'bg-orange-100'
              }`}>
                {isDomingoFestivo ? (
                  <Calendar className={`w-6 h-6 ${isDomingoFestivo ? 'text-purple-600' : 'text-orange-600'}`} />
                ) : (
                  <Clock className="w-6 h-6 text-orange-600" />
                )}
              </div>
              <div className="flex-1">
                <h3 className={`font-semibold ${
                  isDomingoFestivo ? 'text-purple-800' : 'text-orange-800'
                }`}>
                  {isDomingoFestivo ? (
                    <>¡Hola {employeeName}! 📅</>
                  ) : (
                    <>¡Hola {employeeName}! 👋</>
                  )}
                </h3>
                
                {isDomingoFestivo ? (
                  <div className="mt-1">
                    <p className={`text-sm ${isDomingoFestivo ? 'text-purple-700' : 'text-orange-700'}`}>
                      {reason || `Estás intentando trabajar en ${tipoDia}.`}
                    </p>
                    <p className={`text-sm mt-2 ${isDomingoFestivo ? 'text-purple-600' : 'text-orange-600'}`}>
                      <strong>Según la ley colombiana</strong>, trabajar en días de descanso obligatorio requiere <strong>autorización previa</strong>.
                    </p>
                  </div>
                ) : (
                  <div className="mt-1">
                    <p className="text-sm text-orange-700">
                      Ya has completado <strong>{currentHours.toFixed(1)} horas</strong> de trabajo hoy.
                    </p>
                    <p className="text-sm text-orange-600 mt-2">
                      Para continuar trabajando necesitas autorización para <strong>horas extras</strong>.
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex space-x-2">
              <SiriusButton
                onClick={() => setShowForm(true)}
                className={`flex-1 text-white ${
                  isDomingoFestivo 
                    ? 'bg-purple-500 hover:bg-purple-600' 
                    : 'bg-orange-500 hover:bg-orange-600'
                }`}
                size="sm"
              >
                <Send className="w-4 h-4 mr-2" />
                {isDomingoFestivo ? 'Solicitar Autorización' : 'Solicitar Horas Extras'}
              </SiriusButton>
              <SiriusButton
                onClick={onDismiss}
                variant="secondary"
                className={`px-4 ${
                  isDomingoFestivo 
                    ? 'border-purple-300 text-purple-600 hover:bg-purple-50'
                    : 'border-orange-300 text-orange-600 hover:bg-orange-50'
                }`}
                size="sm"
              >
                Después
              </SiriusButton>
            </div>
          </div>
        ) : (
          // Formulario de solicitud
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className={`font-semibold ${
                isDomingoFestivo ? 'text-purple-800' : 'text-orange-800'
              }`}>
                {isDomingoFestivo ? `Trabajar en ${tipoDia}` : 'Solicitar Horas Extras'}
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className={`${
                  isDomingoFestivo ? 'text-purple-400 hover:text-purple-600' : 'text-orange-400 hover:text-orange-600'
                }`}
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Horas estimadas */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDomingoFestivo ? 'text-purple-700' : 'text-orange-700'
                }`}>
                  {isDomingoFestivo ? 'Horas de trabajo estimadas' : 'Horas extras estimadas'}
                </label>
                <select
                  value={formData.horasEstimadas}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    horasEstimadas: Number(e.target.value)
                  }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${
                    isDomingoFestivo 
                      ? 'border-purple-200 focus:ring-purple-400'
                      : 'border-orange-200 focus:ring-orange-400'
                  }`}
                >
                  {isDomingoFestivo ? (
                    // Para domingo/festivo: rangos más amplios
                    [2, 4, 6, 8, 10].map(hours => (
                      <option key={hours} value={hours}>
                        {hours} hora{hours > 1 ? 's' : ''}
                      </option>
                    ))
                  ) : (
                    // Para horas extras: 1-4 horas adicionales
                    [1, 2, 3, 4].map(hours => (
                      <option key={hours} value={hours}>
                        {hours} hora{hours > 1 ? 's' : ''} adicional{hours > 1 ? 'es' : ''}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Motivo */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDomingoFestivo ? 'text-purple-700' : 'text-orange-700'
                }`}>
                  Motivo principal
                </label>
                <select
                  value={formData.motivo}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    motivo: e.target.value
                  }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${
                    isDomingoFestivo 
                      ? 'border-purple-200 focus:ring-purple-400'
                      : 'border-orange-200 focus:ring-orange-400'
                  }`}
                >
                  <option value="">Selecciona un motivo...</option>
                  {motivosComunes.map(motivo => (
                    <option key={motivo} value={motivo}>
                      {motivo}
                    </option>
                  ))}
                </select>
              </div>

              {/* Justificación */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDomingoFestivo ? 'text-purple-700' : 'text-orange-700'
                }`}>
                  Justificación detallada <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.justificacion}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    justificacion: e.target.value
                  }))}
                  placeholder={isDomingoFestivo 
                    ? "Explica por qué es necesario trabajar en este día de descanso obligatorio..."
                    : "Describe en detalle por qué necesitas estas horas extras..."
                  }
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent resize-none ${
                    isDomingoFestivo 
                      ? 'border-purple-200 focus:ring-purple-400'
                      : 'border-orange-200 focus:ring-orange-400'
                  }`}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Mínimo 20 caracteres para una justificación válida
                </p>
              </div>

              {/* Botones */}
              <div className="flex space-x-2">
                <SiriusButton
                  onClick={handleSubmitRequest}
                  disabled={
                    isLoading || 
                    !formData.motivo.trim() || 
                    !formData.justificacion.trim() || 
                    formData.justificacion.length < 20
                  }
                  className={`flex-1 text-white ${
                    isDomingoFestivo 
                      ? 'bg-purple-500 hover:bg-purple-600' 
                      : 'bg-orange-500 hover:bg-orange-600'
                  }`}
                  size="sm"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      />
                      <span>Enviando...</span>
                    </div>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Enviar Solicitud
                    </>
                  )}
                </SiriusButton>
                
                <SiriusButton
                  onClick={() => setShowForm(false)}
                  variant="secondary"
                  className={`px-4 ${
                    isDomingoFestivo 
                      ? 'border-purple-300 text-purple-600 hover:bg-purple-50'
                      : 'border-orange-300 text-orange-600 hover:bg-orange-50'
                  }`}
                  size="sm"
                >
                  Cancelar
                </SiriusButton>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
} 