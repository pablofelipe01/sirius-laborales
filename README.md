# 🌱 SIRIUS Regenerative - Sistema de Control de Jornada Laboral

> *Transformando personas, regenerando el mundo*

Una aplicación web moderna para el control de horas trabajadas con enfoque en bienestar y pausas activas. Desarrollada con Next.js 14+ y TypeScript.

## ✨ Características

### 🎯 Funcionalidades Principales
- **Autenticación por cédula de ciudadanía**
- **Control de jornada laboral** (entrada, almuerzo, salida)
- **Pausas activas guiadas** con meditaciones regenerativas
- **Gamificación del bienestar** con jardín virtual personal
- **Dashboard administrativo** estilo jardín para supervisores
- **Notificaciones web push** para recordatorios amigables
- **Cumplimiento legal** de la reforma laboral colombiana 2025

### 🌿 Personalidad SIRIUS
- **Deliberadamente humana**: Cálida y alegre
- **Transparente**: Honestos con lo que hacemos
- **Transformadora**: Creemos en la regeneración personal
- **Ligera**: No nos tomamos todo demasiado en serio
- **Alegre**: Brindamos alegría al día de las personas

## 🚀 Stack Tecnológico

- **Frontend**: Next.js 14+ con App Router
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS con paleta personalizada SIRIUS
- **Base de datos**: Supabase (PostgreSQL)
- **Autenticación**: Custom con cédula de ciudadanía
- **Animaciones**: Framer Motion
- **Iconos**: Lucide React
- **Notificaciones**: Web Push API / Service Workers

## 📋 Prerrequisitos

- Node.js 18+ 
- npm o yarn
- Cuenta de Supabase
- Git

## 🛠️ Instalación

### 1. Clonar el repositorio
```bash
git clone <tu-repositorio>
cd jornada-laboral-sirius
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
```bash
# Renombrar environment.example a .env.local
cp environment.example .env.local
```

Edita `.env.local` con tus valores:
```env
# Configuración de Supabase
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key

# Variables para notificaciones Web Push (opcional)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=tu_vapid_public_key
VAPID_PRIVATE_KEY=tu_vapid_private_key

# Configuración local
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Cédula de administrador (Luisa)
ADMIN_CEDULA=12345678

# Variables de marca
NEXT_PUBLIC_COMPANY_NAME="SIRIUS Regenerative"
NEXT_PUBLIC_COMPANY_TAGLINE="Transformando personas, regenerando el mundo"
```

### 4. Configurar Supabase

#### 4.1 Crear proyecto en Supabase
1. Ve a [supabase.com](https://supabase.com)
2. Crear nuevo proyecto
3. Copiar URL y clave anónima a `.env.local`

#### 4.2 Ejecutar migraciones
```bash
# En el SQL Editor de Supabase, ejecutar en orden:
# 1. supabase/migrations/001_initial_schema.sql
# 2. supabase/migrations/002_seed_data.sql
```

### 5. Ejecutar en desarrollo
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 👥 Usuarios de Prueba

La aplicación viene con empleados de ejemplo:

| Nombre | Cédula | Rol | Emoji |
|--------|--------|-----|-------|
| Luisa González | `12345678` | Administradora | 🌻 |
| Juan Carlos Pérez | `23456789` | Empleado | 🌱 |
| María Elena Rodríguez | `34567890` | Empleado | 🌿 |
| Carlos Alberto Sánchez | `45678901` | Empleado | 🌳 |

## 🎨 Guía de Uso

### Para Empleados

1. **Login**: Ingresa tu cédula sin puntos ni espacios
2. **Dashboard**: Visualiza tus horas del día y estado actual
3. **Registro de tiempo**: 
   - 🌅 "Iniciar mi día" - Entrada
   - 🍽️ "Hora de almorzar" - Inicio de almuerzo
   - 😊 "Ya almorcé" - Fin de almuerzo
   - 🌱 "Pausa regenerativa" - Pausas activas
   - 🌙 "Fin del día" - Salida
4. **Jardín personal**: Ve crecer tu planta con cada pausa activa
5. **Pausas activas**: Meditaciones guiadas de 3 minutos

### Para Administradores

- Acceso con cédula de admin (`12345678`)
- Dashboard estilo jardín con vista de todo el equipo
- Métricas de bienestar y productividad
- Aprobación de solicitudes de horas extra

## 🏗️ Estructura del Proyecto

```
jornada-laboral-sirius/
├── src/
│   ├── app/                    # App Router de Next.js
│   │   ├── login/              # Página de autenticación
│   │   ├── dashboard/          # Dashboard principal
│   │   ├── pausa-activa/       # Pausas activas guiadas
│   │   ├── admin/              # Panel administrativo
│   │   └── globals.css         # Estilos globales
│   ├── components/             # Componentes reutilizables
│   │   └── ui/                 # Componentes UI de SIRIUS
│   ├── contexts/               # Contextos de React
│   └── lib/                    # Utilidades y configuración
├── supabase/
│   └── migrations/             # Esquemas de base de datos
├── tailwind.config.ts          # Configuración de Tailwind
└── README.md
```

## 🎯 Funcionalidades Implementadas

### ✅ Core Features
- [x] Autenticación por cédula
- [x] Dashboard personalizado
- [x] Registro de tiempo (entrada/almuerzo/salida)
- [x] Cálculo automático de horas trabajadas
- [x] Mensajes motivacionales aleatorios
- [x] Gamificación con jardín virtual
- [x] Componentes UI con personalidad SIRIUS
- [x] Animaciones orgánicas
- [x] Base de datos completa

### 🚧 Próximas Funcionalidades
- [ ] Pausas activas con audio guiado
- [ ] Dashboard administrativo completo
- [ ] Notificaciones web push
- [ ] Solicitudes de horas extra
- [ ] Reportes y analytics
- [ ] PWA (Progressive Web App)
- [ ] Sistema de logros avanzado

## 🎨 Paleta de Colores SIRIUS

```css
/* Verdes regenerativos */
--sirius-green-light: #A8E6CF
--sirius-green-main: #7FD1AE
--sirius-green-dark: #3D9970

/* Tierras nutritivas */
--sirius-earth-light: #DFD3C3
--sirius-earth-main: #C7A17F
--sirius-earth-dark: #8B6B47

/* Cielos inspiradores */
--sirius-sky-light: #B8E3FF
--sirius-sky-main: #87CEEB
--sirius-sky-dark: #4682B4

/* Acentos solares */
--sirius-sun-light: #FFE5B4
--sirius-sun-main: #FFD700
--sirius-sun-dark: #FFA500
```

## 📊 Base de Datos

### Tablas Principales
- **employees**: Información de empleados con personalización
- **time_records**: Registros de tiempo con mensajes motivacionales
- **active_breaks**: Pausas activas para bienestar
- **motivational_messages**: Mensajes con personalidad SIRIUS
- **achievements**: Sistema de logros y gamificación
- **overtime_requests**: Solicitudes de horas extra

## 🤝 Contribuir

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

### Principios de Desarrollo

- **Personalidad SIRIUS en todo**: Cada interacción debe ser cálida y humana
- **Accesibilidad primero**: Diseñar para todos
- **Performance optimizada**: Animaciones fluidas sin comprometer velocidad
- **Mobile-first**: Responsive en todos los dispositivos
- **Código limpio**: TypeScript estricto y componentes reutilizables

## 📝 Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 🌟 Créditos

Desarrollado con ❤️ por el equipo de SIRIUS Regenerative

### Inspiración
- Diseño biomimético inspirado en la naturaleza
- Principios de bienestar laboral
- Cultura organizacional regenerativa
- Experiencia de usuario centrada en emociones positivas

---

*"Como las plantas necesitan cuidado para crecer, las personas necesitan pausas para florecer"* 🌱

## 📞 Soporte

¿Tienes preguntas o necesitas ayuda?

- 📧 Email: soporte@sirius-regenerative.com
- 🐛 Issues: [GitHub Issues](./issues)
- 📚 Documentación: [Wiki del proyecto](./wiki)

---

**¡Gracias por usar SIRIUS Regenerative!** 🌟

Recuerda: Cada día es una nueva oportunidad de crecer 🌱
# sirius-laborales
