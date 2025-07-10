'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Coffee, Clock, Star } from 'lucide-react';

interface VisualReminder {
  id: string;
  type: 'pausa-activa' | 'almuerzo' | 'fin-jornada' | 'logro';
  title: string;
  message: string;
  emoji: string;
  timestamp: number;
  duration?: number; // duración en ms, undefined = permanente hasta que se cierre
}

interface VisualRemindersProps {
  enabled?: boolean;
}

interface SiriusReminders {
  scheduleWorkdayReminders: () => void;
  notifyAchievement: (message: string) => void;
  showReminder: (reminderData: Omit<VisualReminder, 'id' | 'timestamp'>) => void;
}

export function VisualReminders({ enabled = true }: VisualRemindersProps) {
  const [reminders, setReminders] = useState<VisualReminder[]>([]);
  const [timers, setTimers] = useState<NodeJS.Timeout[]>([]);

  // Programar recordatorios automáticos
  const scheduleWorkdayReminders = useCallback(() => {
    if (!enabled) return;

    // Limpiar timers existentes
    timers.forEach(timer => clearTimeout(timer));
    
    const newTimers: NodeJS.Timeout[] = [];

    // Pausa activa cada 2 horas (primero a las 2 horas)
    const pausaTimer1 = setTimeout(() => {
      showReminder({
        type: 'pausa-activa',
        title: '🌱 ¡Hora de tu Pausa Activa!',
        message: 'Tu mente y cuerpo necesitan un respiro regenerativo',
        emoji: '🧘‍♀️',
        duration: 15000 // 15 segundos
      });
    }, 2 * 60 * 60 * 1000); // 2 horas

    // Segunda pausa activa a las 4 horas
    const pausaTimer2 = setTimeout(() => {
      showReminder({
        type: 'pausa-activa',
        title: '🌿 ¡Segunda Pausa del Día!',
        message: 'Como las plantas, necesitas luz y descanso',
        emoji: '☀️',
        duration: 15000
      });
    }, 4 * 60 * 60 * 1000); // 4 horas

    // Recordatorio de almuerzo
    const almuerzoTimer = setTimeout(() => {
      showReminder({
        type: 'almuerzo',
        title: '🍃 ¡Hora del Almuerzo!',
        message: 'Nutre tu cuerpo como nutres la tierra',
        emoji: '🥗',
        duration: 20000 // 20 segundos
      });
    }, 4.5 * 60 * 60 * 1000); // 4.5 horas

    // Tercera pausa activa a las 6 horas
    const pausaTimer3 = setTimeout(() => {
      showReminder({
        type: 'pausa-activa',
        title: '🌟 ¡Última Pausa Activa!',
        message: 'Respira profundo, la tierra te acompaña',
        emoji: '🌍',
        duration: 15000
      });
    }, 6 * 60 * 60 * 1000); // 6 horas

    // Recordatorio de fin de jornada
    const finTimer = setTimeout(() => {
      showReminder({
        type: 'fin-jornada',
        title: '🌙 ¡Jornada Completada!',
        message: 'Has sembrado productividad, ahora descansa',
        emoji: '✨'
        // Sin duration = permanente hasta que se cierre
      });
    }, 8 * 60 * 60 * 1000); // 8 horas

    newTimers.push(pausaTimer1, pausaTimer2, almuerzoTimer, pausaTimer3, finTimer);
    setTimers(newTimers);
  }, [enabled, timers]);

  // Mostrar recordatorio inmediato
  const showReminder = useCallback((reminderData: Omit<VisualReminder, 'id' | 'timestamp'>) => {
    const reminder: VisualReminder = {
      ...reminderData,
      id: `reminder-${Date.now()}-${Math.random()}`,
      timestamp: Date.now()
    };

    setReminders(prev => [...prev, reminder]);

    // Auto-remover si tiene duración definida
    if (reminder.duration) {
      setTimeout(() => {
        removeReminder(reminder.id);
      }, reminder.duration);
    }
  }, []);

  // Remover recordatorio
  const removeReminder = useCallback((id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id));
  }, []);

  // Notificar logro (función pública)
  const notifyAchievement = useCallback((message: string) => {
    showReminder({
      type: 'logro',
      title: '🌟 ¡Nuevo Logro!',
      message,
      emoji: '🎉',
      duration: 10000 // 10 segundos
    });
  }, [showReminder]);

  // Limpiar timers al desmontar
  useEffect(() => {
    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [timers]);

  // Exponer funciones globalmente para usar desde otros componentes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as typeof window & { siriusReminders?: SiriusReminders }).siriusReminders = {
        scheduleWorkdayReminders,
        notifyAchievement,
        showReminder
      };
    }
  }, [scheduleWorkdayReminders, notifyAchievement, showReminder]);

  const getIconForType = (type: VisualReminder['type']) => {
    switch (type) {
      case 'pausa-activa':
        return <Heart className="w-6 h-6" />;
      case 'almuerzo':
        return <Coffee className="w-6 h-6" />;
      case 'fin-jornada':
        return <Clock className="w-6 h-6" />;
      case 'logro':
        return <Star className="w-6 h-6" />;
      default:
        return <Heart className="w-6 h-6" />;
    }
  };

  const getColorForType = (type: VisualReminder['type']) => {
    switch (type) {
      case 'pausa-activa':
        return 'from-green-500 to-emerald-600';
      case 'almuerzo':
        return 'from-orange-500 to-amber-600';
      case 'fin-jornada':
        return 'from-blue-500 to-indigo-600';
      case 'logro':
        return 'from-purple-500 to-pink-600';
      default:
        return 'from-green-500 to-emerald-600';
    }
  };

  if (!enabled) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <AnimatePresence>
        {reminders.map((reminder) => (
          <motion.div
            key={reminder.id}
            initial={{ opacity: 0, y: -100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="fixed top-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md pointer-events-auto z-50"
          >
            <motion.div
              className={`bg-gradient-to-r ${getColorForType(reminder.type)} rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md border border-white/20`}
              whileHover={{ scale: 1.02 }}
            >
              {/* Barra de progreso si tiene duración */}
              {reminder.duration && (
                <motion.div
                  className="h-1 bg-white/30"
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: reminder.duration / 1000, ease: "linear" }}
                />
              )}

              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <motion.div
                      animate={{ 
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 1
                      }}
                      className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white"
                    >
                      {getIconForType(reminder.type)}
                    </motion.div>
                    
                    <div>
                      <h3 className="font-semibold text-white text-lg leading-tight">
                        {reminder.title}
                      </h3>
                      <p className="text-white/90 text-sm mt-1 leading-relaxed">
                        {reminder.message}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => removeReminder(reminder.id)}
                    className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors ml-2 flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Botones de acción para ciertos tipos */}
                {(reminder.type === 'pausa-activa' || reminder.type === 'fin-jornada') && (
                  <div className="flex gap-2">
                    {reminder.type === 'pausa-activa' && (
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          removeReminder(reminder.id);
                          // Redirigir a pausa activa
                          window.location.href = '/pausa-activa';
                        }}
                        className="flex-1 bg-white/20 hover:bg-white/30 text-white rounded-lg py-2 px-3 text-sm font-medium transition-colors"
                      >
                        🧘‍♀️ Empezar pausa
                      </motion.button>
                    )}
                    
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => removeReminder(reminder.id)}
                      className="px-4 bg-white/10 hover:bg-white/20 text-white rounded-lg py-2 text-sm transition-colors"
                    >
                      Después
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
} 