-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de empleados
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cedula VARCHAR(20) UNIQUE NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  apodo VARCHAR(50), -- Para personalizar mensajes
  salario DECIMAL(12,2) NOT NULL,
  pausas_activas_enabled BOOLEAN DEFAULT true,
  racha_pausas INTEGER DEFAULT 0, -- Días consecutivos con pausas
  emoji_favorito VARCHAR(10) DEFAULT '🌱', -- Para personalización
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de registros de tiempo
CREATE TABLE time_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('entrada', 'inicio_almuerzo', 'fin_almuerzo', 'salida', 'inicio_pausa_activa', 'fin_pausa_activa')),
  timestamp TIMESTAMP NOT NULL,
  mensaje_motivacional TEXT, -- Mensaje aleatorio al registrar
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de pausas activas
CREATE TABLE active_breaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  fecha_inicio TIMESTAMP NOT NULL,
  fecha_fin TIMESTAMP,
  duracion_segundos INTEGER,
  tipo VARCHAR(50) DEFAULT 'respiracion' CHECK (tipo IN ('respiracion', 'estiramiento', 'caminata', 'gratitud')),
  completada BOOLEAN DEFAULT false,
  estado_animo_antes VARCHAR(20) CHECK (estado_animo_antes IN ('estresado', 'cansado', 'bien', 'feliz')),
  estado_animo_despues VARCHAR(20) CHECK (estado_animo_despues IN ('estresado', 'cansado', 'bien', 'feliz')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de mensajes motivacionales
CREATE TABLE motivational_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('entrada', 'almuerzo', 'pausa_activa', 'salida', 'logro')),
  mensaje TEXT NOT NULL,
  emoji VARCHAR(10),
  activo BOOLEAN DEFAULT true
);

-- Tabla de logros/achievements
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  tipo VARCHAR(50) NOT NULL, -- 'primera_pausa', 'semana_completa', 'mes_pausas', etc
  fecha DATE NOT NULL,
  mensaje TEXT,
  celebrado BOOLEAN DEFAULT false
);

-- Tabla de solicitudes de horas extra
CREATE TABLE overtime_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  fecha_solicitud DATE NOT NULL,
  horas_extra INTEGER NOT NULL,
  razon TEXT NOT NULL,
  estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aprobada', 'rechazada')),
  aprobada_por UUID REFERENCES employees(id),
  fecha_respuesta TIMESTAMP,
  comentario_admin TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de horarios de trabajo
CREATE TABLE work_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  dia_semana INTEGER NOT NULL CHECK (dia_semana BETWEEN 0 AND 6), -- 0=Domingo, 6=Sábado
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para optimizar consultas
CREATE INDEX idx_time_records_employee_date ON time_records(employee_id, DATE(timestamp));
CREATE INDEX idx_active_breaks_employee_date ON active_breaks(employee_id, DATE(fecha_inicio));
CREATE INDEX idx_achievements_employee ON achievements(employee_id);
CREATE INDEX idx_overtime_requests_employee ON overtime_requests(employee_id);
CREATE INDEX idx_work_schedules_employee ON work_schedules(employee_id);

-- Función para calcular horas trabajadas en un día
CREATE OR REPLACE FUNCTION calculate_hours_worked(emp_id UUID, work_date DATE)
RETURNS INTERVAL AS $$
DECLARE
  entrada_time TIMESTAMP;
  salida_time TIMESTAMP;
  inicio_almuerzo_time TIMESTAMP;
  fin_almuerzo_time TIMESTAMP;
  total_work_time INTERVAL;
  lunch_time INTERVAL;
BEGIN
  -- Obtener entrada del día
  SELECT timestamp INTO entrada_time
  FROM time_records 
  WHERE employee_id = emp_id 
    AND DATE(timestamp) = work_date 
    AND tipo = 'entrada'
  ORDER BY timestamp DESC
  LIMIT 1;

  -- Obtener salida del día
  SELECT timestamp INTO salida_time
  FROM time_records 
  WHERE employee_id = emp_id 
    AND DATE(timestamp) = work_date 
    AND tipo = 'salida'
  ORDER BY timestamp DESC
  LIMIT 1;

  -- Obtener inicio de almuerzo
  SELECT timestamp INTO inicio_almuerzo_time
  FROM time_records 
  WHERE employee_id = emp_id 
    AND DATE(timestamp) = work_date 
    AND tipo = 'inicio_almuerzo'
  ORDER BY timestamp DESC
  LIMIT 1;

  -- Obtener fin de almuerzo
  SELECT timestamp INTO fin_almuerzo_time
  FROM time_records 
  WHERE employee_id = emp_id 
    AND DATE(timestamp) = work_date 
    AND tipo = 'fin_almuerzo'
  ORDER BY timestamp DESC
  LIMIT 1;

  -- Si no hay entrada o salida, retornar 0
  IF entrada_time IS NULL OR salida_time IS NULL THEN
    RETURN INTERVAL '0 hours';
  END IF;

  -- Calcular tiempo total
  total_work_time := salida_time - entrada_time;

  -- Restar tiempo de almuerzo si existe
  IF inicio_almuerzo_time IS NOT NULL AND fin_almuerzo_time IS NOT NULL THEN
    lunch_time := fin_almuerzo_time - inicio_almuerzo_time;
    total_work_time := total_work_time - lunch_time;
  END IF;

  RETURN total_work_time;
END;
$$ LANGUAGE plpgsql;

-- Función para verificar si es horario nocturno
CREATE OR REPLACE FUNCTION is_night_time(work_timestamp TIMESTAMP)
RETURNS BOOLEAN AS $$
BEGIN
  -- Horario nocturno: 9:00 PM - 6:00 AM
  RETURN EXTRACT(HOUR FROM work_timestamp) >= 21 OR EXTRACT(HOUR FROM work_timestamp) < 6;
END;
$$ LANGUAGE plpgsql;

-- Función para verificar si es domingo o festivo
CREATE OR REPLACE FUNCTION is_weekend_or_holiday(work_date DATE)
RETURNS BOOLEAN AS $$
BEGIN
  -- Por simplicidad, solo verificamos domingo (día 0)
  -- En una implementación real, se agregaría una tabla de festivos
  RETURN EXTRACT(DOW FROM work_date) = 0;
END;
$$ LANGUAGE plpgsql;

-- Vista para dashboard administrativo
CREATE VIEW employee_daily_summary AS
SELECT 
  e.id as employee_id,
  e.nombre,
  e.apodo,
  e.emoji_favorito,
  e.racha_pausas,
  DATE(tr.timestamp) as fecha,
  calculate_hours_worked(e.id, DATE(tr.timestamp)) as horas_trabajadas,
  COUNT(ab.id) as pausas_activas_realizadas,
  CASE 
    WHEN COUNT(ab.id) >= 3 THEN true 
    ELSE false 
  END as meta_pausas_cumplida
FROM employees e
LEFT JOIN time_records tr ON e.id = tr.employee_id
LEFT JOIN active_breaks ab ON e.id = ab.employee_id 
  AND ab.completada = true 
  AND DATE(ab.fecha_inicio) = DATE(tr.timestamp)
WHERE DATE(tr.timestamp) >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY e.id, e.nombre, e.apodo, e.emoji_favorito, e.racha_pausas, DATE(tr.timestamp)
ORDER BY fecha DESC, e.nombre; 