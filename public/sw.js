// Service Worker para Notificaciones SIRIUS
const NOTIFICATION_TAG = 'sirius-reminder';

// Instalar el service worker
self.addEventListener('install', () => {
  console.log('Service Worker: Installed');
  self.skipWaiting();
});

// Activar el service worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activated');
  event.waitUntil(self.clients.claim());
});

// Manejar notificaciones push
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push received');
  
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'SIRIUS Regenerative';
  const options = {
    body: data.body || '¡Tienes una actividad pendiente!',
    icon: '/favicon.png',
    badge: '/favicon.png',
    tag: NOTIFICATION_TAG,
    data: data,
    actions: [
      {
        action: 'view',
        title: 'Ver Dashboard',
        icon: '/favicon.png'
      },
      {
        action: 'dismiss',
        title: 'Cerrar'
      }
    ],
    requireInteraction: true,
    silent: false
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Manejar clicks en notificaciones
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked');
  
  event.notification.close();

  if (event.action === 'view' || !event.action) {
    event.waitUntil(
      clients.openWindow('/dashboard')
    );
  }
});

// Programar recordatorios automáticos
function scheduleReminder(type, delay, data) {
  setTimeout(() => {
    const reminderData = {
      type,
      timestamp: Date.now(),
      ...data
    };

    let title, body;
    
    switch (type) {
      case 'pausa-activa':
        title = '🌱 ¡Hora de tu Pausa Activa!';
        body = 'Tu mente y cuerpo necesitan un descanso regenerativo';
        break;
      case 'almuerzo':
        title = '🍃 ¡Hora del Almuerzo!';
        body = 'Nutre tu cuerpo como nutres la tierra';
        break;
      case 'fin-jornada':
        title = '🌙 ¡Jornada Completada!';
        body = 'Has cuidado la tierra y ella te ha cuidado a ti';
        break;
      case 'logro':
        title = '🌟 ¡Nuevo Logro Desbloqueado!';
        body = data.message || 'Tu jardín virtual está floreciendo';
        break;
      default:
        title = 'SIRIUS Regenerative';
        body = 'Recordatorio importante';
    }

    self.registration.showNotification(title, {
      body,
      icon: '/favicon.png',
      badge: '/favicon.png',
      tag: `${type}-${Date.now()}`,
      data: reminderData,
      actions: [
        {
          action: 'view',
          title: 'Ver Dashboard'
        }
      ]
    });
  }, delay);
}

// Escuchar mensajes desde la app principal
self.addEventListener('message', (event) => {
  const { type, data } = event.data;
  
  switch (type) {
    case 'SCHEDULE_PAUSA_ACTIVA':
      // Programar pausa activa cada 2 horas
      scheduleReminder('pausa-activa', 2 * 60 * 60 * 1000, data);
      break;
    case 'SCHEDULE_ALMUERZO':
      // Programar recordatorio de almuerzo
      scheduleReminder('almuerzo', data.delay || 4 * 60 * 60 * 1000, data);
      break;
    case 'SCHEDULE_FIN_JORNADA':
      // Programar recordatorio de fin de jornada
      scheduleReminder('fin-jornada', data.delay || 8 * 60 * 60 * 1000, data);
      break;
    case 'NOTIFY_LOGRO':
      // Notificación inmediata de logro
      scheduleReminder('logro', 1000, data);
      break;
  }
}); 