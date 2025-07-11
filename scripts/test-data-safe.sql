-- Script seguro para generar datos de prueba en Supabase
-- Ejecutar directamente en el editor SQL de Supabase

-- 1. Limpiar datos de prueba existentes de la última semana
DELETE FROM hours_summary WHERE fecha >= CURRENT_DATE - INTERVAL '7 days';
DELETE FROM active_breaks WHERE DATE(fecha_inicio) >= CURRENT_DATE - INTERVAL '7 days';
DELETE FROM time_records WHERE DATE(timestamp) >= CURRENT_DATE - INTERVAL '7 days';

-- 2. Asegurar que tenemos salario_hora en employees
UPDATE employees SET 
  salario_hora = CASE 
    WHEN salario_hora IS NULL THEN ROUND(salario / 192, 2)
    ELSE salario_hora
  END
WHERE salario_hora IS NULL OR salario_hora = 0;

-- 3. Generar datos de prueba para la semana pasada
-- Variables para fechas (semana pasada: lunes a domingo)
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
BEGIN
    -- Obtener IDs de empleados
    SELECT ARRAY_AGG(id) INTO emp_ids 
    FROM (
        SELECT id FROM employees 
        WHERE cedula != '12345678' -- Excluir a Luisa (admin)
        ORDER BY nombre 
        LIMIT 8
    ) e;

    -- Asignar IDs individuales para facilidad
    juan_id := emp_ids[1];    -- Juan Carlos
    maria_id := emp_ids[2];   -- María Elena  
    carlos_id := emp_ids[3];  -- Carlos Alberto
    ana_id := emp_ids[4];     -- Ana Sofía
    david_id := emp_ids[5];   -- David Fernando
    laura_id := emp_ids[6];   -- Laura Camila
    miguel_id := emp_ids[7];  -- Miguel Andrés
    vale_id := emp_ids[8];    -- Valentina

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

    -- Pausas activas del lunes
    INSERT INTO active_breaks (employee_id, fecha_inicio, fecha_fin, duracion_segundos, tipo, completada, estado_animo_antes, estado_animo_despues) VALUES
    (juan_id, lunes + TIME '10:30:00', lunes + TIME '10:33:00', 180, 'respiracion', true, 'bien', 'feliz'),
    (juan_id, lunes + TIME '15:00:00', lunes + TIME '15:05:00', 300, 'estiramiento', true, 'cansado', 'bien'),
    (maria_id, lunes + TIME '10:00:00', lunes + TIME '10:03:00', 180, 'gratitud', true, 'estresado', 'feliz'),
    (maria_id, lunes + TIME '16:30:00', lunes + TIME '16:35:00', 300, 'caminata', true, 'bien', 'feliz'),
    (carlos_id, lunes + TIME '16:30:00', lunes + TIME '16:33:00', 180, 'respiracion', true, 'cansado', 'bien');

    -- ===== MARTES =====
    INSERT INTO time_records (employee_id, tipo, timestamp, mensaje_motivacional) VALUES
    -- Ana Sofía - Día normal con muchas pausas (9 horas)
    (ana_id, 'entrada', martes + TIME '08:00:00', '¡Puntual como siempre Ana! 🌟'),
    (ana_id, 'inicio_almuerzo', martes + TIME '12:15:00', 'Disfruta tu almuerzo Ana 🌸'),
    (ana_id, 'fin_almuerzo', martes + TIME '13:15:00', 'Renovada para la tarde'),
    (ana_id, 'salida', martes + TIME '17:00:00', 'Día completo de bienestar Ana! 🌺'),
    
    -- David - Llegada tarde, compensación (9 horas)
    (david_id, 'entrada', martes + TIME '09:30:00', 'Buenos días David! Nunca es tarde para empezar bien 😊'),
    (david_id, 'inicio_almuerzo', martes + TIME '13:30:00', 'Momento de recargar David 🍃'),
    (david_id, 'fin_almuerzo', martes + TIME '14:30:00', 'Listo para la tarde David'),
    (david_id, 'salida', martes + TIME '18:30:00', 'Jornada compensada completada! 💪');

    -- Pausas del martes
    INSERT INTO active_breaks (employee_id, fecha_inicio, fecha_fin, duracion_segundos, tipo, completada, estado_animo_antes, estado_animo_despues) VALUES
    (ana_id, martes + TIME '10:00:00', martes + TIME '10:03:00', 180, 'respiracion', true, 'bien', 'feliz'),
    (ana_id, martes + TIME '14:30:00', martes + TIME '14:35:00', 300, 'estiramiento', true, 'bien', 'feliz'),
    (ana_id, martes + TIME '16:00:00', martes + TIME '16:03:00', 180, 'gratitud', true, 'feliz', 'feliz'),
    (david_id, martes + TIME '11:00:00', martes + TIME '11:05:00', 300, 'caminata', true, 'estresado', 'bien');

    -- ===== MIÉRCOLES =====
    INSERT INTO time_records (employee_id, tipo, timestamp, mensaje_motivacional) VALUES
    -- Laura - Día normal (9 horas)
    (laura_id, 'entrada', miercoles + TIME '08:10:00', 'Buenos días Laura! Tu sonrisa ilumina el día 🌺'),
    (laura_id, 'inicio_almuerzo', miercoles + TIME '12:45:00', 'Nutrite bien Laura 💚'),
    (laura_id, 'fin_almuerzo', miercoles + TIME '13:45:00', 'Energía renovada Laura'),
    (laura_id, 'salida', miercoles + TIME '17:10:00', 'Otro día exitoso Laura! 🌟'),
    
    -- Miguel - Con extras significativas (11.25 horas)
    (miguel_id, 'entrada', miercoles + TIME '08:30:00', 'Buenos días Miguel! Día productivo por delante 🌵'),
    (miguel_id, 'inicio_almuerzo', miercoles + TIME '13:00:00', 'Pausa merecida Miguel 🍽️'),
    (miguel_id, 'fin_almuerzo', miercoles + TIME '14:00:00', 'Recargado Miguel!'),
    (miguel_id, 'salida', miercoles + TIME '19:45:00', 'Jornada extendida exitosa Miguel! 🚀');

    -- ===== JUEVES =====
    INSERT INTO time_records (employee_id, tipo, timestamp, mensaje_motivacional) VALUES
    -- Valentina - Día perfecto con pausas modelo (9 horas)
    (vale_id, 'entrada', jueves + TIME '07:55:00', 'Buenos días Vale! Siempre radiante 🌼'),
    (vale_id, 'inicio_almuerzo', jueves + TIME '12:20:00', 'Disfruta tu almuerzo Vale ☀️'),
    (vale_id, 'fin_almuerzo', jueves + TIME '13:20:00', 'Lista para brillar en la tarde'),
    (vale_id, 'salida', jueves + TIME '16:55:00', 'Día perfecto completado Vale! ✨');

    -- Pausas modelo del jueves
    INSERT INTO active_breaks (employee_id, fecha_inicio, fecha_fin, duracion_segundos, tipo, completada, estado_animo_antes, estado_animo_despues) VALUES
    (vale_id, jueves + TIME '10:15:00', jueves + TIME '10:18:00', 180, 'respiracion', true, 'bien', 'feliz'),
    (vale_id, jueves + TIME '14:30:00', jueves + TIME '14:35:00', 300, 'estiramiento', true, 'bien', 'feliz'),
    (vale_id, jueves + TIME '16:00:00', jueves + TIME '16:03:00', 180, 'gratitud', true, 'feliz', 'feliz');

    -- ===== VIERNES =====
    INSERT INTO time_records (employee_id, tipo, timestamp, mensaje_motivacional) VALUES
    -- Juan Carlos - Viernes normal (8.67 horas)
    (juan_id, 'entrada', viernes + TIME '08:20:00', '¡TGIF Juan! Viernes de energía 🎉'),
    (juan_id, 'inicio_almuerzo', viernes + TIME '12:30:00', 'Almuerzo de viernes especial 🍽️'),
    (juan_id, 'fin_almuerzo', viernes + TIME '13:30:00', 'Tarde de viernes productiva'),
    (juan_id, 'salida', viernes + TIME '17:00:00', '¡Fin de semana merecido Juan! 🎊'),
    
    -- María Elena - Viernes con algunas extras (10 horas)
    (maria_id, 'entrada', viernes + TIME '08:00:00', 'Viernes productivo María! 🌟'),
    (maria_id, 'inicio_almuerzo', viernes + TIME '12:00:00', 'Almuerzo relajante de viernes'),
    (maria_id, 'fin_almuerzo', viernes + TIME '13:00:00', 'Última tarde de la semana'),
    (maria_id, 'salida', viernes + TIME '18:00:00', 'Semana completada con éxito María! 🏆');

    -- Pausas del viernes
    INSERT INTO active_breaks (employee_id, fecha_inicio, fecha_fin, duracion_segundos, tipo, completada, estado_animo_antes, estado_animo_despues) VALUES
    (juan_id, viernes + TIME '10:30:00', viernes + TIME '10:33:00', 180, 'respiracion', true, 'bien', 'feliz'),
    (juan_id, viernes + TIME '15:00:00', viernes + TIME '15:05:00', 300, 'estiramiento', true, 'cansado', 'bien'),
    (maria_id, viernes + TIME '10:00:00', viernes + TIME '10:03:00', 180, 'gratitud', true, 'bien', 'feliz');

    -- ===== SÁBADO - Trabajo de fin de semana (horas dominicales) =====
    INSERT INTO time_records (employee_id, tipo, timestamp, mensaje_motivacional) VALUES
    -- Carlos - Turno sábado completo (8 horas dominicales)
    (carlos_id, 'entrada', sabado + TIME '09:00:00', 'Sábado especial Carlos! Día de extras 💪'),
    (carlos_id, 'inicio_almuerzo', sabado + TIME '13:00:00', 'Almuerzo de sábado merecido'),
    (carlos_id, 'fin_almuerzo', sabado + TIME '14:00:00', 'Tarde de sábado productiva'),
    (carlos_id, 'salida', sabado + TIME '17:00:00', 'Sábado productivo completado Carlos! 🌟'),
    
    -- Miguel - Medio día sábado (4 horas dominicales)
    (miguel_id, 'entrada', sabado + TIME '08:00:00', 'Sábado matutino Miguel! 🌅'),
    (miguel_id, 'salida', sabado + TIME '12:00:00', 'Media jornada completada! Disfruta el resto del sábado 🎉');

    -- Pausas del sábado
    INSERT INTO active_breaks (employee_id, fecha_inicio, fecha_fin, duracion_segundos, tipo, completada, estado_animo_antes, estado_animo_despues) VALUES
    (carlos_id, sabado + TIME '11:00:00', sabado + TIME '11:03:00', 180, 'respiracion', true, 'bien', 'feliz'),
    (miguel_id, sabado + TIME '10:00:00', sabado + TIME '10:05:00', 300, 'caminata', true, 'bien', 'feliz');

    -- ===== DOMINGO - Trabajo dominical especial =====
    INSERT INTO time_records (employee_id, tipo, timestamp, mensaje_motivacional) VALUES
    -- David - Turno especial domingo (4 horas dominicales)
    (david_id, 'entrada', domingo + TIME '10:00:00', 'Domingo especial David! Gracias por tu dedicación 🙏'),
    (david_id, 'salida', domingo + TIME '14:00:00', 'Domingo completado David! Descansa el resto del día 🌞');

    RAISE NOTICE 'Time records y pausas activas insertados exitosamente';

END $$;

-- 4. Generar hours_summary automáticamente
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
        -- Calcular total de horas trabajadas (entrada a salida menos almuerzo)
        EXTRACT(EPOCH FROM (
            MAX(CASE WHEN tr.tipo = 'salida' THEN tr.timestamp END) - 
            MIN(CASE WHEN tr.tipo = 'entrada' THEN tr.timestamp END) -
            COALESCE(
                MAX(CASE WHEN tr.tipo = 'fin_almuerzo' THEN tr.timestamp END) - 
                MIN(CASE WHEN tr.tipo = 'inicio_almuerzo' THEN tr.timestamp END),
                INTERVAL '1 hour'  -- Asumir 1 hora de almuerzo si no hay registro
            )
        )) / 3600.0 AS total_horas,
        
        -- Verificar si es domingo
        EXTRACT(DOW FROM DATE(tr.timestamp)) = 0 AS es_domingo,
        
        -- Verificar si hay trabajo nocturno (salida después de 9pm)
        MAX(CASE WHEN tr.tipo = 'salida' THEN EXTRACT(HOUR FROM tr.timestamp) END) >= 21 AS es_nocturno,
        
        -- Hora de salida para cálculos nocturno
        MAX(CASE WHEN tr.tipo = 'salida' THEN EXTRACT(HOUR FROM tr.timestamp) END) AS hora_salida
        
    FROM time_records tr
    JOIN employees e ON tr.employee_id = e.id
    WHERE DATE(tr.timestamp) >= CURRENT_DATE - INTERVAL '7 days'
    GROUP BY tr.employee_id, DATE(tr.timestamp), e.salario_hora
    HAVING MAX(CASE WHEN tr.tipo = 'salida' THEN tr.timestamp END) IS NOT NULL 
       AND MIN(CASE WHEN tr.tipo = 'entrada' THEN tr.timestamp END) IS NOT NULL
),
hours_breakdown AS (
    SELECT *,
        -- Calcular distribución de horas
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
            WHEN NOT es_domingo AND es_nocturno AND total_horas <= 8 
            THEN LEAST(3.0, hora_salida - 21)
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
        (salario_hora * 1.0 * horas_dominicales_diurnas) +
        (salario_hora * 0.25 * horas_extra_diurnas) +
        (salario_hora * 0.75 * horas_extra_nocturnas) +
        (salario_hora * 1.0 * horas_dominicales_diurnas)
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

-- 5. Actualizar rachas de pausas activas
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
WHERE cedula != '12345678'; -- No actualizar a Luisa (admin)

-- 6. Mostrar resumen de datos generados
SELECT 
    '🎉 RESUMEN DE DATOS DE PRUEBA GENERADOS' as titulo,
    COUNT(DISTINCT employee_id) as empleados_con_datos,
    COUNT(DISTINCT fecha) as dias_con_registros,
    MIN(fecha) as fecha_inicio,
    MAX(fecha) as fecha_fin,
    SUM(total_horas) as total_horas_semana,
    SUM(total_pago) as total_nomina_semana
FROM hours_summary 
WHERE fecha >= CURRENT_DATE - INTERVAL '7 days';

-- 7. Resumen detallado por empleado
SELECT 
    '👥 RESUMEN POR EMPLEADO' as seccion,
    e.nombre,
    COUNT(hs.fecha) as dias_trabajados,
    ROUND(SUM(hs.total_horas), 1) as total_horas,
    ROUND(SUM(hs.horas_extra_diurnas + hs.horas_extra_nocturnas), 1) as horas_extra,
    ROUND(SUM(hs.horas_dominicales_diurnas), 1) as horas_dominicales,
    SUM(hs.pausas_activas_realizadas) as pausas_realizadas,
    TO_CHAR(SUM(hs.total_pago), 'FM$999,999,999') as pago_semana_cop
FROM employees e
LEFT JOIN hours_summary hs ON e.id = hs.employee_id 
WHERE hs.fecha >= CURRENT_DATE - INTERVAL '7 days'
  AND e.cedula != '12345678'
GROUP BY e.id, e.nombre
ORDER BY SUM(hs.total_pago) DESC; 