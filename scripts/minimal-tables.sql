-- Script para crear tablas con empleados reales SIRIUS
-- Ejecutar en SQL Editor de Supabase

-- 1. CREAR TABLA EMPLOYEES PRIMERO (con campos completos para empleados reales)
CREATE TABLE IF NOT EXISTS employees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cedula VARCHAR(12) UNIQUE NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  apodo VARCHAR(50),
  salario DECIMAL(10, 2) NOT NULL, -- Salario por hora
  cargo VARCHAR(100) NOT NULL, -- Campo agregado para empleados reales
  departamento VARCHAR(50) NOT NULL, -- Campo agregado para empleados reales
  pausas_activas_enabled BOOLEAN DEFAULT true,
  racha_pausas INTEGER DEFAULT 0,
  emoji_favorito VARCHAR(10) DEFAULT '😊',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Crear tabla holidays
CREATE TABLE IF NOT EXISTS holidays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha DATE UNIQUE NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Crear tabla hours_summary (DESPUÉS de employees)
CREATE TABLE IF NOT EXISTS hours_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  horas_ordinarias DECIMAL(4,2) DEFAULT 0,
  horas_extra_diurnas DECIMAL(4,2) DEFAULT 0,
  horas_extra_nocturnas DECIMAL(4,2) DEFAULT 0,
  horas_nocturnas DECIMAL(4,2) DEFAULT 0,
  horas_dominicales_diurnas DECIMAL(4,2) DEFAULT 0,
  horas_dominicales_nocturnas DECIMAL(4,2) DEFAULT 0,
  horas_festivas_diurnas DECIMAL(4,2) DEFAULT 0,
  horas_festivas_nocturnas DECIMAL(4,2) DEFAULT 0,
  total_horas DECIMAL(4,2) DEFAULT 0,
  salario_base DECIMAL(12,2) DEFAULT 0,
  recargo_nocturno DECIMAL(12,2) DEFAULT 0,
  recargo_dominical DECIMAL(12,2) DEFAULT 0,
  recargo_festivo DECIMAL(12,2) DEFAULT 0,
  extra_diurna DECIMAL(12,2) DEFAULT 0,
  extra_nocturna DECIMAL(12,2) DEFAULT 0,
  extra_dominical_diurna DECIMAL(12,2) DEFAULT 0,
  extra_dominical_nocturna DECIMAL(12,2) DEFAULT 0,
  extra_festiva_diurna DECIMAL(12,2) DEFAULT 0,
  extra_festiva_nocturna DECIMAL(12,2) DEFAULT 0,
  total_pago DECIMAL(12,2) DEFAULT 0,
  pausas_activas_realizadas INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(employee_id, fecha)
);

-- 4. Crear tabla time_records
CREATE TABLE IF NOT EXISTS time_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('entrada', 'salida', 'pausa_inicio', 'pausa_fin')),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Crear tabla active_breaks
CREATE TABLE IF NOT EXISTS active_breaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  tipo VARCHAR(50) NOT NULL,
  duracion INTEGER NOT NULL, -- en minutos
  completada BOOLEAN DEFAULT false,
  fecha DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Crear tabla achievements
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  tipo VARCHAR(50) NOT NULL,
  descripcion TEXT,
  puntos INTEGER DEFAULT 0,
  fecha DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Crear tabla overtime_requests
CREATE TABLE IF NOT EXISTS overtime_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  fecha_solicitud DATE NOT NULL,
  horas_solicitadas DECIMAL(4,2) NOT NULL,
  motivo TEXT,
  estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aprobada', 'rechazada')),
  aprobada_por UUID REFERENCES employees(id),
  fecha_aprobacion TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Verificar que las tablas se crearon correctamente
SELECT 'employees' as tabla, 
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'employees') 
            THEN 'CREADA ✅' 
            ELSE 'ERROR ❌' 
       END as estado
UNION ALL
SELECT 'holidays' as tabla,
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'holidays') 
            THEN 'CREADA ✅' 
            ELSE 'ERROR ❌' 
       END as estado
UNION ALL
SELECT 'hours_summary' as tabla,
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'hours_summary') 
            THEN 'CREADA ✅' 
            ELSE 'ERROR ❌' 
       END as estado
UNION ALL
SELECT 'time_records' as tabla,
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'time_records') 
            THEN 'CREADA ✅' 
            ELSE 'ERROR ❌' 
       END as estado; 