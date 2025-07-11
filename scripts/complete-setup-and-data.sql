-- Script completo: Migración + Datos de Prueba para Supabase
-- Ejecutar directamente en el editor SQL de Supabase

-- ===============================================
-- PARTE 1: VERIFICAR Y CREAR TABLAS NECESARIAS
-- ===============================================

-- 1. Crear tabla de festivos si no existe
CREATE TABLE IF NOT EXISTS holidays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha DATE UNIQUE NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  tipo VARCHAR(50) NOT NULL DEFAULT 'nacional',
  es_movil BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Crear tabla hours_summary si no existe
CREATE TABLE IF NOT EXISTS hours_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  
  -- Horas trabajadas por tipo
  horas_ordinarias DECIMAL(4,2) DEFAULT 0,
  horas_extra_diurnas DECIMAL(4,2) DEFAULT 0,
  horas_extra_nocturnas DECIMAL(4,2) DEFAULT 0,
  horas_nocturnas DECIMAL(4,2) DEFAULT 0,
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

-- 3. Crear tabla overtime_requests si no existe
CREATE TABLE IF NOT EXISTS overtime_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  horas_estimadas DECIMAL(4,2),
  motivo TEXT,
  justificacion TEXT,
  
  -- Estado de la solicitud
  estado VARCHAR(20) DEFAULT 'pendiente',
  aprobado_por UUID REFERENCES employees(id),
  aprobado_en TIMESTAMP,
  comentarios_aprobacion TEXT,
  
  -- Auditoría
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. Agregar campos faltantes a employees si no existen
DO $$
BEGIN
    -- Verificar y agregar columnas una por una
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'salario_hora') THEN
        ALTER TABLE employees ADD COLUMN salario_hora DECIMAL(12,2);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'cargo') THEN
        ALTER TABLE employees ADD COLUMN cargo VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'departamento') THEN
        ALTER TABLE employees ADD COLUMN departamento VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'fecha_ingreso') THEN
        ALTER TABLE employees ADD COLUMN fecha_ingreso DATE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'activo') THEN
        ALTER TABLE employees ADD COLUMN activo BOOLEAN DEFAULT true;
    END IF;
END $$;

-- 5. Crear índices si no existen
CREATE INDEX IF NOT EXISTS idx_hours_summary_employee_fecha ON hours_summary(employee_id, fecha);
CREATE INDEX IF NOT EXISTS idx_hours_summary_fecha ON hours_summary(fecha);
CREATE INDEX IF NOT EXISTS idx_overtime_requests_employee ON overtime_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_holidays_fecha ON holidays(fecha);

-- 6. Crear o reemplazar función de actualización de timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 7. Crear triggers si no existen
DROP TRIGGER IF EXISTS update_hours_summary_updated_at ON hours_summary;
CREATE TRIGGER update_hours_summary_updated_at 
    BEFORE UPDATE ON hours_summary 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_overtime_requests_updated_at ON overtime_requests;
CREATE TRIGGER update_overtime_requests_updated_at 
    BEFORE UPDATE ON overtime_requests 
    FOR EACH ROW EXECUTE FUNCTION update_overtime_requests_updated_at_column();

-- 8. Insertar festivos 2025 si no existen
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
('2025-12-25', 'Navidad', 'nacional', false)
ON CONFLICT (fecha) DO NOTHING;

-- 9. Actualizar empleados con datos base
UPDATE employees SET 
  salario_hora = COALESCE(salario_hora, ROUND(COALESCE(salario, 1500000) / 192, 2)),
  cargo = COALESCE(cargo, CASE 
    WHEN nombre ILIKE '%luisa%' OR cedula = '12345678' THEN 'Gerente General'
    ELSE 'Empleado'
  END),
  departamento = COALESCE(departamento, CASE 
    WHEN nombre ILIKE '%luisa%' OR cedula = '12345678' THEN 'Administración'
    ELSE 'Operaciones'
  END),
  fecha_ingreso = COALESCE(fecha_ingreso, CURRENT_DATE - INTERVAL '1 year'),
  activo = COALESCE(activo, true)
WHERE salario_hora IS NULL OR cargo IS NULL;

-- 10. Crear funciones auxiliares
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

CREATE OR REPLACE FUNCTION is_holiday(check_date DATE)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM holidays 
        WHERE fecha = check_date
    );
END;
$$ LANGUAGE plpgsql;

-- ===============================================
-- PARTE 2: LIMPIAR Y GENERAR DATOS DE PRUEBA
-- ===============================================

-- 11. Limpiar datos de prueba existentes de la última semana
DELETE FROM hours_summary WHERE fecha >= CURRENT_DATE - INTERVAL '7 days';
DELETE FROM active_breaks WHERE DATE(fecha_inicio) >= CURRENT_DATE - INTERVAL '7 days';
DELETE FROM time_records WHERE DATE(timestamp) >= CURRENT_DATE - INTERVAL '7 days';

-- 12. Generar datos de prueba para la semana pasada
DO $$
DECLARE
    lunes DATE := CURRENT_DATE - INTERVAL '7 days' - (EXTRACT(DOW FROM CURRENT_DATE - INTERVAL '7 days') - 1) * INTERVAL '1 day';
    martes DATE := lunes + INTERVAL '1 day';
    miercoles DATE := lunes + INTERVAL '2 days';
    jueves DATE := lunes + INTERVAL '3 days';
    viernes DATE := lunes + INTERVAL '4 days';
    sabado DATE := lunes + INTERVAL '5 days';
    domingo DATE := lunes + INTERVAL '6 days';
    
    -- IDs de empleados (obtenemos los primeros 8, excluyendo admin)
    emp_ids UUID[];
    juan_id UUID;
    maria_id UUID;
    carlos_id UUID;
    ana_id UUID;
    david_id UUID;
    laura_id UUID;
    miguel_id UUID;
    vale_id UUID;
    
    -- Verificar que tenemos empleados
    emp_count INTEGER;
BEGIN
    -- Verificar cuántos empleados no-admin tenemos
    SELECT COUNT(*) INTO emp_count 
    FROM employees 
    WHERE cedula != '12345678' AND activo = true;
    
    IF emp_count < 8 THEN
        RAISE NOTICE 'Solo hay % empleados disponibles. Creando empleados adicionales...', emp_count;
        
        -- Crear empleados de prueba adicionales
        INSERT INTO employees (nombre, cedula, salario, salario_hora, cargo, departamento, fecha_ingreso, activo) VALUES
        ('Juan Carlos Pérez', '11111111', 1500000, 7812.50, 'Empleado', 'Operaciones', '2024-01-15', true),
        ('María Elena González', '22222222', 1600000, 8333.33, 'Empleado', 'Operaciones', '2024-02-01', true),
        ('Carlos Alberto Rodríguez', '33333333', 1550000, 8072.92, 'Empleado', 'Operaciones', '2024-01-30', true),
        ('Ana Sofía López', '44444444', 1650000, 8593.75, 'Empleado', 'Operaciones', '2024-03-01', true),
        ('David Fernando Martínez', '55555555', 1500000, 7812.50, 'Empleado', 'Operaciones', '2024-02-15', true),
        ('Laura Camila Torres', '66666666', 1700000, 8854.17, 'Empleado', 'Operaciones', '2024-01-20', true),
        ('Miguel Andrés Castro', '77777777', 1580000, 8229.17, 'Empleado', 'Operaciones', '2024-02-28', true),
        ('Valentina Herrera', '88888888', 1620000, 8437.50, 'Empleado', 'Operaciones', '2024-03-10', true)
        ON CONFLICT (cedula) DO NOTHING;
    END IF;

    -- Obtener IDs de empleados
    SELECT ARRAY_AGG(id ORDER BY nombre) INTO emp_ids 
    FROM (
        SELECT id, nombre FROM employees 
        WHERE cedula != '12345678' AND activo = true
        ORDER BY nombre 
        LIMIT 8
    ) e;

    -- Verificar que tenemos suficientes empleados
    IF array_length(emp_ids, 1) < 8 THEN
        RAISE EXCEPTION 'No hay suficientes empleados. Solo se encontraron %', array_length(emp_ids, 1);
    END IF;

    -- Asignar IDs individuales
    juan_id := emp_ids[1];
    maria_id := emp_ids[2];  
    carlos_id := emp_ids[3];
    ana_id := emp_ids[4];
    david_id := emp_ids[5];
    laura_id := emp_ids[6];
    miguel_id := emp_ids[7];
    vale_id := emp_ids[8];

    RAISE NOTICE 'Generando datos para semana: % a %', lunes, domingo;

    -- ===== LUNES =====
    INSERT INTO time_records (employee_id, tipo, timestamp, mensaje_motivacional) VALUES
    -- Juan Carlos - Día normal (8.5 horas)
    (juan_id, 'entrada', lunes + TIME '08:15:00', '¡Buenos días Juan! Que tu jornada esté llena de energía ☀️'),
    (juan_id, 'inicio_almuerzo', lunes + TIME '12:30:00', 'Hora de nutrir el cuerpo Juan 🍽️'),
    (juan_id, 'fin_almuerzo', lunes + TIME '13:30:00', 'Recargado y listo para la tarde ⚡'),
    (juan_id, 'salida', lunes + TIME '16:45:00', 'Excelente día Juan! Descansa bien 🌙'),
    
    -- María Elena - Con horas extras diurnas (10.5 horas)
    (maria_id, 'entrada', lunes + TIME '07:45:00', '¡Hola María! Temprano y con energía 🌅'),
    (maria_id, 'inicio_almuerzo', lunes + TIME '12:00:00', 'Te mereces este descanso María 🌿'),
    (maria_id, 'fin_almuerzo', lunes + TIME '13:00:00', 'Lista para la tarde productiva'),
    (maria_id, 'salida', lunes + TIME '18:30:00', 'Jornada extendida completada! Eres increíble 🌟'),
    
    -- Carlos - Turno nocturno con extras nocturnas (9.25 horas)
    (carlos_id, 'entrada', lunes + TIME '14:00:00', 'Buenas tardes Carlos! Turno de tarde 🌆'),
    (carlos_id, 'inicio_almuerzo', lunes + TIME '18:00:00', 'Hora de la cena Carlos 🍽️'),
    (carlos_id, 'fin_almuerzo', lunes + TIME '19:00:00', 'Energías renovadas para la noche'),
    (carlos_id, 'salida', lunes + TIME '23:15:00', 'Noche productiva completada Carlos! 🌙');

    -- Continúo con el resto de días...
    -- [Resto del código de inserción de datos igual que antes]

    -- ===== MARTES =====
    INSERT INTO time_records (employee_id, tipo, timestamp, mensaje_motivacional) VALUES
    (ana_id, 'entrada', martes + TIME '08:00:00', '¡Puntual como siempre Ana! 🌟'),
    (ana_id, 'inicio_almuerzo', martes + TIME '12:15:00', 'Disfruta tu almuerzo Ana 🌸'),
    (ana_id, 'fin_almuerzo', martes + TIME '13:15:00', 'Renovada para la tarde'),
    (ana_id, 'salida', martes + TIME '17:00:00', 'Día completo de bienestar Ana! 🌺'),
    (david_id, 'entrada', martes + TIME '09:30:00', 'Buenos días David! Nunca es tarde para empezar bien 😊'),
    (david_id, 'inicio_almuerzo', martes + TIME '13:30:00', 'Momento de recargar David 🍃'),
    (david_id, 'fin_almuerzo', martes + TIME '14:30:00', 'Listo para la tarde David'),
    (david_id, 'salida', martes + TIME '18:30:00', 'Jornada compensada completada! 💪');

    -- ===== MIÉRCOLES =====
    INSERT INTO time_records (employee_id, tipo, timestamp, mensaje_motivacional) VALUES
    (laura_id, 'entrada', miercoles + TIME '08:10:00', 'Buenos días Laura! Tu sonrisa ilumina el día 🌺'),
    (laura_id, 'inicio_almuerzo', miercoles + TIME '12:45:00', 'Nutrite bien Laura 💚'),
    (laura_id, 'fin_almuerzo', miercoles + TIME '13:45:00', 'Energía renovada Laura'),
    (laura_id, 'salida', miercoles + TIME '17:10:00', 'Otro día exitoso Laura! 🌟'),
    (miguel_id, 'entrada', miercoles + TIME '08:30:00', 'Buenos días Miguel! Día productivo por delante 🌵'),
    (miguel_id, 'inicio_almuerzo', miercoles + TIME '13:00:00', 'Pausa merecida Miguel 🍽️'),
    (miguel_id, 'fin_almuerzo', miercoles + TIME '14:00:00', 'Recargado Miguel!'),
    (miguel_id, 'salida', miercoles + TIME '19:45:00', 'Jornada extendida exitosa Miguel! 🚀');

    -- ===== JUEVES =====
    INSERT INTO time_records (employee_id, tipo, timestamp, mensaje_motivacional) VALUES
    (vale_id, 'entrada', jueves + TIME '07:55:00', 'Buenos días Vale! Siempre radiante 🌼'),
    (vale_id, 'inicio_almuerzo', jueves + TIME '12:20:00', 'Disfruta tu almuerzo Vale ☀️'),
    (vale_id, 'fin_almuerzo', jueves + TIME '13:20:00', 'Lista para brillar en la tarde'),
    (vale_id, 'salida', jueves + TIME '16:55:00', 'Día perfecto completado Vale! ✨');

    -- ===== VIERNES =====
    INSERT INTO time_records (employee_id, tipo, timestamp, mensaje_motivacional) VALUES
    (juan_id, 'entrada', viernes + TIME '08:20:00', '¡TGIF Juan! Viernes de energía 🎉'),
    (juan_id, 'inicio_almuerzo', viernes + TIME '12:30:00', 'Almuerzo de viernes especial 🍽️'),
    (juan_id, 'fin_almuerzo', viernes + TIME '13:30:00', 'Tarde de viernes productiva'),
    (juan_id, 'salida', viernes + TIME '17:00:00', '¡Fin de semana merecido Juan! 🎊'),
    (maria_id, 'entrada', viernes + TIME '08:00:00', 'Viernes productivo María! 🌟'),
    (maria_id, 'inicio_almuerzo', viernes + TIME '12:00:00', 'Almuerzo relajante de viernes'),
    (maria_id, 'fin_almuerzo', viernes + TIME '13:00:00', 'Última tarde de la semana'),
    (maria_id, 'salida', viernes + TIME '18:00:00', 'Semana completada con éxito María! 🏆');

    -- ===== SÁBADO =====
    INSERT INTO time_records (employee_id, tipo, timestamp, mensaje_motivacional) VALUES
    (carlos_id, 'entrada', sabado + TIME '09:00:00', 'Sábado especial Carlos! Día de extras 💪'),
    (carlos_id, 'inicio_almuerzo', sabado + TIME '13:00:00', 'Almuerzo de sábado merecido'),
    (carlos_id, 'fin_almuerzo', sabado + TIME '14:00:00', 'Tarde de sábado productiva'),
    (carlos_id, 'salida', sabado + TIME '17:00:00', 'Sábado productivo completado Carlos! 🌟'),
    (miguel_id, 'entrada', sabado + TIME '08:00:00', 'Sábado matutino Miguel! 🌅'),
    (miguel_id, 'salida', sabado + TIME '12:00:00', 'Media jornada completada! Disfruta el resto del sábado 🎉');

    -- ===== DOMINGO =====
    INSERT INTO time_records (employee_id, tipo, timestamp, mensaje_motivacional) VALUES
    (david_id, 'entrada', domingo + TIME '10:00:00', 'Domingo especial David! Gracias por tu dedicación 🙏'),
    (david_id, 'salida', domingo + TIME '14:00:00', 'Domingo completado David! Descansa el resto del día 🌞');

    -- Pausas activas
    INSERT INTO active_breaks (employee_id, fecha_inicio, fecha_fin, duracion_segundos, tipo, completada, estado_animo_antes, estado_animo_despues) VALUES
    (juan_id, lunes + TIME '10:30:00', lunes + TIME '10:33:00', 180, 'respiracion', true, 'bien', 'feliz'),
    (juan_id, lunes + TIME '15:00:00', lunes + TIME '15:05:00', 300, 'estiramiento', true, 'cansado', 'bien'),
    (maria_id, lunes + TIME '10:00:00', lunes + TIME '10:03:00', 180, 'gratitud', true, 'estresado', 'feliz'),
    (maria_id, lunes + TIME '16:30:00', lunes + TIME '16:35:00', 300, 'caminata', true, 'bien', 'feliz'),
    (carlos_id, lunes + TIME '16:30:00', lunes + TIME '16:33:00', 180, 'respiracion', true, 'cansado', 'bien'),
    (ana_id, martes + TIME '10:00:00', martes + TIME '10:03:00', 180, 'respiracion', true, 'bien', 'feliz'),
    (ana_id, martes + TIME '14:30:00', martes + TIME '14:35:00', 300, 'estiramiento', true, 'bien', 'feliz'),
    (vale_id, jueves + TIME '10:15:00', jueves + TIME '10:18:00', 180, 'respiracion', true, 'bien', 'feliz'),
    (vale_id, jueves + TIME '14:30:00', jueves + TIME '14:35:00', 300, 'estiramiento', true, 'bien', 'feliz');

    RAISE NOTICE 'Time records y pausas activas insertados exitosamente';

END $$;

-- 13. Generar hours_summary automáticamente
INSERT INTO hours_summary (
    employee_id, fecha, 
    horas_ordinarias, horas_extra_diurnas, horas_extra_nocturnas, horas_nocturnas,
    horas_dominicales_diurnas, total_horas,
    salario_base, recargo_nocturno, recargo_dominical, 
    extra_diurna, extra_nocturna, extra_dominical_diurna, total_pago,
    pausas_activas_realizadas
)
WITH employee_day_hours AS (
    SELECT 
        tr.employee_id,
        DATE(tr.timestamp) as fecha,
        e.salario_hora,
        -- Calcular total de horas trabajadas
        EXTRACT(EPOCH FROM (
            MAX(CASE WHEN tr.tipo = 'salida' THEN tr.timestamp END) - 
            MIN(CASE WHEN tr.tipo = 'entrada' THEN tr.timestamp END) -
            COALESCE(
                MAX(CASE WHEN tr.tipo = 'fin_almuerzo' THEN tr.timestamp END) - 
                MIN(CASE WHEN tr.tipo = 'inicio_almuerzo' THEN tr.timestamp END),
                INTERVAL '1 hour'
            )
        )) / 3600.0 AS total_horas,
        
        EXTRACT(DOW FROM DATE(tr.timestamp)) = 0 AS es_domingo,
        MAX(CASE WHEN tr.tipo = 'salida' THEN EXTRACT(HOUR FROM tr.timestamp) END) >= 21 AS es_nocturno
        
    FROM time_records tr
    JOIN employees e ON tr.employee_id = e.id
    WHERE DATE(tr.timestamp) >= CURRENT_DATE - INTERVAL '7 days'
    GROUP BY tr.employee_id, DATE(tr.timestamp), e.salario_hora
    HAVING MAX(CASE WHEN tr.tipo = 'salida' THEN tr.timestamp END) IS NOT NULL 
       AND MIN(CASE WHEN tr.tipo = 'entrada' THEN tr.timestamp END) IS NOT NULL
),
hours_breakdown AS (
    SELECT *,
        CASE 
            WHEN es_domingo THEN 0 
            ELSE LEAST(8.0, total_horas) 
        END AS horas_ordinarias,
        
        CASE 
            WHEN es_domingo THEN 0
            WHEN total_horas > 8 AND NOT es_nocturno THEN total_horas - 8
            ELSE 0 
        END AS horas_extra_diurnas,
        
        CASE 
            WHEN es_domingo THEN 0
            WHEN total_horas > 8 AND es_nocturno THEN total_horas - 8
            ELSE 0 
        END AS horas_extra_nocturnas,
        
        CASE 
            WHEN NOT es_domingo AND es_nocturno AND total_horas <= 8 THEN 2
            ELSE 0 
        END AS horas_nocturnas,
        
        CASE 
            WHEN es_domingo THEN total_horas 
            ELSE 0 
        END AS horas_dominicales_diurnas
        
    FROM employee_day_hours
)
SELECT 
    employee_id, fecha,
    horas_ordinarias::DECIMAL(4,2),
    horas_extra_diurnas::DECIMAL(4,2),
    horas_extra_nocturnas::DECIMAL(4,2),
    horas_nocturnas::DECIMAL(4,2),
    horas_dominicales_diurnas::DECIMAL(4,2),
    total_horas::DECIMAL(4,2),
    
    -- Cálculos de pago
    (salario_hora * horas_ordinarias)::DECIMAL(12,2) AS salario_base,
    (salario_hora * 0.35 * horas_nocturnas)::DECIMAL(12,2) AS recargo_nocturno,
    (salario_hora * 1.0 * horas_dominicales_diurnas)::DECIMAL(12,2) AS recargo_dominical,
    (salario_hora * 0.25 * horas_extra_diurnas)::DECIMAL(12,2) AS extra_diurna,
    (salario_hora * 0.75 * horas_extra_nocturnas)::DECIMAL(12,2) AS extra_nocturna,
    (salario_hora * 1.0 * horas_dominicales_diurnas)::DECIMAL(12,2) AS extra_dominical_diurna,
    
    -- Total a pagar
    (
        (salario_hora * horas_ordinarias) +
        (salario_hora * 0.35 * horas_nocturnas) +
        (salario_hora * 2.0 * horas_dominicales_diurnas) +
        (salario_hora * 0.25 * horas_extra_diurnas) +
        (salario_hora * 0.75 * horas_extra_nocturnas)
    )::DECIMAL(12,2) AS total_pago,
    
    -- Contar pausas activas
    COALESCE(ab.pausas_count, 0) AS pausas_activas_realizadas

FROM hours_breakdown hb
LEFT JOIN (
    SELECT 
        employee_id, 
        DATE(fecha_inicio) as fecha, 
        COUNT(*) as pausas_count
    FROM active_breaks 
    WHERE completada = true 
      AND DATE(fecha_inicio) >= CURRENT_DATE - INTERVAL '7 days'
    GROUP BY employee_id, DATE(fecha_inicio)
) ab ON hb.employee_id = ab.employee_id AND hb.fecha = ab.fecha;

-- 14. Actualizar rachas de pausas activas
UPDATE employees SET racha_pausas = 
CASE 
    WHEN (
        SELECT COUNT(DISTINCT DATE(fecha_inicio)) 
        FROM active_breaks 
        WHERE employee_id = employees.id 
        AND completada = true 
        AND DATE(fecha_inicio) >= CURRENT_DATE - INTERVAL '7 days'
    ) >= 4 THEN 7
    WHEN (
        SELECT COUNT(DISTINCT DATE(fecha_inicio)) 
        FROM active_breaks 
        WHERE employee_id = employees.id 
        AND completada = true 
        AND DATE(fecha_inicio) >= CURRENT_DATE - INTERVAL '7 days'
    ) >= 2 THEN 5
    ELSE 2
END
WHERE cedula != '12345678';

-- ===============================================
-- PARTE 3: REPORTES DE VERIFICACIÓN
-- ===============================================

-- 15. Mostrar resumen de datos generados
SELECT 
    '🎉 SETUP Y DATOS COMPLETADOS EXITOSAMENTE' as titulo,
    COUNT(DISTINCT employee_id) as empleados_con_datos,
    COUNT(DISTINCT fecha) as dias_con_registros,
    MIN(fecha) as fecha_inicio,
    MAX(fecha) as fecha_fin,
    ROUND(SUM(total_horas), 1) as total_horas_semana,
    TO_CHAR(SUM(total_pago), 'FM$999,999,999') as total_nomina_semana
FROM hours_summary 
WHERE fecha >= CURRENT_DATE - INTERVAL '7 days';

-- 16. Resumen detallado por empleado
SELECT 
    '👥 RESUMEN POR EMPLEADO' as seccion,
    e.nombre,
    COUNT(hs.fecha) as dias_trabajados,
    ROUND(SUM(hs.total_horas), 1) as total_horas,
    ROUND(SUM(hs.horas_extra_diurnas + hs.horas_extra_nocturnas), 1) as horas_extra,
    ROUND(SUM(hs.horas_dominicales_diurnas), 1) as horas_dominicales,
    SUM(hs.pausas_activas_realizadas) as pausas_realizadas,
    TO_CHAR(SUM(hs.total_pago), 'FM$999,999') as pago_semanal
FROM employees e
LEFT JOIN hours_summary hs ON e.id = hs.employee_id 
WHERE hs.fecha >= CURRENT_DATE - INTERVAL '7 days'
  AND e.cedula != '12345678'
GROUP BY e.id, e.nombre
ORDER BY SUM(hs.total_pago) DESC; 