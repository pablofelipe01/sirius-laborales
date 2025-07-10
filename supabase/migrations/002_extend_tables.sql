-- Extensión de Base de Datos para Sistema de Horas Laborales
-- Migración 002: Tablas adicionales para recargos y festivos

-- Tabla de festivos colombianos
CREATE TABLE holidays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha DATE UNIQUE NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  tipo VARCHAR(50) NOT NULL DEFAULT 'nacional', -- 'nacional', 'regional'
  es_movil BOOLEAN DEFAULT false, -- Si se mueve al lunes cuando cae martes-sábado
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de resumen diario de horas trabajadas con desglose
CREATE TABLE hours_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  
  -- Horas trabajadas por tipo
  horas_ordinarias DECIMAL(4,2) DEFAULT 0,
  horas_extra_diurnas DECIMAL(4,2) DEFAULT 0,
  horas_extra_nocturnas DECIMAL(4,2) DEFAULT 0,
  horas_nocturnas DECIMAL(4,2) DEFAULT 0, -- Solo recargo nocturno, no extra
  horas_dominicales_diurnas DECIMAL(4,2) DEFAULT 0,
  horas_dominicales_nocturnas DECIMAL(4,2) DEFAULT 0,
  horas_festivas_diurnas DECIMAL(4,2) DEFAULT 0,
  horas_festivas_nocturnas DECIMAL(4,2) DEFAULT 0,
  
  -- Total de horas trabajadas
  total_horas DECIMAL(4,2) DEFAULT 0,
  
  -- Montos calculados para nómina
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
  
  -- Total a pagar
  total_pago DECIMAL(12,2) DEFAULT 0,
  
  -- Metadatos
  pausas_activas_realizadas INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(employee_id, fecha)
);

-- Tabla de solicitudes de horas extras/festivas
CREATE TABLE overtime_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  tipo VARCHAR(50) NOT NULL, -- 'extra', 'dominical', 'festivo'
  horas_estimadas DECIMAL(4,2),
  motivo TEXT,
  justificacion TEXT, -- Justificación empresarial
  
  -- Estado de la solicitud
  estado VARCHAR(20) DEFAULT 'pendiente', -- 'pendiente', 'aprobado', 'rechazado'
  aprobado_por UUID REFERENCES employees(id),
  aprobado_en TIMESTAMP,
  comentarios_aprobacion TEXT,
  
  -- Auditoría
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Agregar campos faltantes a employees para salario por hora
ALTER TABLE employees ADD COLUMN IF NOT EXISTS salario_hora DECIMAL(12,2);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS cargo VARCHAR(100);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS departamento VARCHAR(100);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS fecha_ingreso DATE;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT true;

-- Índices para optimización
CREATE INDEX idx_hours_summary_employee_fecha ON hours_summary(employee_id, fecha);
CREATE INDEX idx_hours_summary_fecha ON hours_summary(fecha);
CREATE INDEX idx_overtime_requests_employee ON overtime_requests(employee_id);
CREATE INDEX idx_overtime_requests_estado ON overtime_requests(estado);
CREATE INDEX idx_overtime_requests_fecha ON overtime_requests(fecha);
CREATE INDEX idx_holidays_fecha ON holidays(fecha);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_hours_summary_updated_at 
    BEFORE UPDATE ON hours_summary 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_overtime_requests_updated_at 
    BEFORE UPDATE ON overtime_requests 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insertar festivos colombianos 2025
INSERT INTO holidays (fecha, nombre, tipo, es_movil) VALUES
('2025-01-01', 'Año Nuevo', 'nacional', false),
('2025-01-06', 'Día de los Reyes Magos', 'nacional', true),
('2025-03-24', 'Día de San José', 'nacional', true),
('2025-04-13', 'Jueves Santo', 'nacional', false),
('2025-04-14', 'Viernes Santo', 'nacional', false),
('2025-05-01', 'Día del Trabajo', 'nacional', false),
('2025-05-26', 'Ascensión del Señor', 'nacional', true),
('2025-06-16', 'Corpus Christi', 'nacional', true),
('2025-06-23', 'Sagrado Corazón de Jesús', 'nacional', true),
('2025-06-30', 'San Pedro y San Pablo', 'nacional', true),
('2025-07-20', 'Día de la Independencia', 'nacional', false),
('2025-08-07', 'Batalla de Boyacá', 'nacional', false),
('2025-08-18', 'Asunción de la Virgen', 'nacional', true),
('2025-10-13', 'Día de la Raza', 'nacional', true),
('2025-11-03', 'Día de Todos los Santos', 'nacional', true),
('2025-11-17', 'Independencia de Cartagena', 'nacional', true),
('2025-12-08', 'Día de la Inmaculada Concepción', 'nacional', false),
('2025-12-25', 'Navidad', 'nacional', false);

-- Actualizar empleados existentes con salario por hora
-- Suponiendo salario mensual promedio colombiano y 192 horas mensuales (44h/semana * 4.33 semanas)
UPDATE employees SET 
  salario_hora = ROUND(salario / 192, 2),
  cargo = CASE 
    WHEN nombre = 'Luisa' THEN 'Gerente General'
    ELSE 'Empleado'
  END,
  departamento = CASE 
    WHEN nombre = 'Luisa' THEN 'Administración'
    ELSE 'Operaciones'
  END,
  fecha_ingreso = CURRENT_DATE - INTERVAL '1 year',
  activo = true
WHERE salario_hora IS NULL;

-- Función para calcular horas semanales de un empleado
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

-- Función para verificar si una fecha es festivo
CREATE OR REPLACE FUNCTION is_holiday(check_date DATE)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM holidays 
        WHERE fecha = check_date
    );
END;
$$ LANGUAGE plpgsql;

-- Vista para obtener resumen de horas por empleado y período
CREATE OR REPLACE VIEW employee_hours_summary AS
SELECT 
    e.id as employee_id,
    e.nombre,
    e.cedula,
    e.salario_hora,
    hs.fecha,
    hs.total_horas,
    hs.horas_ordinarias,
    hs.horas_extra_diurnas + hs.horas_extra_nocturnas as total_horas_extra,
    hs.recargo_nocturno + hs.recargo_dominical + hs.recargo_festivo as total_recargos,
    hs.total_pago,
    -- Verificar si es domingo o festivo
    EXTRACT(DOW FROM hs.fecha) = 0 as es_domingo,
    is_holiday(hs.fecha) as es_festivo
FROM employees e
LEFT JOIN hours_summary hs ON e.id = hs.employee_id
WHERE e.activo = true;

COMMENT ON TABLE holidays IS 'Calendario oficial de festivos colombianos';
COMMENT ON TABLE hours_summary IS 'Resumen diario de horas trabajadas con desglose completo';
COMMENT ON TABLE overtime_requests IS 'Solicitudes de autorización para horas extras y trabajo en festivos';
COMMENT ON VIEW employee_hours_summary IS 'Vista consolidada de horas trabajadas por empleado'; 