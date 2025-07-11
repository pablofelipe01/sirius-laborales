# 🌱 SIRIUS Regenerative - Sistema de Control de Jornada Laboral

> *Transformando personas, regenerando el mundo*

Una aplicación web moderna para el control de horas trabajadas con enfoque en bienestar y pausas activas. Desarrollada con Next.js 14+ y TypeScript para **SIRIUS Regenerative SAS Zomac**.

## ✨ Características

### 🎯 Funcionalidades Principales
- **Autenticación por cédula de ciudadanía**
- **Control de jornada laboral** (entrada, almuerzo, salida)
- **Sistema de quincenas SIRIUS** para reportes de nómina
- **Cálculo automático de recargos** según legislación laboral colombiana 2025
- **Pausas activas guiadas** con meditaciones regenerativas
- **Gamificación del bienestar** con jardín virtual personal
- **Dashboard administrativo** estilo jardín para supervisores
- **Notificaciones web push** para recordatorios amigables
- **Reportes de nómina** con períodos quincenales personalizados

### 🌿 Personalidad SIRIUS
- **Deliberadamente humana**: Cálida y alegre
- **Transparente**: Honestos con lo que hacemos
- **Transformadora**: Creemos en la regeneración personal
- **Ligera**: No nos tomamos todo demasiado en serio
- **Alegre**: Brindamos alegría al día de las personas

### ⚖️ Cumplimiento Legal Colombiano
- **18 festivos nacionales** configurados (2025-2030)
- **Cálculo automático de recargos**: nocturnos, dominicales, festivos
- **Horas extra** con recargos del 25% diurno, 75% nocturno
- **Períodos de quincenas SIRIUS** específicos para nómina
- **Auditoría completa** de horas trabajadas por empleado

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

# Cédula de administrador (Luisa Ramírez)
ADMIN_CEDULA=1019090206

# Variables de marca
NEXT_PUBLIC_COMPANY_NAME="SIRIUS Regenerative"
NEXT_PUBLIC_COMPANY_TAGLINE="Transformando personas, regenerando el mundo"
```

### 4. Configurar Supabase

#### 4.1 Crear proyecto en Supabase
1. Ve a [supabase.com](https://supabase.com)
2. Crear nuevo proyecto
3. Copiar URL y clave anónima a `.env.local`

#### 4.2 Ejecutar migraciones y scripts
```bash
# En el SQL Editor de Supabase, ejecutar en orden:
# 1. supabase/migrations/001_initial_schema.sql
# 2. scripts/cleanup-and-fix-data.sql
# 3. scripts/real-employees-data.sql
```

#### 4.3 Verificar instalación
```bash
npm run test-system
```
Deberías ver: **✅ 🎯 TODOS LOS TESTS PASARON (7/7)**

### 5. Ejecutar en desarrollo
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 👥 Empleados SIRIUS Regenerative

### Equipo Real Configurado

| Nombre | Cédula | Cargo | Departamento | Salario/Hora |
|--------|--------|-------|--------------|--------------|
| Luisa Ramírez | `1019090206` | Coordinadora líder en gestión del ser | Administrativo | $26,956.52 |
| Pablo Acebedo | `79454772` | CTO | Tecnología | $39,130.00 |
| Alejandro Uricoechea | `1018497693` | Director Financiero | Administrativo | $34,782.61 |
| Santiago Amaya | `1006534877` | Jefe de pirólisis | Pirólisis | $12,225.39 |
| Alexandra Orosco | `1123561461` | Auxiliar operativa | Laboratorio | $8,260.87 |
| *+ 9 empleados más* | | | | |

**Total**: 14 empleados en 5 departamentos

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

- **Acceso con cédula de admin** (`1019090206` - Luisa Ramírez)
- **Dashboard estilo jardín** con vista de todo el equipo
- **Control de horas**: Ver estado en tiempo real de empleados
- **Reportes de nómina**: Sistema de quincenas SIRIUS
- **Gestión de empleados**: Información detallada por departamento
- **Métricas de bienestar** y productividad

### Sistema de Quincenas SIRIUS

El sistema incluye **24 quincenas predefinidas para 2025** con fechas específicas de SIRIUS:

- **Quincena 1 (Enero)**: 8-23 enero
- **Quincena 2 (Febrero)**: 7-21 febrero  
- **Quincena 3 (Marzo)**: 7-19 marzo
- **Y así sucesivamente...**

**Funcionalidades de quincenas:**
- Navegación por todas las quincenas del año
- Cálculo automático de horas y pagos por período
- Filtros por departamento y empleado
- Exportación de datos para nómina
- Comparativos entre quincenas

## 🏗️ Estructura del Proyecto

```
jornada-laboral-sirius/
├── src/
│   ├── app/                    # App Router de Next.js
│   │   ├── login/              # Página de autenticación
│   │   ├── dashboard/          # Dashboard principal empleados
│   │   ├── pausa-activa/       # Pausas activas guiadas
│   │   ├── admin/              # Panel administrativo
│   │   │   ├── horas/          # Control de horas en tiempo real
│   │   │   ├── empleados/      # Gestión de empleados
│   │   │   ├── nomina/         # Cálculos de nómina
│   │   │   └── quincenas/      # Reportes por quincenas
│   │   └── globals.css         # Estilos globales
│   ├── components/             # Componentes reutilizables
│   │   └── ui/                 # Componentes UI de SIRIUS
│   ├── contexts/               # Contextos de React
│   └── lib/                    # Utilidades y configuración
│       ├── supabase.ts         # Cliente y funciones de BD
│       ├── quincenas-sirius.ts # Sistema de quincenas
│       └── colombia-holidays.ts # Festivos colombianos
├── supabase/
│   └── migrations/             # Esquemas de base de datos
├── scripts/                    # Scripts de configuración
│   ├── real-employees-data.sql # Datos reales de empleados
│   ├── cleanup-and-fix-data.sql # Limpieza de BD
│   └── test-app-connectivity.js # Tests del sistema
├── tailwind.config.ts          # Configuración de Tailwind
└── README.md
```

## 🎯 Funcionalidades Implementadas

### ✅ Core Features
- [x] Autenticación por cédula (14 empleados reales)
- [x] Dashboard personalizado para empleados
- [x] Dashboard administrativo completo
- [x] Registro de tiempo (entrada/almuerzo/salida)
- [x] Cálculo automático de horas con recargos legales
- [x] Sistema de quincenas SIRIUS para nómina
- [x] 18 festivos colombianos (2025-2030)
- [x] Control de horas en tiempo real (admin)
- [x] Gestión de empleados por departamento
- [x] Reportes de nómina exportables
- [x] Gamificación con jardín virtual
- [x] Componentes UI con personalidad SIRIUS
- [x] Animaciones orgánicas
- [x] Base de datos completa y optimizada

### 🚧 Próximas Funcionalidades
- [ ] Pausas activas con audio guiado
- [ ] Notificaciones web push
- [ ] Solicitudes de horas extra
- [ ] PWA (Progressive Web App)
- [ ] Sistema de logros avanzado
- [ ] Analytics avanzado
- [ ] Integración con sistemas de nómina externos

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
- **employees**: 14 empleados reales con salarios y departamentos
- **time_records**: Registros de tiempo con mensajes motivacionales
- **hours_summary**: Resúmenes diarios con cálculos de recargos
- **holidays**: 18 festivos colombianos (2025-2030)
- **active_breaks**: Pausas activas para bienestar
- **motivational_messages**: Mensajes con personalidad SIRIUS
- **achievements**: Sistema de logros y gamificación
- **overtime_requests**: Solicitudes de horas extra

### Funciones SQL Implementadas
- **calculate_pay()**: Cálculo de pagos con recargos legales
- **is_holiday()**: Verificación de festivos
- **get_weekly_hours()**: Horas semanales por empleado

## 🧪 Testing

El sistema incluye un suite completo de tests:

```bash
npm run test-system
```

**Tests incluidos:**
1. ✅ Conectividad de base de datos
2. ✅ Verificación de empleados reales (14 empleados)
3. ✅ Pruebas de autenticación (5 empleados test)
4. ✅ Verificación de festivos colombianos (18 festivos)
5. ✅ Verificación de tabla hours_summary
6. ✅ Verificación de cálculos de salarios
7. ✅ Verificación de variables de entorno

**Resultado esperado**: 🎯 **TODOS LOS TESTS PASARON (7/7)**

## 🚀 Deploy a Producción

### Vercel (Recomendado)

1. **Conectar repositorio a Vercel**
2. **Configurar variables de entorno** en Vercel Dashboard
3. **Deploy automático** desde main branch

### Variables de entorno para producción
```env
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url_produccion
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_key_produccion
ADMIN_CEDULA=1019090206
NEXT_PUBLIC_COMPANY_NAME="SIRIUS Regenerative"
NEXT_PUBLIC_COMPANY_TAGLINE="Transformando personas, regenerando el mundo"
```

## 🤝 Contribuir

### Para Desarrolladores Autorizados

1. Fork el proyecto (solo desarrolladores autorizados por SIRIUS Regenerative)
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
- **Compliance legal**: Cumplimiento estricto de legislación laboral colombiana

## 📄 Licencia y Derechos de Autor

### 🏢 Propiedad Intelectual

Este software es **propiedad exclusiva** de:

**SIRIUS Regenerative SAS Zomac**  
*Transformando personas, regenerando el mundo*

### 👨‍💻 Derechos de Autor

**Desarrollador y Titular de Derechos Intelectuales:**  
**Pablo Felipe Acevedo Cuellar**  
**Cédula de Ciudadanía:** 79.454.772  
**Cargo:** Chief Technology Officer (CTO)

### ⚖️ Términos de Licencia

- ❌ **Este software NO es de código abierto**
- ❌ **Prohibida la redistribución sin autorización**
- ❌ **Prohibido el uso comercial por terceros**
- ❌ **Prohibida la modificación sin autorización**
- ✅ **Uso exclusivo para SIRIUS Regenerative SAS Zomac**
- ✅ **Solo empleados autorizados pueden acceder al código**

### 📜 Declaración Legal

> *Este sistema de software, incluyendo pero no limitándose a su código fuente, diseño, arquitectura, funcionalidades, base de datos, y documentación, es propiedad intelectual exclusiva de **Pablo Felipe Acevedo Cuellar** (CC: 79.454.772) y está licenciado únicamente para uso de **SIRIUS Regenerative SAS Zomac**.*

> *Cualquier uso, modificación, distribución o reproducción no autorizada constituye una violación de los derechos de autor y estará sujeta a acciones legales correspondientes.*

### 🛡️ Protección de Datos

Este sistema maneja información sensible de empleados y debe cumplir con:
- **Ley de Protección de Datos Personales** (Ley 1581 de 2012 - Colombia)
- **Políticas internas de SIRIUS Regenerative**
- **Normativas laborales colombianas**

---

## 🌟 Créditos

### 💻 Desarrollo Técnico
**Pablo Felipe Acevedo Cuellar** - *CTO & Lead Developer*  
📧 pablo@siriusregenerative.com  
🆔 CC: 79.454.772

### 🌱 Equipo SIRIUS Regenerative
- **Luisa Ramírez** - *Coordinadora líder en gestión del ser*
- **Alejandro Uricoechea** - *Director Financiero*
- **Santiago Amaya** - *Jefe de pirólisis*
- **Y todo el increíble equipo de 14 personas**

### 💡 Inspiración
- Diseño biomimético inspirado en la naturaleza
- Principios de bienestar laboral
- Cultura organizacional regenerativa
- Experiencia de usuario centrada en emociones positivas
- Cumplimiento riguroso de legislación laboral colombiana

---

*"Como las plantas necesitan cuidado para crecer, las personas necesitan pausas para florecer"* 🌱

## 📞 Soporte Técnico

### Para Empleados SIRIUS
Si tienes problemas con el sistema, contacta:
- **Soporte interno**: Luisa Ramírez o Pablo Acebedo
- **Issues técnicos**: Reportar a desarrollo

### Para Administradores del Sistema
- **CTO**: Pablo Felipe Acevedo Cuellar
- **Coordinación**: Luisa Ramírez

---

**© 2025 SIRIUS Regenerative SAS Zomac - Todos los derechos reservados**  
**Desarrollado por Pablo Felipe Acevedo Cuellar (CC: 79.454.772)**
