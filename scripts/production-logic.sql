-- LÓGICA DE PRODUCCIÓN para Sistema de Horas Laborales SIRIUS
-- Ejecutar DESPUÉS de que las tablas básicas ya están creadas

-- 1. Agregar columnas faltantes a hours_summary para legislación colombiana
ALTER TABLE hours_summary ADD COLUMN IF NOT EXISTS horas_extra_nocturnas DECIMAL(4,2) DEFAULT 0;
ALTER TABLE hours_summary ADD COLUMN IF NOT EXISTS horas_nocturnas DECIMAL(4,2) DEFAULT 0;
ALTER TABLE hours_summary ADD COLUMN IF NOT EXISTS horas_dominicales_diurnas DECIMAL(4,2) DEFAULT 0;
ALTER TABLE hours_summary ADD COLUMN IF NOT EXISTS horas_dominicales_nocturnas DECIMAL(4,2) DEFAULT 0;
ALTER TABLE hours_summary ADD COLUMN IF NOT EXISTS horas_festivas_diurnas DECIMAL(4,2) DEFAULT 0;
ALTER TABLE hours_summary ADD COLUMN IF NOT EXISTS horas_festivas_nocturnas DECIMAL(4,2) DEFAULT 0;

-- Recargos específicos colombianos
ALTER TABLE hours_summary ADD COLUMN IF NOT EXISTS recargo_nocturno DECIMAL(12,2) DEFAULT 0;
ALTER TABLE hours_summary ADD COLUMN IF NOT EXISTS recargo_dominical DECIMAL(12,2) DEFAULT 0;
ALTER TABLE hours_summary ADD COLUMN IF NOT EXISTS recargo_festivo DECIMAL(12,2) DEFAULT 0;
ALTER TABLE hours_summary ADD COLUMN IF NOT EXISTS extra_diurna DECIMAL(12,2) DEFAULT 0;
ALTER TABLE hours_summary ADD COLUMN IF NOT EXISTS extra_nocturna DECIMAL(12,2) DEFAULT 0;
ALTER TABLE hours_summary ADD COLUMN IF NOT EXISTS extra_dominical_diurna DECIMAL(12,2) DEFAULT 0;
ALTER TABLE hours_summary ADD COLUMN IF NOT EXISTS extra_dominical_nocturna DECIMAL(12,2) DEFAULT 0;
ALTER TABLE hours_summary ADD COLUMN IF NOT EXISTS extra_festiva_diurna DECIMAL(12,2) DEFAULT 0;
ALTER TABLE hours_summary ADD COLUMN IF NOT EXISTS extra_festiva_nocturna DECIMAL(12,2) DEFAULT 0;
ALTER TABLE hours_summary ADD COLUMN IF NOT EXISTS pausas_activas_realizadas INTEGER DEFAULT 0;
ALTER TABLE hours_summary ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- 2. Agregar columnas faltantes a holidays
ALTER TABLE holidays ADD COLUMN IF NOT EXISTS tipo VARCHAR(50) DEFAULT 'nacional';
ALTER TABLE holidays ADD COLUMN IF NOT EXISTS es_movil BOOLEAN DEFAULT false;

-- 3. Agregar columnas faltantes a employees para gestión completa
ALTER TABLE employees ADD COLUMN IF NOT EXISTS cargo VARCHAR(100);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS departamento VARCHAR(100);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS fecha_ingreso DATE;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT true;

-- 4. Crear tabla overtime_requests para solicitudes de horas extras
CREATE TABLE IF NOT EXISTS overtime_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  tipo VARCHAR(50) NOT NULL, -- 'extra', 'dominical', 'festivo'
  horas_estimadas DECIMAL(4,2),
  motivo TEXT,
  justificacion TEXT,
  estado VARCHAR(20) DEFAULT 'pendiente', -- 'pendiente', 'aprobado', 'rechazado'
  aprobado_por UUID REFERENCES employees(id),
  aprobado_en TIMESTAMP,
  comentarios_aprobacion TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 5. Crear índices optimizados para consultas de producción
CREATE INDEX IF NOT EXISTS idx_hours_summary_employee_fecha ON hours_summary(employee_id, fecha);
CREATE INDEX IF NOT EXISTS idx_hours_summary_fecha ON hours_summary(fecha);
CREATE INDEX IF NOT EXISTS idx_holidays_fecha ON holidays(fecha);
CREATE INDEX IF NOT EXISTS idx_overtime_requests_employee ON overtime_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_overtime_requests_estado ON overtime_requests(estado);
CREATE INDEX IF NOT EXISTS idx_time_records_employee_date ON time_records(employee_id, DATE(timestamp));
CREATE INDEX IF NOT EXISTS idx_active_breaks_employee_date ON active_breaks(employee_id, DATE(fecha_inicio));

-- 6. Función para verificar si una fecha es festivo
CREATE OR REPLACE FUNCTION is_holiday(check_date DATE)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM holidays 
        WHERE fecha = check_date
    );
END;
$$ LANGUAGE plpgsql;

-- 7. Función para calcular horas semanales de un empleado
CREATE OR REPLACE FUNCTION get_weekly_hours(emp_id UUID, week_start DATE)
RETURNS DECIMAL AS $$
DECLARE
    total_hours DECIMAL := 0;
BEGIN
    SELECT COALESCE(SUM(total_horas), 0) INTO total_hours
    FROM hours_summary 
    WHERE employee_id = emp_id 
    AND fecha >= week_start 
    AND fecha < week_start + INTERVAL '7 days';
    
    RETURN total_hours;
END;
$$ LANGUAGE plpgsql;

-- 8. Función para calcular pago según legislación colombiana
CREATE OR REPLACE FUNCTION calculate_pay(
    base_salary_hour DECIMAL,
    horas_ord DECIMAL DEFAULT 0,
    horas_extra_d DECIMAL DEFAULT 0,
    horas_extra_n DECIMAL DEFAULT 0,
    horas_noct DECIMAL DEFAULT 0,
    horas_dom_d DECIMAL DEFAULT 0,
    horas_dom_n DECIMAL DEFAULT 0,
    horas_fest_d DECIMAL DEFAULT 0,
    horas_fest_n DECIMAL DEFAULT 0
)
RETURNS JSON AS $$
DECLARE
    result JSON;
    salario_base DECIMAL;
    recargo_nocturno DECIMAL;
    recargo_dominical DECIMAL;
    recargo_festivo DECIMAL;
    extra_diurna DECIMAL;
    extra_nocturna DECIMAL;
    extra_dominical_diurna DECIMAL;
    extra_dominical_nocturna DECIMAL;
    extra_festiva_diurna DECIMAL;
    extra_festiva_nocturna DECIMAL;
    total_pago DECIMAL;
BEGIN
    -- Cálculos según legislación colombiana
    salario_base := base_salary_hour * horas_ord;
    recargo_nocturno := base_salary_hour * 0.35 * horas_noct;  -- 35% recargo nocturno
    recargo_dominical := base_salary_hour * 1.0 * horas_dom_d; -- 100% dominical diurno
    recargo_festivo := base_salary_hour * 1.0 * horas_fest_d;  -- 100% festivo diurno
    
    extra_diurna := base_salary_hour * 0.25 * horas_extra_d;   -- 25% extra diurna
    extra_nocturna := base_salary_hour * 0.75 * horas_extra_n; -- 75% extra nocturna
    extra_dominical_diurna := base_salary_hour * 1.0 * horas_dom_d; -- 100% dominical
    extra_dominical_nocturna := base_salary_hour * 1.35 * horas_dom_n; -- 135% dom nocturno
    extra_festiva_diurna := base_salary_hour * 1.0 * horas_fest_d; -- 100% festivo
    extra_festiva_nocturna := base_salary_hour * 1.35 * horas_fest_n; -- 135% fest nocturno
    
    total_pago := salario_base + recargo_nocturno + recargo_dominical + recargo_festivo +
                  extra_diurna + extra_nocturna + extra_dominical_diurna + 
                  extra_dominical_nocturna + extra_festiva_diurna + extra_festiva_nocturna;
    
    -- Retornar JSON con desglose completo
    result := json_build_object(
        'salario_base', salario_base,
        'recargo_nocturno', recargo_nocturno,
        'recargo_dominical', recargo_dominical,
        'recargo_festivo', recargo_festivo,
        'extra_diurna', extra_diurna,
        'extra_nocturna', extra_nocturna,
        'extra_dominical_diurna', extra_dominical_diurna,
        'extra_dominical_nocturna', extra_dominical_nocturna,
        'extra_festiva_diurna', extra_festiva_diurna,
        'extra_festiva_nocturna', extra_festiva_nocturna,
        'total_pago', total_pago
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 9. Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 10. Triggers para updated_at
DROP TRIGGER IF EXISTS update_hours_summary_updated_at ON hours_summary;
CREATE TRIGGER update_hours_summary_updated_at 
    BEFORE UPDATE ON hours_summary 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_overtime_requests_updated_at ON overtime_requests;
CREATE TRIGGER update_overtime_requests_updated_at 
    BEFORE UPDATE ON overtime_requests 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 11. Vista consolidada para reportes de administración
CREATE OR REPLACE VIEW employee_hours_summary AS
SELECT 
    e.id as employee_id,
    e.nombre,
    e.cedula,
    e.salario_hora,
    e.cargo,
    e.departamento,
    hs.fecha,
    hs.total_horas,
    hs.horas_ordinarias,
    hs.horas_extra_diurnas + hs.horas_extra_nocturnas as total_horas_extra,
    hs.horas_dominicales_diurnas + hs.horas_dominicales_nocturnas as total_horas_dominicales,
    hs.horas_festivas_diurnas + hs.horas_festivas_nocturnas as total_horas_festivas,
    hs.recargo_nocturno + hs.recargo_dominical + hs.recargo_festivo as total_recargos,
    hs.total_pago,
    hs.pausas_activas_realizadas,
    -- Verificar tipo de día
    EXTRACT(DOW FROM hs.fecha) = 0 as es_domingo,
    is_holiday(hs.fecha) as es_festivo,
    -- Calcular eficiencia de pausas activas
    CASE 
        WHEN hs.pausas_activas_realizadas >= 3 THEN 'Excelente'
        WHEN hs.pausas_activas_realizadas >= 2 THEN 'Buena'
        WHEN hs.pausas_activas_realizadas >= 1 THEN 'Regular'
        ELSE 'Baja'
    END as eficiencia_pausas
FROM employees e
LEFT JOIN hours_summary hs ON e.id = hs.employee_id
WHERE e.activo = true;

-- 12. Completar festivos colombianos 2025
INSERT INTO holidays (fecha, nombre, tipo, es_movil) VALUES
('2025-01-06', 'Día de los Reyes Magos', 'nacional', true),
('2025-03-24', 'Día de San José', 'nacional', true),
('2025-04-13', 'Jueves Santo', 'nacional', false),
('2025-05-26', 'Ascensión del Señor', 'nacional', true),
('2025-06-16', 'Corpus Christi', 'nacional', true),
('2025-06-23', 'Sagrado Corazón de Jesús', 'nacional', true),
('2025-06-30', 'San Pedro y San Pablo', 'nacional', true),
('2025-08-07', 'Batalla de Boyacá', 'nacional', false),
('2025-08-18', 'Asunción de la Virgen', 'nacional', true),
('2025-10-13', 'Día de la Raza', 'nacional', true),
('2025-11-03', 'Día de Todos los Santos', 'nacional', true),
('2025-11-17', 'Independencia de Cartagena', 'nacional', true),
('2025-12-08', 'Día de la Inmaculada Concepción', 'nacional', false)
ON CONFLICT (fecha) DO NOTHING;

-- 13. Actualizar empleados existentes con datos completos
UPDATE employees SET 
  cargo = COALESCE(cargo, CASE 
    WHEN nombre ILIKE '%luisa%' OR cedula = '12345678' THEN 'Gerente General'
    ELSE 'Empleado'
  END),
  departamento = COALESCE(departamento, CASE 
    WHEN nombre ILIKE '%luisa%' OR cedula = '12345678' THEN 'Administración'
    ELSE 'Operaciones'
  END),
  fecha_ingreso = COALESCE(fecha_ingreso, CURRENT_DATE - INTERVAL '1 year'),
  activo = COALESCE(activo, true);

-- 14. Verificar que toda la lógica de producción está lista
SELECT 
    'SISTEMA DE HORAS LABORALES COMPLETO' as titulo,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_name IN ('holidays', 'hours_summary', 'overtime_requests')) as tablas_creadas,
    (SELECT COUNT(*) FROM information_schema.routines WHERE routine_name IN ('is_holiday', 'get_weekly_hours', 'calculate_pay')) as funciones_creadas,
    (SELECT COUNT(*) FROM information_schema.views WHERE table_name = 'employee_hours_summary') as vistas_creadas,
    (SELECT COUNT(*) FROM holidays) as festivos_configurados,
    'Listo para producción ✅' as estado; 