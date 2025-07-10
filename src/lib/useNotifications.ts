import { useState, useEffect, useCallback } from 'react';

interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
}

interface ScheduledReminder {
  type: 'pausa-activa' | 'almuerzo' | 'fin-jornada' | 'logro';
  delay?: number;
  message?: string;
}

export const useNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [serviceWorkerRegistration, setServiceWorkerRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  // Verificar soporte y registrar service worker
  useEffect(() => {
    const checkSupport = () => {
      const supported = 'serviceWorker' in navigator && 'Notification' in window;
      setIsSupported(supported);
      return supported;
    };

    const registerServiceWorker = async () => {
      if (!checkSupport()) return;

      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        setServiceWorkerRegistration(registration);
        console.log('Service Worker registrado:', registration);
      } catch (error) {
        console.error('Error registrando Service Worker:', error);
      }
    };

    const checkPermission = () => {
      if ('Notification' in window) {
        setPermission(Notification.permission);
      }
    };

    registerServiceWorker();
    checkPermission();
  }, []);

  // Solicitar permisos de notificación
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      console.warn('Las notificaciones no están soportadas en este navegador');
      return false;
    }

    if (permission === 'granted') {
      return true;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    } catch (error) {
      console.error('Error solicitando permisos de notificación:', error);
      return false;
    }
  }, [isSupported, permission]);

  // Mostrar notificación inmediata
  const showNotification = useCallback(async (options: NotificationOptions): Promise<boolean> => {
    if (!isSupported || permission !== 'granted') {
      console.warn('No se pueden mostrar notificaciones');
      return false;
    }

    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/favicon.png',
        badge: options.badge || '/favicon.png',
        tag: options.tag || 'sirius-notification',
        requireInteraction: options.requireInteraction || false,
        data: {
          timestamp: Date.now(),
          url: '/dashboard'
        }
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // Auto-cerrar después de 8 segundos si no requiere interacción
      if (!options.requireInteraction) {
        setTimeout(() => {
          notification.close();
        }, 8000);
      }

      return true;
    } catch (error) {
      console.error('Error mostrando notificación:', error);
      return false;
    }
  }, [isSupported, permission]);

  // Programar recordatorio usando el service worker
  const scheduleReminder = useCallback((reminder: ScheduledReminder) => {
    if (!serviceWorkerRegistration) {
      console.warn('Service Worker no disponible para programar recordatorios');
      return;
    }

    const messageType = `SCHEDULE_${reminder.type.toUpperCase().replace('-', '_')}`;
    
    serviceWorkerRegistration.active?.postMessage({
      type: messageType,
      data: {
        delay: reminder.delay,
        message: reminder.message
      }
    });

    console.log(`Recordatorio programado: ${reminder.type}`);
  }, [serviceWorkerRegistration]);

  // Notificar logro inmediatamente
  const notifyAchievement = useCallback((message: string) => {
    if (!serviceWorkerRegistration) {
      // Fallback a notificación normal si no hay SW
      showNotification({
        title: '🌟 ¡Nuevo Logro Desbloqueado!',
        body: message,
        requireInteraction: true,
        tag: 'achievement'
      });
      return;
    }

    serviceWorkerRegistration.active?.postMessage({
      type: 'NOTIFY_LOGRO',
      data: { message }
    });
  }, [serviceWorkerRegistration, showNotification]);

  // Programar recordatorios automáticos para la jornada laboral
  const setupWorkdayReminders = useCallback(() => {
    if (!isSupported || permission !== 'granted') return;
    
    // Pausa activa cada 2 horas desde la entrada
    const pausaActivaDelay = 2 * 60 * 60 * 1000; // 2 horas
    scheduleReminder({
      type: 'pausa-activa',
      delay: pausaActivaDelay
    });

    // Recordatorio de almuerzo a las 4 horas de trabajo
    const almuerzoDelay = 4 * 60 * 60 * 1000; // 4 horas
    scheduleReminder({
      type: 'almuerzo',
      delay: almuerzoDelay
    });

    // Recordatorio de fin de jornada a las 8 horas
    const finJornadaDelay = 8 * 60 * 60 * 1000; // 8 horas
    scheduleReminder({
      type: 'fin-jornada',
      delay: finJornadaDelay
    });

    console.log('Recordatorios de jornada laboral configurados');
  }, [isSupported, permission, scheduleReminder]);

  // Mensajes motivacionales para notificaciones
  const getMotivationalMessage = (type: string): string => {
    const messages = {
      'pausa-activa': [
        'Tu mente necesita un respiro regenerativo 🌱',
        'Como las plantas, necesitas luz y descanso ☀️',
        'Un momento de pausa, una vida de bienestar 🧘‍♀️',
        'Respira profundo, la tierra te acompaña 🌍'
      ],
      'almuerzo': [
        'Nutre tu cuerpo como nutres la tierra 🍃',
        'Un almuerzo consciente es un acto de amor propio ❤️',
        'Tiempo de recargar energías naturalmente 🔋',
        'Tu cuerpo es tu templo, aliméntalo bien 🙏'
      ],
      'fin-jornada': [
        'Has sembrado productividad, ahora descansa 🌙',
        'Otro día cuidando la tierra y cuidándote a ti ✨',
        'Tu dedicación hace crecer el mundo 🌱',
        'Tiempo de desconectar y reconectar contigo 🧘‍♂️'
      ]
    };

    const typeMessages = messages[type as keyof typeof messages] || ['¡Excelente trabajo!'];
    return typeMessages[Math.floor(Math.random() * typeMessages.length)];
  };

  return {
    permission,
    isSupported,
    requestPermission,
    showNotification,
    scheduleReminder,
    notifyAchievement,
    setupWorkdayReminders,
    getMotivationalMessage
  };
}; 