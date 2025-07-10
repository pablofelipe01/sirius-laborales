'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '@/lib/useNotifications';
import { SiriusButton } from './SiriusButton';

interface NotificationSetupProps {
  onNotificationsEnabled?: () => void;
}

export function NotificationSetup({ onNotificationsEnabled }: NotificationSetupProps) {
  const { 
    permission, 
    isSupported, 
    requestPermission, 
    setupWorkdayReminders, 
    showNotification 
  } = useNotifications();
  
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [showSetup, setShowSetup] = useState(false);

  useEffect(() => {
    // Mostrar setup solo si las notificaciones están soportadas pero no están habilitadas
    setShowSetup(isSupported && permission !== 'granted');
  }, [isSupported, permission]);

  const handleEnableNotifications = async () => {
    setIsConfiguring(true);
    
    try {
      const granted = await requestPermission();
      
      if (granted) {
        // Mostrar notificación de bienvenida
        await showNotification({
          title: '🌱 ¡Notificaciones Activadas!',
          body: 'Te ayudaremos a mantener un equilibrio saludable durante tu jornada',
          requireInteraction: false,
          tag: 'welcome'
        });

        // Configurar recordatorios automáticos
        setupWorkdayReminders();
        
        setShowSetup(false);
        onNotificationsEnabled?.();
      }
    } catch (error) {
      console.error('Error activando notificaciones:', error);
    } finally {
      setIsConfiguring(false);
    }
  };

  const testNotification = async () => {
    await showNotification({
      title: '🌟 Notificación de Prueba',
      body: 'Las notificaciones están funcionando correctamente. ¡Genial!',
      requireInteraction: false,
      tag: 'test'
    });
  };

  if (!isSupported) {
    return null; // No mostrar nada si no están soportadas
  }

  return (
    <AnimatePresence>
      {showSetup && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className="bg-gradient-to-br from-primary-900/80 to-secondary-900/80 backdrop-blur-sm border border-primary-400/30 rounded-2xl p-6 mb-6 shadow-2xl"
        >
          <div className="flex items-start space-x-4">
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3
              }}
              className="text-4xl"
            >
              🔔
            </motion.div>
            
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-primary-100 mb-2">
                Activa las Notificaciones SIRIUS
              </h3>
              
              <p className="text-primary-200/80 mb-4 leading-relaxed">
                Te ayudamos a mantener el equilibrio durante tu jornada laboral con recordatorios amables:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                <motion.div 
                  className="bg-primary-800/50 rounded-lg p-3 border border-primary-400/20"
                  whileHover={{ scale: 1.02, backgroundColor: 'rgba(127, 209, 174, 0.15)' }}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-lg">🌱</span>
                    <span className="text-sm font-medium text-primary-100">Pausas Activas</span>
                  </div>
                  <p className="text-xs text-primary-200/70">Cada 2 horas</p>
                </motion.div>
                
                <motion.div 
                  className="bg-primary-800/50 rounded-lg p-3 border border-primary-400/20"
                  whileHover={{ scale: 1.02, backgroundColor: 'rgba(127, 209, 174, 0.15)' }}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-lg">🍃</span>
                    <span className="text-sm font-medium text-primary-100">Hora de Almuerzo</span>
                  </div>
                  <p className="text-xs text-primary-200/70">Tiempo de nutrir</p>
                </motion.div>
                
                <motion.div 
                  className="bg-primary-800/50 rounded-lg p-3 border border-primary-400/20"
                  whileHover={{ scale: 1.02, backgroundColor: 'rgba(127, 209, 174, 0.15)' }}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-lg">🌟</span>
                    <span className="text-sm font-medium text-primary-100">Logros</span>
                  </div>
                  <p className="text-xs text-primary-200/70">Celebra tus avances</p>
                </motion.div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <SiriusButton
                  onClick={handleEnableNotifications}
                  disabled={isConfiguring}
                  className="flex-1"
                >
                  {isConfiguring ? (
                    <div className="flex items-center justify-center space-x-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      />
                      <span>Configurando...</span>
                    </div>
                  ) : (
                    <>
                      <span className="mr-2">🌱</span>
                      Activar Notificaciones
                    </>
                  )}
                </SiriusButton>
                
                <button
                  onClick={() => setShowSetup(false)}
                  className="px-4 py-2 text-primary-200 hover:text-primary-100 transition-colors text-sm"
                >
                  Más tarde
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Panel de control cuando ya están habilitadas */}
      {permission === 'granted' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-primary-900/40 backdrop-blur-sm border border-primary-400/20 rounded-xl p-4 mb-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-xl"
              >
                🔔
              </motion.span>
              <div>
                <h4 className="text-sm font-medium text-primary-100">
                  Notificaciones Activas
                </h4>
                <p className="text-xs text-primary-200/70">
                  Te cuidamos durante tu jornada
                </p>
              </div>
            </div>
            
            <button
              onClick={testNotification}
              className="text-xs px-3 py-1 bg-primary-600/30 hover:bg-primary-600/50 text-primary-100 rounded-lg transition-colors"
            >
              Probar
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 