-- Script para generar datos de prueba de una semana completa
-- Datos variados para probar el dashboard administrativo de Luisa

-- Limpiar datos de prueba existentes de la semana pasada
DELETE FROM time_records WHERE DATE(timestamp) >= CURRENT_DATE - INTERVAL '7 days';
DELETE FROM active_breaks WHERE DATE(fecha_inicio) >= CURRENT_DATE - INTERVAL '7 days';
DELETE FROM hours_summary WHERE fecha >= CURRENT_DATE - INTERVAL '7 days';

-- Variables para la semana de prueba (semana pasada)
DO $$
DECLARE
    fecha_inicio DATE := CURRENT_DATE - INTERVAL '7 days'; -- Lunes de la semana pasada
    fecha_fin DATE := CURRENT_DATE - INTERVAL '1 day'; -- Domingo pasado
    empleados UUID[];
    emp_id UUID;
    fecha_actual DATE;
    dia_semana INTEGER;
    is_domingo BOOLEAN;
    hora_entrada TIME;
    hora_salida TIME;
    hora_almuerzo_inicio TIME;
    hora_almuerzo_fin TIME;
    horas_trabajadas DECIMAL;
    tiene_extras BOOLEAN;
    
BEGIN
    -- Obtener IDs de empleados (excluyendo a Luisa que es admin)
    SELECT ARRAY_AGG(id) INTO empleados 
    FROM employees 
    WHERE cedula != '12345678' -- Excluir a Luisa
    LIMIT 8;

    -- LUNES (fecha_inicio)
    fecha_actual := fecha_inicio;
    RAISE NOTICE 'Generando datos para: %', fecha_actual;
    
    -- Juan Carlos - Día normal (8 horas)
    emp_id := empleados[1];
    INSERT INTO time_records (employee_id, tipo, timestamp, mensaje_motivacional) VALUES
    (emp_id, 'entrada', fecha_actual + TIME '08:15:00', '¡Buenos días Juan! Que tu jornada esté llena de energía ☀️'),
    (emp_id, 'inicio_almuerzo', fecha_actual + TIME '12:30:00', 'Hora de nutrir el cuerpo Juan 🍽️'),
    (emp_id, 'fin_almuerzo', fecha_actual + TIME '13:30:00', 'Recargado y listo para la tarde ⚡'),
    (emp_id, 'salida', fecha_actual + TIME '16:45:00', 'Excelente día Juan! Descansa bien 🌙');
    
    -- María Elena - Con horas extras diurnas
    emp_id := empleados[2];
    INSERT INTO time_records (employee_id, tipo, timestamp, mensaje_motivacional) VALUES
    (emp_id, 'entrada', fecha_actual + TIME '07:45:00', '¡Hola María! Temprano y con energía 🌅'),
    (emp_id, 'inicio_almuerzo', fecha_actual + TIME '12:00:00', 'Te mereces este descanso María 🌿'),
    (emp_id, 'fin_almuerzo', fecha_actual + TIME '13:00:00', 'Lista para la tarde productiva'),
    (emp_id, 'salida', fecha_actual + TIME '18:30:00', 'Jornada extendida completada! Eres increíble 🌟');
    
    -- Carlos - Turno nocturno con extras nocturnas
    emp_id := empleados[3];
    INSERT INTO time_records (employee_id, tipo, timestamp, mensaje_motivacional) VALUES
    (emp_id, 'entrada', fecha_actual + TIME '14:00:00', 'Buenas tardes Carlos! Turno de tarde 🌆'),
    (emp_id, 'inicio_almuerzo', fecha_actual + TIME '18:00:00', 'Hora de la cena Carlos 🍽️'),
    (emp_id, 'fin_almuerzo', fecha_actual + TIME '19:00:00', 'Energías renovadas para la noche'),
    (emp_id, 'salida', fecha_actual + TIME '23:15:00', 'Noche productiva completada Carlos! 🌙');

    -- Pausas activas para el lunes
    INSERT INTO active_breaks (employee_id, fecha_inicio, fecha_fin, duracion_segundos, tipo, completada, estado_animo_antes, estado_animo_despues) VALUES
    (empleados[1], fecha_actual + TIME '10:30:00', fecha_actual + TIME '10:33:00', 180, 'respiracion', true, 'bien', 'feliz'),
    (empleados[1], fecha_actual + TIME '15:00:00', fecha_actual + TIME '15:05:00', 300, 'estiramiento', true, 'cansado', 'bien'),
    (empleados[2], fecha_actual + TIME '10:00:00', fecha_actual + TIME '10:03:00', 180, 'gratitud', true, 'estresado', 'feliz'),
    (empleados[2], fecha_actual + TIME '16:30:00', fecha_actual + TIME '16:35:00', 300, 'caminata', true, 'bien', 'feliz'),
    (empleados[3], fecha_actual + TIME '16:30:00', fecha_actual + TIME '16:33:00', 180, 'respiracion', true, 'cansado', 'bien');

    -- MARTES
    fecha_actual := fecha_inicio + INTERVAL '1 day';
    RAISE NOTICE 'Generando datos para: %', fecha_actual;
    
    -- Ana Sofía - Día normal con muchas pausas
    emp_id := empleados[4];
    INSERT INTO time_records (employee_id, tipo, timestamp, mensaje_motivacional) VALUES
    (emp_id, 'entrada', fecha_actual + TIME '08:00:00', '¡Puntual como siempre Ana! 🌟'),
    (emp_id, 'inicio_almuerzo', fecha_actual + TIME '12:15:00', 'Disfruta tu almuerzo Ana 🌸'),
    (emp_id, 'fin_almuerzo', fecha_actual + TIME '13:15:00', 'Renovada para la tarde'),
    (emp_id, 'salida', fecha_actual + TIME '17:00:00', 'Día completo de bienestar Ana! 🌺');
    
    -- David - Llegada tarde, salida tarde
    emp_id := empleados[5];
    INSERT INTO time_records (employee_id, tipo, timestamp, mensaje_motivacional) VALUES
    (emp_id, 'entrada', fecha_actual + TIME '09:30:00', 'Buenos días David! Nunca es tarde para empezar bien 😊'),
    (emp_id, 'inicio_almuerzo', fecha_actual + TIME '13:30:00', 'Momento de recargar David 🍃'),
    (emp_id, 'fin_almuerzo', fecha_actual + TIME '14:30:00', 'Listo para la tarde David'),
    (emp_id, 'salida', fecha_actual + TIME '18:30:00', 'Jornada compensada completada! 💪');

    -- Pausas del martes
    INSERT INTO active_breaks (employee_id, fecha_inicio, fecha_fin, duracion_segundos, tipo, completada, estado_animo_antes, estado_animo_despues) VALUES
    (empleados[4], fecha_actual + TIME '10:00:00', fecha_actual + TIME '10:03:00', 180, 'respiracion', true, 'bien', 'feliz'),
    (empleados[4], fecha_actual + TIME '14:30:00', fecha_actual + TIME '14:35:00', 300, 'estiramiento', true, 'bien', 'feliz'),
    (empleados[4], fecha_actual + TIME '16:00:00', fecha_actual + TIME '16:03:00', 180, 'gratitud', true, 'feliz', 'feliz'),
    (empleados[5], fecha_actual + TIME '11:00:00', fecha_actual + TIME '11:05:00', 300, 'caminata', true, 'estresado', 'bien');

    -- MIÉRCOLES
    fecha_actual := fecha_inicio + INTERVAL '2 days';
    RAISE NOTICE 'Generando datos para: %', fecha_actual;
    
    -- Laura - Día normal
    emp_id := empleados[6];
    INSERT INTO time_records (employee_id, tipo, timestamp, mensaje_motivacional) VALUES
    (emp_id, 'entrada', fecha_actual + TIME '08:10:00', 'Buenos días Laura! Tu sonrisa ilumina el día 🌺'),
    (emp_id, 'inicio_almuerzo', fecha_actual + TIME '12:45:00', 'Nutrite bien Laura 💚'),
    (emp_id, 'fin_almuerzo', fecha_actual + TIME '13:45:00', 'Energía renovada Laura'),
    (emp_id, 'salida', fecha_actual + TIME '17:10:00', 'Otro día exitoso Laura! 🌟');
    
    -- Miguel - Con extras y trabajo nocturno
    emp_id := empleados[7];
    INSERT INTO time_records (employee_id, tipo, timestamp, mensaje_motivacional) VALUES
    (emp_id, 'entrada', fecha_actual + TIME '08:30:00', 'Buenos días Miguel! Día productivo por delante 🌵'),
    (emp_id, 'inicio_almuerzo', fecha_actual + TIME '13:00:00', 'Pausa merecida Miguel 🍽️'),
    (emp_id, 'fin_almuerzo', fecha_actual + TIME '14:00:00', 'Recargado Miguel!'),
    (emp_id, 'salida', fecha_actual + TIME '19:45:00', 'Jornada extendida exitosa Miguel! 🚀');

    -- JUEVES
    fecha_actual := fecha_inicio + INTERVAL '3 days';
    RAISE NOTICE 'Generando datos para: %', fecha_actual;
    
    -- Valentina - Día normal con pausas perfectas
    emp_id := empleados[8];
    INSERT INTO time_records (employee_id, tipo, timestamp, mensaje_motivacional) VALUES
    (emp_id, 'entrada', fecha_actual + TIME '07:55:00', 'Buenos días Vale! Siempre radiante 🌼'),
    (emp_id, 'inicio_almuerzo', fecha_actual + TIME '12:20:00', 'Disfruta tu almuerzo Vale ☀️'),
    (emp_id, 'fin_almuerzo', fecha_actual + TIME '13:20:00', 'Lista para brillar en la tarde'),
    (emp_id, 'salida', fecha_actual + TIME '16:55:00', 'Día perfecto completado Vale! ✨');

    -- Pausas del jueves (Valentina modelo)
    INSERT INTO active_breaks (employee_id, fecha_inicio, fecha_fin, duracion_segundos, tipo, completada, estado_animo_antes, estado_animo_despues) VALUES
    (empleados[8], fecha_actual + TIME '10:15:00', fecha_actual + TIME '10:18:00', 180, 'respiracion', true, 'bien', 'feliz'),
    (empleados[8], fecha_actual + TIME '14:30:00', fecha_actual + TIME '14:35:00', 300, 'estiramiento', true, 'bien', 'feliz'),
    (empleados[8], fecha_actual + TIME '16:00:00', fecha_actual + TIME '16:03:00', 180, 'gratitud', true, 'feliz', 'feliz');

    -- VIERNES
    fecha_actual := fecha_inicio + INTERVAL '4 days';
    RAISE NOTICE 'Generando datos para: %', fecha_actual;
    
    -- Varios empleados - Viernes de team building
    -- Juan Carlos
    emp_id := empleados[1];
    INSERT INTO time_records (employee_id, tipo, timestamp, mensaje_motivacional) VALUES
    (emp_id, 'entrada', fecha_actual + TIME '08:20:00', '¡TGIF Juan! Viernes de energía 🎉'),
    (emp_id, 'inicio_almuerzo', fecha_actual + TIME '12:30:00', 'Almuerzo de viernes especial 🍽️'),
    (emp_id, 'fin_almuerzo', fecha_actual + TIME '13:30:00', 'Tarde de viernes productiva'),
    (emp_id, 'salida', fecha_actual + TIME '17:00:00', '¡Fin de semana merecido Juan! 🎊');
    
    -- María Elena - Viernes con algunas extras
    emp_id := empleados[2];
    INSERT INTO time_records (employee_id, tipo, timestamp, mensaje_motivacional) VALUES
    (emp_id, 'entrada', fecha_actual + TIME '08:00:00', 'Viernes productivo María! 🌟'),
    (emp_id, 'inicio_almuerzo', fecha_actual + TIME '12:00:00', 'Almuerzo relajante de viernes'),
    (emp_id, 'fin_almuerzo', fecha_actual + TIME '13:00:00', 'Última tarde de la semana'),
    (emp_id, 'salida', fecha_actual + TIME '18:00:00', 'Semana completada con éxito María! 🏆');

    -- SÁBADO - Solo algunos empleados trabajando (horas extra/dominicales)
    fecha_actual := fecha_inicio + INTERVAL '5 days';
    RAISE NOTICE 'Generando datos para SÁBADO: %', fecha_actual;
    
    -- Carlos - Turno de sábado (horas dominicales)
    emp_id := empleados[3];
    INSERT INTO time_records (employee_id, tipo, timestamp, mensaje_motivacional) VALUES
    (emp_id, 'entrada', fecha_actual + TIME '09:00:00', 'Sábado especial Carlos! Día de extras 💪'),
    (emp_id, 'inicio_almuerzo', fecha_actual + TIME '13:00:00', 'Almuerzo de sábado merecido'),
    (emp_id, 'fin_almuerzo', fecha_actual + TIME '14:00:00', 'Tarde de sábado productiva'),
    (emp_id, 'salida', fecha_actual + TIME '17:00:00', 'Sábado productivo completado Carlos! 🌟');
    
    -- Miguel - Medio día sábado
    emp_id := empleados[7];
    INSERT INTO time_records (employee_id, tipo, timestamp, mensaje_motivacional) VALUES
    (emp_id, 'entrada', fecha_actual + TIME '08:00:00', 'Sábado matutino Miguel! 🌅'),
    (emp_id, 'salida', fecha_actual + TIME '12:00:00', 'Media jornada completada! Disfruta el resto del sábado 🎉');

    -- DOMINGO - Trabajo especial (horas dominicales)
    fecha_actual := fecha_inicio + INTERVAL '6 days';
    RAISE NOTICE 'Generando datos para DOMINGO: %', fecha_actual;
    
    -- David - Turno especial domingo (pocas horas)
    emp_id := empleados[5];
    INSERT INTO time_records (employee_id, tipo, timestamp, mensaje_motivacional) VALUES
    (emp_id, 'entrada', fecha_actual + TIME '10:00:00', 'Domingo especial David! Gracias por tu dedicación 🙏'),
    (emp_id, 'salida', fecha_actual + TIME '14:00:00', 'Domingo completado David! Descansa el resto del día 🌞');

    -- Generar pausas adicionales para la semana
    INSERT INTO active_breaks (employee_id, fecha_inicio, fecha_fin, duracion_segundos, tipo, completada, estado_animo_antes, estado_animo_despues) VALUES
    -- Viernes
    (empleados[1], (fecha_inicio + INTERVAL '4 days') + TIME '10:30:00', (fecha_inicio + INTERVAL '4 days') + TIME '10:33:00', 180, 'respiracion', true, 'bien', 'feliz'),
    (empleados[1], (fecha_inicio + INTERVAL '4 days') + TIME '15:00:00', (fecha_inicio + INTERVAL '4 days') + TIME '15:05:00', 300, 'estiramiento', true, 'cansado', 'bien'),
    (empleados[2], (fecha_inicio + INTERVAL '4 days') + TIME '10:00:00', (fecha_inicio + INTERVAL '4 days') + TIME '10:03:00', 180, 'gratitud', true, 'bien', 'feliz'),
    -- Sábado
    (empleados[3], (fecha_inicio + INTERVAL '5 days') + TIME '11:00:00', (fecha_inicio + INTERVAL '5 days') + TIME '11:03:00', 180, 'respiracion', true, 'bien', 'feliz'),
    (empleados[7], (fecha_inicio + INTERVAL '5 days') + TIME '10:00:00', (fecha_inicio + INTERVAL '5 days') + TIME '10:05:00', 300, 'caminata', true, 'bien', 'feliz');

    RAISE NOTICE 'Datos de prueba generados exitosamente para la semana del % al %', fecha_inicio, fecha_fin;
    
END $$;

-- Generar hours_summary automáticamente para todos los días con datos
INSERT INTO hours_summary (
    employee_id, 
    fecha, 
    horas_ordinarias,
    horas_extra_diurnas,
    horas_extra_nocturnas,
    horas_nocturnas,
    horas_dominicales_diurnas,
    total_horas,
    salario_base,
    recargo_nocturno,
    recargo_dominical,
    extra_diurna,
    extra_nocturna,
    extra_dominical_diurna,
    total_pago,
    pausas_activas_realizadas
)
SELECT 
    tr.employee_id,
    DATE(tr.timestamp) as fecha,
    -- Cálculo de horas por tipo
    CASE 
        WHEN EXTRACT(DOW FROM DATE(tr.timestamp)) = 0 THEN 0 -- Domingo = horas dominicales
        ELSE LEAST(8.0, 
            EXTRACT(EPOCH FROM (
                MAX(CASE WHEN tr.tipo = 'salida' THEN tr.timestamp END) - 
                MIN(CASE WHEN tr.tipo = 'entrada' THEN tr.timestamp END) -
                COALESCE(
                    MAX(CASE WHEN tr.tipo = 'fin_almuerzo' THEN tr.timestamp END) - 
                    MIN(CASE WHEN tr.tipo = 'inicio_almuerzo' THEN tr.timestamp END),
                    INTERVAL '0 hours'
                )
            )) / 3600.0
        )
    END as horas_ordinarias,
    
    -- Horas extra diurnas (más de 8 horas en día normal, antes de 9pm)
    CASE 
        WHEN EXTRACT(DOW FROM DATE(tr.timestamp)) = 0 THEN 0 -- Domingo no tiene extras normales
        ELSE GREATEST(0, 
            EXTRACT(EPOCH FROM (
                MAX(CASE WHEN tr.tipo = 'salida' THEN tr.timestamp END) - 
                MIN(CASE WHEN tr.tipo = 'entrada' THEN tr.timestamp END) -
                COALESCE(
                    MAX(CASE WHEN tr.tipo = 'fin_almuerzo' THEN tr.timestamp END) - 
                    MIN(CASE WHEN tr.tipo = 'inicio_almuerzo' THEN tr.timestamp END),
                    INTERVAL '1 hour'
                )
            )) / 3600.0 - 8.0
        )
    END as horas_extra_diurnas,
    
    -- Horas extra nocturnas (después de 9pm)
    CASE 
        WHEN MAX(CASE WHEN tr.tipo = 'salida' THEN EXTRACT(HOUR FROM tr.timestamp) END) >= 21 
        THEN GREATEST(0, EXTRACT(HOUR FROM MAX(CASE WHEN tr.tipo = 'salida' THEN tr.timestamp END)) - 21)
        ELSE 0
    END as horas_extra_nocturnas,
    
    -- Recargo nocturno (entre 9pm y 6am, sin ser extra)
    CASE 
        WHEN MAX(CASE WHEN tr.tipo = 'salida' THEN EXTRACT(HOUR FROM tr.timestamp) END) >= 21 
        THEN LEAST(3.0, EXTRACT(HOUR FROM MAX(CASE WHEN tr.tipo = 'salida' THEN tr.timestamp END)) - 21)
        ELSE 0
    END as horas_nocturnas,
    
    -- Horas dominicales (domingo)
    CASE 
        WHEN EXTRACT(DOW FROM DATE(tr.timestamp)) = 0 THEN 
            EXTRACT(EPOCH FROM (
                MAX(CASE WHEN tr.tipo = 'salida' THEN tr.timestamp END) - 
                MIN(CASE WHEN tr.tipo = 'entrada' THEN tr.timestamp END) -
                COALESCE(
                    MAX(CASE WHEN tr.tipo = 'fin_almuerzo' THEN tr.timestamp END) - 
                    MIN(CASE WHEN tr.tipo = 'inicio_almuerzo' THEN tr.timestamp END),
                    INTERVAL '0 hours'
                )
            )) / 3600.0
        ELSE 0
    END as horas_dominicales_diurnas,
    
    -- Total horas trabajadas
    EXTRACT(EPOCH FROM (
        MAX(CASE WHEN tr.tipo = 'salida' THEN tr.timestamp END) - 
        MIN(CASE WHEN tr.tipo = 'entrada' THEN tr.timestamp END) -
        COALESCE(
            MAX(CASE WHEN tr.tipo = 'fin_almuerzo' THEN tr.timestamp END) - 
            MIN(CASE WHEN tr.tipo = 'inicio_almuerzo' THEN tr.timestamp END),
            INTERVAL '1 hour'
        )
    )) / 3600.0 as total_horas,
    
    -- Cálculos de pago (usando salario_hora de employees)
    e.salario_hora * 8 as salario_base, -- 8 horas base
    e.salario_hora * 0.35 * CASE WHEN MAX(CASE WHEN tr.tipo = 'salida' THEN EXTRACT(HOUR FROM tr.timestamp) END) >= 21 THEN 1 ELSE 0 END as recargo_nocturno,
    e.salario_hora * 1.0 * CASE WHEN EXTRACT(DOW FROM DATE(tr.timestamp)) = 0 THEN 1 ELSE 0 END as recargo_dominical,
    e.salario_hora * 0.25 * GREATEST(0, EXTRACT(EPOCH FROM (MAX(CASE WHEN tr.tipo = 'salida' THEN tr.timestamp END) - MIN(CASE WHEN tr.tipo = 'entrada' THEN tr.timestamp END))) / 3600.0 - 8.0) as extra_diurna,
    e.salario_hora * 0.75 * CASE WHEN MAX(CASE WHEN tr.tipo = 'salida' THEN EXTRACT(HOUR FROM tr.timestamp) END) >= 21 THEN 1 ELSE 0 END as extra_nocturna,
    e.salario_hora * 1.0 * CASE WHEN EXTRACT(DOW FROM DATE(tr.timestamp)) = 0 THEN EXTRACT(EPOCH FROM (MAX(CASE WHEN tr.tipo = 'salida' THEN tr.timestamp END) - MIN(CASE WHEN tr.tipo = 'entrada' THEN tr.timestamp END))) / 3600.0 ELSE 0 END as extra_dominical_diurna,
    
    -- Total a pagar (cálculo completo)
    (e.salario_hora * 8) + -- Salario base
    (e.salario_hora * 0.35 * CASE WHEN MAX(CASE WHEN tr.tipo = 'salida' THEN EXTRACT(HOUR FROM tr.timestamp) END) >= 21 THEN 1 ELSE 0 END) + -- Recargo nocturno
    (e.salario_hora * 1.0 * CASE WHEN EXTRACT(DOW FROM DATE(tr.timestamp)) = 0 THEN EXTRACT(EPOCH FROM (MAX(CASE WHEN tr.tipo = 'salida' THEN tr.timestamp END) - MIN(CASE WHEN tr.tipo = 'entrada' THEN tr.timestamp END))) / 3600.0 ELSE 0 END) + -- Dominical
    (e.salario_hora * 0.25 * GREATEST(0, EXTRACT(EPOCH FROM (MAX(CASE WHEN tr.tipo = 'salida' THEN tr.timestamp END) - MIN(CASE WHEN tr.tipo = 'entrada' THEN tr.timestamp END))) / 3600.0 - 8.0)) + -- Extra diurna
    (e.salario_hora * 0.75 * CASE WHEN MAX(CASE WHEN tr.tipo = 'salida' THEN EXTRACT(HOUR FROM tr.timestamp) END) >= 21 THEN 1 ELSE 0 END) as total_pago, -- Extra nocturna
    
    -- Contar pausas activas
    COALESCE(ab.pausas_count, 0) as pausas_activas_realizadas

FROM time_records tr
JOIN employees e ON tr.employee_id = e.id
LEFT JOIN (
    SELECT 
        employee_id, 
        DATE(fecha_inicio) as fecha, 
        COUNT(*) as pausas_count
    FROM active_breaks 
    WHERE completada = true 
    GROUP BY employee_id, DATE(fecha_inicio)
) ab ON tr.employee_id = ab.employee_id AND DATE(tr.timestamp) = ab.fecha
WHERE DATE(tr.timestamp) >= CURRENT_DATE - INTERVAL '7 days'
    AND tr.tipo IN ('entrada', 'salida', 'inicio_almuerzo', 'fin_almuerzo')
GROUP BY tr.employee_id, DATE(tr.timestamp), e.salario_hora, ab.pausas_count
HAVING MAX(CASE WHEN tr.tipo = 'salida' THEN tr.timestamp END) IS NOT NULL 
   AND MIN(CASE WHEN tr.tipo = 'entrada' THEN tr.timestamp END) IS NOT NULL;

-- Actualizar racha de pausas para empleados activos
UPDATE employees SET racha_pausas = 
CASE 
    WHEN (
        SELECT COUNT(DISTINCT DATE(fecha_inicio)) 
        FROM active_breaks 
        WHERE employee_id = employees.id 
        AND completada = true 
        AND DATE(fecha_inicio) >= CURRENT_DATE - INTERVAL '7 days'
    ) >= 5 THEN 7  -- Si tuvo pausas 5+ días de la semana = racha de 7
    WHEN (
        SELECT COUNT(DISTINCT DATE(fecha_inicio)) 
        FROM active_breaks 
        WHERE employee_id = employees.id 
        AND completada = true 
        AND DATE(fecha_inicio) >= CURRENT_DATE - INTERVAL '7 days'
    ) >= 3 THEN 5  -- Si tuvo pausas 3+ días = racha de 5
    ELSE 2  -- Racha baja
END
WHERE cedula != '12345678'; -- No actualizar a Luisa

-- Resumen de los datos generados
SELECT 
    'RESUMEN DE DATOS DE PRUEBA GENERADOS' as resumen,
    COUNT(DISTINCT employee_id) as empleados_con_datos,
    COUNT(DISTINCT DATE(timestamp)) as dias_con_registros,
    MIN(DATE(timestamp)) as fecha_inicio,
    MAX(DATE(timestamp)) as fecha_fin
FROM time_records 
WHERE DATE(timestamp) >= CURRENT_DATE - INTERVAL '7 days';

-- Mostrar resumen por empleado
SELECT 
    e.nombre,
    COUNT(DISTINCT DATE(tr.timestamp)) as dias_trabajados,
    SUM(hs.total_horas) as total_horas_semana,
    SUM(hs.horas_extra_diurnas + hs.horas_extra_nocturnas) as total_extras,
    SUM(hs.horas_dominicales_diurnas) as horas_dominicales,
    SUM(hs.total_pago) as total_pago_semana,
    SUM(hs.pausas_activas_realizadas) as total_pausas
FROM employees e
LEFT JOIN time_records tr ON e.id = tr.employee_id 
LEFT JOIN hours_summary hs ON e.id = hs.employee_id AND DATE(tr.timestamp) = hs.fecha
WHERE DATE(tr.timestamp) >= CURRENT_DATE - INTERVAL '7 days'
    AND e.cedula != '12345678'
GROUP BY e.id, e.nombre
ORDER BY e.nombre; 