-- Script súper simple para Supabase - SIN ERRORES
-- Ejecutar en el SQL Editor de Supabase

-- 1. Crear tabla hours_summary si no existe (LO PRINCIPAL QUE FALTA)
CREATE TABLE IF NOT EXISTS hours_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  horas_ordinarias DECIMAL(4,2) DEFAULT 0,
  horas_extra_diurnas DECIMAL(4,2) DEFAULT 0,
  horas_extra_nocturnas DECIMAL(4,2) DEFAULT 0,
  horas_nocturnas DECIMAL(4,2) DEFAULT 0,
  horas_dominicales_diurnas DECIMAL(4,2) DEFAULT 0,
  total_horas DECIMAL(4,2) DEFAULT 0,
  salario_base DECIMAL(12,2) DEFAULT 0,
  recargo_nocturno DECIMAL(12,2) DEFAULT 0,
  recargo_dominical DECIMAL(12,2) DEFAULT 0,
  extra_diurna DECIMAL(12,2) DEFAULT 0,
  extra_nocturna DECIMAL(12,2) DEFAULT 0,
  extra_dominical_diurna DECIMAL(12,2) DEFAULT 0,
  total_pago DECIMAL(12,2) DEFAULT 0,
  pausas_activas_realizadas INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(employee_id, fecha)
);

-- 2. Agregar salario_hora a employees si no existe
ALTER TABLE employees ADD COLUMN IF NOT EXISTS salario_hora DECIMAL(12,2);

-- 3. Actualizar salario_hora para empleados existentes
UPDATE employees SET salario_hora = ROUND(COALESCE(salario, 1500000) / 192, 2) WHERE salario_hora IS NULL;

-- 4. Limpiar datos de prueba anteriores
DELETE FROM hours_summary WHERE fecha >= CURRENT_DATE - INTERVAL '7 days';
DELETE FROM active_breaks WHERE DATE(fecha_inicio) >= CURRENT_DATE - INTERVAL '7 days';
DELETE FROM time_records WHERE DATE(timestamp) >= CURRENT_DATE - INTERVAL '7 days';

-- 5. Verificar que tenemos empleados suficientes
DO $$
DECLARE
    emp_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO emp_count FROM employees WHERE cedula != '12345678';
    
    IF emp_count < 4 THEN
        -- Crear empleados básicos
        INSERT INTO employees (nombre, cedula, salario, salario_hora) VALUES
        ('Juan Carlos', '11111111', 1500000, 7812.50),
        ('María Elena', '22222222', 1600000, 8333.33),
        ('Carlos Alberto', '33333333', 1550000, 8072.92),
        ('Ana Sofía', '44444444', 1650000, 8593.75)
        ON CONFLICT (cedula) DO NOTHING;
    END IF;
END $$;

-- 6. Generar datos de prueba básicos
INSERT INTO time_records (employee_id, tipo, timestamp, mensaje_motivacional)
SELECT 
    e.id,
    'entrada',
    CURRENT_DATE - INTERVAL '1 day' + TIME '08:00:00',
    'Buenos días! ☀️'
FROM employees e WHERE cedula != '12345678' LIMIT 4;

INSERT INTO time_records (employee_id, tipo, timestamp, mensaje_motivacional)
SELECT 
    e.id,
    'salida',
    CURRENT_DATE - INTERVAL '1 day' + TIME '17:00:00',
    'Excelente día! 🌟'
FROM employees e WHERE cedula != '12345678' LIMIT 4;

-- 7. Generar hours_summary básico
INSERT INTO hours_summary (employee_id, fecha, horas_ordinarias, total_horas, salario_base, total_pago)
SELECT 
    e.id,
    CURRENT_DATE - INTERVAL '1 day',
    8.0,
    8.0,
    e.salario_hora * 8,
    e.salario_hora * 8
FROM employees e 
WHERE cedula != '12345678' AND e.salario_hora IS NOT NULL
LIMIT 4;

-- 8. Verificar que todo funcionó
SELECT 
    'Tabla hours_summary creada' as estado,
    COUNT(*) as registros
FROM hours_summary;

SELECT 
    'Empleados con salario_hora' as estado,
    COUNT(*) as empleados
FROM employees 
WHERE salario_hora IS NOT NULL AND cedula != '12345678'; 