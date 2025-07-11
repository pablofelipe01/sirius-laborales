-- Script MÍNIMO para crear solo las tablas esenciales
-- Ejecutar en SQL Editor de Supabase

-- 1. Crear tabla holidays básica
CREATE TABLE IF NOT EXISTS holidays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha DATE UNIQUE NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Crear tabla hours_summary básica
CREATE TABLE IF NOT EXISTS hours_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  horas_ordinarias DECIMAL(4,2) DEFAULT 0,
  horas_extra_diurnas DECIMAL(4,2) DEFAULT 0,
  total_horas DECIMAL(4,2) DEFAULT 0,
  salario_base DECIMAL(12,2) DEFAULT 0,
  total_pago DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(employee_id, fecha)
);

-- 3. Agregar salario_hora a employees
ALTER TABLE employees ADD COLUMN IF NOT EXISTS salario_hora DECIMAL(12,2);

-- 4. Verificar que las tablas se crearon
SELECT 'holidays' as tabla, 
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'holidays') 
            THEN 'CREADA' 
            ELSE 'ERROR' 
       END as estado
UNION ALL
SELECT 'hours_summary' as tabla,
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'hours_summary') 
            THEN 'CREADA' 
            ELSE 'ERROR' 
       END as estado; 

-- Crear tabla employees con campos completos para empleados reales
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