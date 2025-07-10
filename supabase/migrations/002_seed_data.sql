-- Insertar mensajes motivacionales con personalidad SIRIUS
INSERT INTO motivational_messages (tipo, mensaje, emoji, activo) VALUES
  -- Mensajes de entrada
  ('entrada', '¡Hola! ¿Listo para un día increíble?', '🌟', true),
  ('entrada', '¡Buenos días! Que tu jornada esté llena de energía', '☀️', true),
  ('entrada', '¡Bienvenid@! Hoy es un gran día para crecer', '🌱', true),
  ('entrada', '¡Hey! Nos alegra verte por aquí', '😊', true),
  ('entrada', 'Como el sol nutre las plantas, tu energía nutre los proyectos', '🌅', true),
  ('entrada', 'Cada día es una nueva oportunidad de crecer', '🌱', true),
  ('entrada', '¡Qué bueno verte! Hagamos de hoy un gran día', '😊', true),
  ('entrada', 'Tu presencia hace la diferencia. ¡Bienvenid@!', '🌟', true),

  -- Mensajes de almuerzo
  ('almuerzo', '¡Mmm, hora de nutrir el cuerpo!', '🍽️', true),
  ('almuerzo', 'Un almuerzo consciente es un acto de amor propio', '💚', true),
  ('almuerzo', '¡Hey! Tu estómago te lo agradecerá', '🍽️', true),
  ('almuerzo', 'Es hora de recargar energías', '⚡', true),
  ('almuerzo', 'Como las plantas necesitan nutrientes, tú necesitas esta pausa', '🌿', true),
  ('almuerzo', '¡Disfruta cada bocado! Te lo mereces', '😋', true),
  ('almuerzo', 'Alimenta tu cuerpo, alimenta tu alma', '🌱', true),

  -- Mensajes de pausa activa
  ('pausa_activa', '¡Momento de respirar! Tu cuerpo te lo agradecerá', '🌱', true),
  ('pausa_activa', 'Las mejores ideas vienen después de respirar profundo', '💡', true),
  ('pausa_activa', 'Como la tierra necesita lluvia, tú necesitas pausas', '🌧️', true),
  ('pausa_activa', '3 minutos de inversión en tu bienestar = horas de mejor energía', '⚡', true),
  ('pausa_activa', 'Tu cuerpo es sabio, escúchalo', '🧘', true),
  ('pausa_activa', '¡Es momento de regenerarnos! Como las plantas, necesitamos pausas para crecer', '🌱', true),
  ('pausa_activa', 'Tu cuerpo te lo agradecerá. ¡Vamos a respirar juntos!', '🌬️', true),
  ('pausa_activa', '3 minutitos para ti. Te los mereces', '💚', true),
  ('pausa_activa', 'Como en SIRIUS cuidamos la tierra, cuidemos también de ti', '🌍', true),

  -- Mensajes de salida
  ('salida', '¡Qué día tan productivo! Descansa, te lo mereces', '🌙', true),
  ('salida', 'Gracias por tu energía hoy. ¡Hasta mañana!', '👋', true),
  ('salida', 'Como las plantas al atardecer, es hora de descansar', '🌅', true),
  ('salida', 'Tu trabajo de hoy hace crecer nuestros sueños', '🌱', true),
  ('salida', '¡Wow, qué día productivo! El descanso también es productividad', '🌟', true),
  ('salida', 'Has alcanzado tus metas del día. ¡Descansa en paz!', '😌', true),
  ('salida', 'Como la luna cuida las plantas de noche, ve a descansar', '🌙', true),

  -- Mensajes de logros
  ('logro', '¡Increíble! Has conseguido algo especial', '🎉', true),
  ('logro', '¡Mira esa energía renovada!', '🌟', true),
  ('logro', 'Acabas de invertir en tu mejor versión', '💚', true),
  ('logro', '¿Sientes la diferencia? Nosotros sí la notamos', '😊', true),
  ('logro', '¡Regenerad@ y list@ para continuar!', '🚀', true),
  ('logro', '¡Primera pausa del día! Tu cuerpo te lo agradece', '🎉', true),
  ('logro', '¡7 días cuidándote! Eres un ejemplo de bienestar', '🏆', true),
  ('logro', '¡Un mes entero de pausas! Eres oficialmente un Maestro del Bienestar', '🌟', true);

-- Insertar empleados de ejemplo (incluyendo a Luisa como administradora)
INSERT INTO employees (cedula, nombre, apodo, salario, emoji_favorito) VALUES
  ('12345678', 'Luisa González', 'Luisa', 4500000.00, '🌻'),  -- Administradora
  ('23456789', 'Juan Carlos Pérez', 'Juan', 3200000.00, '🌱'),
  ('34567890', 'María Elena Rodríguez', 'María', 3500000.00, '🌿'),
  ('45678901', 'Carlos Alberto Sánchez', 'Carlos', 3000000.00, '🌳'),
  ('56789012', 'Ana Sofía López', 'Anita', 3100000.00, '🌸'),
  ('67890123', 'David Fernando Castro', 'David', 2900000.00, '🍃'),
  ('78901234', 'Laura Camila Herrera', 'Laura', 3300000.00, '🌺'),
  ('89012345', 'Miguel Andrés Torres', 'Miguel', 3150000.00, '🌵'),
  ('90123456', 'Valentina Ruiz Mejía', 'Vale', 3400000.00, '🌼'),
  ('01234567', 'Sebastián Vargas', 'Sebas', 2950000.00, '🌲');

-- Insertar horarios de trabajo estándar (Lunes a Viernes 8:00 AM - 5:00 PM)
INSERT INTO work_schedules (employee_id, dia_semana, hora_inicio, hora_fin)
SELECT 
  e.id,
  d.dia,
  '08:00:00'::TIME,
  '17:00:00'::TIME
FROM employees e
CROSS JOIN (
  SELECT 1 as dia UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5
) d;

-- Insertar algunos registros de tiempo de ejemplo para hoy
DO $$
DECLARE
  emp_record RECORD;
  hoy DATE := CURRENT_DATE;
  entrada_hora TIME := '08:15:00';
  almuerzo_inicio TIME := '12:30:00';
  almuerzo_fin TIME := '13:30:00';
BEGIN
  FOR emp_record IN SELECT id FROM employees LIMIT 5 LOOP
    -- Entrada del día
    INSERT INTO time_records (employee_id, tipo, timestamp, mensaje_motivacional)
    VALUES (
      emp_record.id,
      'entrada',
      hoy + entrada_hora,
      '¡Buenos días! ☀️ Que tu jornada esté llena de energía'
    );
    
    -- Inicio de almuerzo
    INSERT INTO time_records (employee_id, tipo, timestamp, mensaje_motivacional)
    VALUES (
      emp_record.id,
      'inicio_almuerzo',
      hoy + almuerzo_inicio,
      '¡Mmm, hora de nutrir el cuerpo! 🍽️'
    );
    
    -- Fin de almuerzo
    INSERT INTO time_records (employee_id, tipo, timestamp, mensaje_motivacional)
    VALUES (
      emp_record.id,
      'fin_almuerzo',
      hoy + almuerzo_fin,
      'Esperamos que hayas disfrutado. ¡La tarde te espera! ⚡'
    );
    
    -- Incrementar un poco la hora para el siguiente empleado
    entrada_hora := entrada_hora + INTERVAL '2 minutes';
    almuerzo_inicio := almuerzo_inicio + INTERVAL '5 minutes';
    almuerzo_fin := almuerzo_fin + INTERVAL '5 minutes';
  END LOOP;
END $$;

-- Insertar algunas pausas activas de ejemplo
DO $$
DECLARE
  emp_record RECORD;
  tipos_pausa TEXT[] := ARRAY['respiracion', 'estiramiento', 'gratitud'];
  estados_animo TEXT[] := ARRAY['bien', 'feliz', 'cansado'];
BEGIN
  FOR emp_record IN SELECT id FROM employees LIMIT 3 LOOP
    INSERT INTO active_breaks (
      employee_id, 
      fecha_inicio, 
      fecha_fin, 
      duracion_segundos, 
      tipo, 
      completada,
      estado_animo_antes,
      estado_animo_despues
    ) VALUES (
      emp_record.id,
      CURRENT_DATE + TIME '10:30:00',
      CURRENT_DATE + TIME '10:33:00',
      180,
      tipos_pausa[1 + floor(random() * 3)::int],
      true,
      estados_animo[1 + floor(random() * 3)::int],
      'feliz'
    );
  END LOOP;
END $$;

-- Insertar algunos logros de ejemplo
INSERT INTO achievements (employee_id, tipo, fecha, mensaje, celebrado)
SELECT 
  e.id,
  'primera_pausa',
  CURRENT_DATE,
  '¡Primera pausa del día! Tu cuerpo te lo agradece 🎉',
  false
FROM employees e
LIMIT 3;

-- Crear índices adicionales para rendimiento
CREATE INDEX idx_motivational_messages_tipo_activo ON motivational_messages(tipo, activo);
CREATE INDEX idx_employees_cedula ON employees(cedula);
CREATE INDEX idx_time_records_timestamp ON time_records(timestamp);
CREATE INDEX idx_active_breaks_completada ON active_breaks(completada);

-- Comentarios en las tablas para documentación
COMMENT ON TABLE employees IS 'Empleados de SIRIUS Regenerative con personalización';
COMMENT ON TABLE time_records IS 'Registros de tiempo con mensajes motivacionales SIRIUS';
COMMENT ON TABLE active_breaks IS 'Pausas activas para el bienestar de los empleados';
COMMENT ON TABLE motivational_messages IS 'Mensajes con personalidad SIRIUS para diferentes momentos';
COMMENT ON TABLE achievements IS 'Sistema de logros para gamificación del bienestar';
COMMENT ON TABLE overtime_requests IS 'Solicitudes de horas extra con aprobación administrativa';
COMMENT ON TABLE work_schedules IS 'Horarios de trabajo personalizados por empleado';

-- Crear función para obtener estado actual del empleado
CREATE OR REPLACE FUNCTION get_employee_status(emp_id UUID)
RETURNS TABLE(
  estado VARCHAR(50),
  ultimo_registro TIMESTAMP,
  horas_trabajadas_hoy INTERVAL,
  pausas_realizadas_hoy INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH ultimo_registro AS (
    SELECT tipo, timestamp 
    FROM time_records 
    WHERE employee_id = emp_id 
      AND DATE(timestamp) = CURRENT_DATE
    ORDER BY timestamp DESC 
    LIMIT 1
  ),
  stats_hoy AS (
    SELECT 
      calculate_hours_worked(emp_id, CURRENT_DATE) as horas,
      COUNT(ab.id) as pausas
    FROM active_breaks ab
    WHERE ab.employee_id = emp_id 
      AND ab.completada = true
      AND DATE(ab.fecha_inicio) = CURRENT_DATE
  )
  SELECT 
    CASE 
      WHEN ur.tipo IS NULL THEN 'sin_actividad'
      WHEN ur.tipo = 'entrada' THEN 'trabajando'
      WHEN ur.tipo = 'inicio_almuerzo' THEN 'almorzando'
      WHEN ur.tipo = 'fin_almuerzo' THEN 'trabajando'
      WHEN ur.tipo = 'inicio_pausa_activa' THEN 'pausa_activa'
      WHEN ur.tipo = 'fin_pausa_activa' THEN 'trabajando'
      WHEN ur.tipo = 'salida' THEN 'jornada_terminada'
      ELSE 'desconocido'
    END::VARCHAR(50) as estado,
    ur.timestamp as ultimo_registro,
    COALESCE(sh.horas, INTERVAL '0 hours') as horas_trabajadas_hoy,
    COALESCE(sh.pausas, 0)::INTEGER as pausas_realizadas_hoy
  FROM ultimo_registro ur
  CROSS JOIN stats_hoy sh;
END;
$$ LANGUAGE plpgsql; 