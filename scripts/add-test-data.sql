-- Datos de prueba para el dashboard de Luisa
-- Las tablas holidays y hours_summary ya están creadas

-- 1. Limpiar datos de prueba anteriores
DELETE FROM hours_summary WHERE fecha >= CURRENT_DATE - INTERVAL '7 days';
DELETE FROM active_breaks WHERE DATE(fecha_inicio) >= CURRENT_DATE - INTERVAL '7 days';
DELETE FROM time_records WHERE DATE(timestamp) >= CURRENT_DATE - INTERVAL '7 days';

-- 2. Actualizar salario_hora si está vacío
UPDATE employees SET salario_hora = ROUND(COALESCE(salario, 1500000) / 192, 2) WHERE salario_hora IS NULL;

-- 3. Crear empleados de prueba si no existen suficientes
INSERT INTO employees (nombre, cedula, salario, salario_hora) VALUES
('Juan Carlos', '11111111', 1500000, 7812.50),
('María Elena', '22222222', 1600000, 8333.33),
('Carlos Alberto', '33333333', 1550000, 8072.92),
('Ana Sofía', '44444444', 1650000, 8593.75)
ON CONFLICT (cedula) DO NOTHING;

-- 4. Generar registros de tiempo para ayer
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
    'inicio_almuerzo',
    CURRENT_DATE - INTERVAL '1 day' + TIME '12:00:00',
    'Hora de almorzar 🍽️'
FROM employees e WHERE cedula != '12345678' LIMIT 4;

INSERT INTO time_records (employee_id, tipo, timestamp, mensaje_motivacional)
SELECT 
    e.id,
    'fin_almuerzo',
    CURRENT_DATE - INTERVAL '1 day' + TIME '13:00:00',
    'Recargado para la tarde ⚡'
FROM employees e WHERE cedula != '12345678' LIMIT 4;

INSERT INTO time_records (employee_id, tipo, timestamp, mensaje_motivacional)
SELECT 
    e.id,
    'salida',
    CURRENT_DATE - INTERVAL '1 day' + TIME '17:00:00',
    'Excelente día! 🌟'
FROM employees e WHERE cedula != '12345678' LIMIT 4;

-- 5. Generar algunas pausas activas
INSERT INTO active_breaks (employee_id, fecha_inicio, fecha_fin, duracion_segundos, tipo, completada, estado_animo_antes, estado_animo_despues)
SELECT 
    e.id,
    CURRENT_DATE - INTERVAL '1 day' + TIME '10:00:00',
    CURRENT_DATE - INTERVAL '1 day' + TIME '10:03:00',
    180,
    'respiracion',
    true,
    'bien',
    'feliz'
FROM employees e WHERE cedula != '12345678' LIMIT 4;

-- 6. Generar hours_summary básico
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

-- 7. Insertar algunos festivos básicos
INSERT INTO holidays (fecha, nombre) VALUES
('2025-01-01', 'Año Nuevo'),
('2025-04-14', 'Viernes Santo'),
('2025-05-01', 'Día del Trabajo'),
('2025-07-20', 'Día de la Independencia'),
('2025-12-25', 'Navidad')
ON CONFLICT (fecha) DO NOTHING;

-- 8. Verificar que los datos se generaron correctamente
SELECT 
    'Resumen de datos generados' as titulo,
    (SELECT COUNT(*) FROM employees WHERE cedula != '12345678') as empleados,
    (SELECT COUNT(*) FROM time_records WHERE DATE(timestamp) = CURRENT_DATE - INTERVAL '1 day') as registros_tiempo,
    (SELECT COUNT(*) FROM hours_summary WHERE fecha = CURRENT_DATE - INTERVAL '1 day') as resumen_horas,
    (SELECT COUNT(*) FROM holidays) as festivos; 