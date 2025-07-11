# 🧪 **Scripts de Test - SIRIUS Regenerative**

Verificación completa del sistema antes del deploy a producción.

## 📋 **Scripts Disponibles**

### 1. **SQL Test Completo** 
```sql
-- Archivo: scripts/test-complete-system.sql
-- Ejecutar en: Supabase SQL Editor
```

**Verifica:**
- ✅ Estructura de tablas
- ✅ Empleados reales (13 empleados)
- ✅ Admin principal (Luisa Ramírez)
- ✅ Salarios por hora correctos
- ✅ Festivos colombianos (18+ festivos)
- ✅ Relaciones entre tablas
- ✅ Inserción de horas de prueba
- ✅ Cálculos de nómina
- ✅ Verificaciones de seguridad

### 2. **App Connectivity Test**
```bash
# Desde terminal del proyecto:
npm run test-system
```

**Verifica:**
- 🔗 Conectividad con Supabase
- 👥 Autenticación de empleados
- 💰 Cálculos salariales
- 📅 Datos de festivos
- 🔐 Variables de entorno
- ⏰ Inserción en hours_summary

---

## 🚀 **Cómo Ejecutar Tests**

### **Paso 1: Tests SQL (Supabase)**

1. Ir a Supabase Dashboard
2. SQL Editor → New Query
3. Copiar contenido de `scripts/test-complete-system.sql`
4. Ejecutar
5. Verificar que todos muestren ✅

### **Paso 2: Tests de Aplicación**

```bash
# Verificar variables de entorno
cp environment.example .env.local
# Editar .env.local con tus credenciales

# Ejecutar tests
npm run test-system
```

**Output esperado:**
```
🚀 INICIANDO VERIFICACIÓN SISTEMA SIRIUS
✅ Cliente Supabase inicializado

============================================================
🚀 1. CONECTIVIDAD BASE DE DATOS
✅ Conexión a base de datos establecida

============================================================
🚀 2. VERIFICACIÓN EMPLEADOS REALES
ℹ️ Total empleados encontrados: 13
✅ Cantidad correcta de empleados (13)
✅ Admin encontrado: Luisa Ramírez (Coordinadora líder en gestión del ser)
ℹ️ Departamentos activos: Administrativo, Pirólisis, Laboratorio, RAAS
✅ Cantidad correcta de departamentos (4)

============================================================
🚀 3. PRUEBA DE AUTENTICACIÓN
✅ Autenticación exitosa: Luisa Ramírez (Admin)
✅ Autenticación exitosa: Santiago Amaya (Jefe Pirólisis)
✅ Autenticación exitosa: Mario Barrera (Auxiliar)
✅ Autenticación exitosa: Alexandra Orosco (Laboratorio)
✅ Todas las autenticaciones funcionan correctamente

🎯 TODOS LOS TESTS PASARON (7/7)
🎉 SISTEMA VERIFICADO Y LISTO PARA PRODUCCIÓN
```

---

## 🔍 **Verificaciones Específicas**

### **Empleados Reales (13)**
- **Luisa Ramírez** - `1019090206` - Admin ✅
- **Alejandro Uricoechea** - `1018497693` - Director Financiero ✅
- **Santiago Amaya** - `1006534877` - Jefe de pirólisis ✅
- **Mario Barrera** - `1122626299` - Auxiliar operativo ✅
- **Alexandra Orosco** - `1123561461` - Auxiliar operativa ✅
- **David Hernández** - `1006774686` - Ingeniero de desarrollo ✅
- Y 7 empleados más...

### **Departamentos (4)**
- 📊 **Administrativo** (5 empleados)
- 🔥 **Pirólisis** (4 empleados)  
- 🧪 **Laboratorio** (3 empleados)
- 💻 **RAAS** (1 empleado)

### **Rangos Salariales**
- **Mínimo:** $7,579.83/hora
- **Máximo:** $34,782.61/hora
- **Promedio:** ~$15,000/hora

---

## ❌ **Troubleshooting**

### **Error: "Variables de entorno no configuradas"**
```bash
# Verificar archivo .env.local
cat .env.local

# Debe contener:
NEXT_PUBLIC_SUPABASE_URL=tu_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_key
ADMIN_CEDULA=1019090206
```

### **Error: "Employee not found"**
```sql
-- Verificar en Supabase SQL Editor:
SELECT COUNT(*) FROM employees;
-- Debe retornar: 13

SELECT * FROM employees WHERE cedula = '1019090206';
-- Debe retornar: Luisa Ramírez
```

### **Error: "Database connection failed"**
1. Verificar credenciales Supabase
2. Confirmar que el proyecto está activo
3. Revisar Row Level Security policies

---

## ✅ **Criterios de Éxito**

**Para proceder al deploy, TODOS deben ser ✅:**

- [ ] 📋 13 empleados reales cargados
- [ ] 👑 Luisa Ramírez como admin (1019090206)
- [ ] 🏢 4 departamentos configurados
- [ ] 💰 Salarios en rangos correctos ($7K-$35K/h)
- [ ] 📅 18+ festivos colombianos cargados
- [ ] 🔗 Todas las relaciones de tablas funcionando
- [ ] 🔐 Autenticación funcionando para todos
- [ ] ⏰ Inserción de horas exitosa
- [ ] 🔒 Variables de entorno configuradas

**Si alguno falla:** Revisar scripts SQL y configuración antes del deploy.

---

## 🎯 **Deploy Ready Checklist**

Una vez que TODOS los tests pasen ✅:

1. **Scripts ejecutados:**
   - ✅ `scripts/minimal-tables.sql`
   - ✅ `scripts/real-employees-data.sql`  
   - ✅ `scripts/production-logic.sql`

2. **Tests pasando:**
   - ✅ SQL Test completo
   - ✅ App Connectivity Test

3. **Configuración:**
   - ✅ Variables de entorno
   - ✅ Admin configurado
   - ✅ Empleados reales

**🚀 LISTO PARA DEPLOY A VERCEL** 🚀 