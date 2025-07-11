'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { SiriusDB, OvertimeRequest } from '@/lib/supabase'
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  User, 
  Calendar, 
  AlertCircle,
  Send
} from 'lucide-react'
import { SiriusButton } from '@/components/ui/SiriusButton'

interface OvertimeRequestWithEmployee extends OvertimeRequest {
  employees: {
    nombre: string
    apodo: string
    cedula: string
    cargo: string
    departamento: string
  }
}

export default function SolicitudesHorasExtras() {
  const { employee } = useAuth()
  const router = useRouter()
  
  const [solicitudes, setSolicitudes] = useState<OvertimeRequestWithEmployee[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [commentModal, setCommentModal] = useState<{
    requestId: string
    action: 'aprobado' | 'rechazado'
  } | null>(null)
  const [comment, setComment] = useState('')

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

    loadSolicitudes()
  }, [employee, router])

  const loadSolicitudes = async () => {
    try {
      setLoading(true)
      const data = await SiriusDB.getPendingOvertimeRequests()
      setSolicitudes(data as OvertimeRequestWithEmployee[])
    } catch (error) {
      console.error('Error cargando solicitudes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleProcessRequest = async (
    requestId: string, 
    status: 'aprobado' | 'rechazado',
    comentarios?: string
  ) => {
    try {
      setProcessingId(requestId)
      
             const result = await SiriusDB.updateOvertimeRequest(
         requestId,
         status,
         employee!.id,
         comentarios
       )
      
      if (result.success) {
        // Remover la solicitud de la lista
        setSolicitudes(prev => prev.filter(s => s.id !== requestId))
        
        // Mostrar mensaje de éxito
        alert(result.message)
      } else {
        alert('Error al procesar la solicitud')
      }
    } catch (error) {
      console.error('Error procesando solicitud:', error)
      alert('Error inesperado al procesar la solicitud')
    } finally {
      setProcessingId(null)
      setCommentModal(null)
      setComment('')
    }
  }

  const openCommentModal = (requestId: string, action: 'aprobado' | 'rechazado') => {
    setCommentModal({ requestId, action })
    setComment('')
  }

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTiempo = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
      day: 'numeric',
      month: 'short'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sirius-green-light via-white to-sirius-sky-light flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-sirius-green-main border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-sirius-green-dark">Cargando solicitudes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sirius-green-light via-white to-sirius-sky-light p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-sirius-green-dark">
                Solicitudes de Horas Extras
              </h1>
              <p className="text-sirius-green-main mt-2">
                Revisa y autoriza las solicitudes del equipo SIRIUS
              </p>
            </div>
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 shadow-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-orange-500" />
                <span className="font-semibold text-orange-700">
                  {solicitudes.length} pendiente{solicitudes.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Lista de Solicitudes */}
        {solicitudes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/90 backdrop-blur-md rounded-3xl p-8 text-center shadow-xl"
          >
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              ¡Todo al día! 🎉
            </h3>
            <p className="text-gray-500">
              No hay solicitudes de horas extras pendientes.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {solicitudes.map((solicitud, index) => (
              <motion.div
                key={solicitud.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/90 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-white/50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Información del empleado */}
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-sirius-green-main to-sirius-sky-main rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {solicitud.employees.nombre.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {solicitud.employees.nombre}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {solicitud.employees.cargo} • {solicitud.employees.departamento}
                        </p>
                      </div>
                    </div>

                    {/* Detalles de la solicitud */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-sirius-sky-main" />
                        <span className="text-sm text-gray-600">
                          <strong>Fecha:</strong> {formatFecha(solicitud.fecha)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-orange-500" />
                        <span className="text-sm text-gray-600">
                          <strong>Horas extras:</strong> {solicitud.horas_estimadas}h
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-sirius-green-main" />
                        <span className="text-sm text-gray-600">
                          <strong>Solicitado:</strong> {formatTiempo(solicitud.created_at)}
                        </span>
                      </div>
                    </div>

                    {/* Motivo y justificación */}
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-gray-700 mb-1">Motivo:</h4>
                        <p className="text-sm bg-gray-50 rounded-lg p-3">
                          {solicitud.motivo}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-700 mb-1">Justificación:</h4>
                        <p className="text-sm bg-gray-50 rounded-lg p-3">
                          {solicitud.justificacion}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className="ml-6 flex flex-col space-y-2">
                    <SiriusButton
                      onClick={() => openCommentModal(solicitud.id, 'aprobado')}
                      disabled={processingId === solicitud.id}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2"
                      size="sm"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Aprobar
                    </SiriusButton>
                    <SiriusButton
                      onClick={() => openCommentModal(solicitud.id, 'rechazado')}
                      disabled={processingId === solicitud.id}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2"
                      size="sm"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Rechazar
                    </SiriusButton>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Modal de comentarios */}
        {commentModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full"
            >
              <div className="flex items-center space-x-3 mb-4">
                {commentModal.action === 'aprobado' ? (
                  <CheckCircle className="w-6 h-6 text-green-500" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-500" />
                )}
                <h3 className="font-semibold text-gray-800">
                  {commentModal.action === 'aprobado' ? 'Aprobar' : 'Rechazar'} Solicitud
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comentarios {commentModal.action === 'rechazado' ? '(requeridos)' : '(opcionales)'}
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder={`Explica por qué ${commentModal.action === 'aprobado' ? 'apruebas' : 'rechazas'} esta solicitud...`}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sirius-green-main focus:border-transparent resize-none"
                  />
                </div>

                <div className="flex space-x-3">
                  <SiriusButton
                    onClick={() => handleProcessRequest(
                      commentModal.requestId,
                      commentModal.action,
                      comment.trim() || undefined
                    )}
                    disabled={
                      processingId === commentModal.requestId ||
                      (commentModal.action === 'rechazado' && !comment.trim())
                    }
                    className={`flex-1 ${
                      commentModal.action === 'aprobado'
                        ? 'bg-green-500 hover:bg-green-600'
                        : 'bg-red-500 hover:bg-red-600'
                    } text-white`}
                    size="sm"
                  >
                    {processingId === commentModal.requestId ? (
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    Confirmar
                  </SiriusButton>
                  <SiriusButton
                    onClick={() => {
                      setCommentModal(null)
                      setComment('')
                    }}
                    variant="secondary"
                    className="px-6"
                    size="sm"
                  >
                    Cancelar
                  </SiriusButton>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
} 