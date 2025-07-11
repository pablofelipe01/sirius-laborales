# 🚀 **SIRIUS Regenerative - Guía de Deploy a Producción**

Sistema completo de control de jornada laboral y bienestar empresarial.

## 📋 **Estado Actual del Sistema**

✅ **LISTO PARA PRODUCCIÓN** - Todos los componentes implementados y probados

### 🎯 **Funcionalidades Implementadas**

1. **Autenticación por Cédula** - Sistema custom sin contraseñas
2. **Dashboard Empleados** - Control de horarios, pausas activas, logros
3. **Dashboard Administrativo** - Gestión completa de nómina y reportes
4. **Cálculo de Horas** - Cumplimiento legislación laboral colombiana
5. **Calendario de Festivos** - 18 festivos colombianos 2025-2030
6. **Sistema de Notificaciones** - Web Push API integrado
7. **Pausas Activas** - Meditaciones guiadas y ejercicios
8. **UI/UX Personalizada** - Diseño orgánico con animaciones

---

## 🌟 **Empleados del Sistema**

### 👑 **Administradora Principal**
- **Luisa Ramírez** - Cédula: `1019090206`
- Cargo: Coordinadora líder en gestión del ser
- Acceso: Dashboard admin + Dashboard empleado

### 👥 **Empleados por Departamento**

**📊 Administrativo (5 empleados)**
- Alejandro Uricoechea - `1018497693` - Director Financiero
- Joys Moreno - `1026272126` - Coordinadora líder en gerencia  
- Carolina Casas - `1016080562` - Asistente Financiera y Contable
- Yeison Cogua - `1006416103` - Redactor Creativo

**🔥 Pirólisis (4 empleados)**
- Santiago Amaya - `1006534877` - Jefe de pirólisis
- Mario Barrera - `1122626299` - Auxiliar operativo
- Kevin Ávila - `1006866318` - Auxiliar operativo
- Luis Alberto Obando - `1019887392` - Auxiliar operativo

**🧪 Laboratorio (3 empleados)**
- Alexandra Orosco - `1123561461` - Auxiliar operativa
- Yesenia Ramírez - `1057014925` - Auxiliar operativa
- Angi Cardenas - `8122626068` - Auxiliar operativa

**💻 RAAS (1 empleado)**
- David Hernández - `1006774686` - Ingeniero de desarrollo

---

## 🔧 **Deploy a Vercel**

### 1. **Configuración de Variables de Entorno**

En el dashboard de Vercel, agregar:

```bash
# Supabase (OBLIGATORIO)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Admin (OBLIGATORIO) - Cédula de Luisa Ramírez
ADMIN_CEDULA=1019090206

# Web Push Notifications (OPCIONAL)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key

# App Configuration
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NEXT_PUBLIC_COMPANY_NAME=SIRIUS Regenerative
NEXT_PUBLIC_COMPANY_TAGLINE=Transformando personas, regenerando el mundo
```

### 2. **Base de Datos Supabase**

#### Configurar Tablas (Ejecutar en SQL Editor):

```sql
-- 1. Crear tablas básicas
-- Ejecutar: scripts/minimal-tables.sql

-- 2. Insertar empleados reales
-- Ejecutar: scripts/real-employees-data.sql

-- 3. Configurar funciones de producción
-- Ejecutar: scripts/production-logic.sql
```

### 3. **Deploy desde GitHub**

```bash
# 1. Commit final
git add .
git commit -m "Production ready - Real employees data"
git push origin main

# 2. Conectar repositorio en Vercel
# 3. Deploy automático se ejecutará
```

---

## 🧪 **Verificación Post-Deploy**

### 1. **Funcionalidades Críticas**

- [ ] Login con cédula de Luisa: `1019090206` → Redirige a `/admin`
- [ ] Login empleados → Redirige a `/dashboard`
- [ ] Dashboard admin: empleados, horas, nómina, reportes
- [ ] Cálculo de horas con legislación colombiana
- [ ] Pausas activas funcionando
- [ ] Notificaciones Web Push
- [ ] Responsive en móviles

### 2. **Test de Usuarios**

**Admin (Luisa):**
```
Cédula: 1019090206
Acceso: /admin + /dashboard (botón "Mi Vista de Empleada")
```

**Empleados de Prueba:**
```
Santiago (Jefe): 1006534877
Mario (Auxiliar): 1122626299
Alexandra (Lab): 1123561461
David (RAAS): 1006774686
```

### 3. **Verificar Datos**

- [ ] 13 empleados reales cargados
- [ ] Salarios por hora correctos
- [ ] Departamentos asignados
- [ ] Calendario festivos 2025
- [ ] Cálculos de recargos funcionando

---

## 📊 **Scripts de Base de Datos**

### Empleados Reales
```sql
-- Ver: scripts/real-employees-data.sql
-- Empleados reales con salarios y departamentos
-- Limpia datos de prueba anteriores
```

### Configuración Producción
```sql
-- Ver: scripts/production-logic.sql
-- Legislación laboral colombiana
-- Calendario festivos 2025-2030
-- Funciones de cálculo de nómina
```

---

## 🎨 **Características del Sistema**

### 🌌 **Diseño Visual**
- Fondo de noche estrellada (preferencia del usuario)
- Paleta de colores SIRIUS (azules, verdes, dorados)
- Animaciones orgánicas y transiciones suaves
- Responsive design para todos los dispositivos

### ⚡ **Performance**
- Next.js 14 con App Router
- TypeScript para type safety
- Tailwind CSS optimizado
- Componentes reutilizables

### 🔐 **Seguridad**
- Autenticación por cédula (sin contraseñas)
- Verificación de roles en frontend y backend
- Variables de entorno para configuración sensible
- Validación de datos en tiempo real

---

## 🆘 **Troubleshooting**

### Problemas Comunes

**❌ "Employee not found"**
- Verificar que se ejecutó `scripts/real-employees-data.sql`
- Confirmar cédula sin espacios o caracteres especiales

**❌ "Admin access denied"**
- Verificar `ADMIN_CEDULA=1019090206` en variables de entorno
- Confirmar que Luisa está en la base de datos

**❌ "Database connection failed"**
- Verificar credenciales de Supabase
- Confirmar que las tablas existen
- Verificar Row Level Security configurado

**❌ "Calculation errors"**
- Confirmar que se ejecutó `scripts/production-logic.sql`
- Verificar datos de salarios en tabla `employees`

---

## 📞 **Soporte**

Sistema desarrollado para **SIRIUS Regenerative**
- Dashboard Empleados: Control de horarios y bienestar
- Dashboard Admin: Gestión completa de nómina y reportes
- Cumplimiento legislación laboral colombiana
- Diseño personalizado con identidad SIRIUS

**Estado**: ✅ **LISTO PARA PRODUCCIÓN** 