-- Script de verificación para Dashboard de Luisa
-- Simula las consultas que hará el frontend

-- 1. Verificar empleados activos con datos completos
SELECT 
    'EMPLEADOS ACTIVOS' as seccion,
    COUNT(*) as total,
    COUNT(CASE WHEN salario_hora IS NOT NULL THEN 1 END) as con_salario_hora,
    COUNT(CASE WHEN cargo IS NOT NULL THEN 1 END) as con_cargo
FROM employees 
WHERE activo = true AND cedula != '12345678';

-- 2. Verificar datos de horas (último día disponible)
SELECT 
    'RESUMEN HORAS - ÚLTIMO DÍA' as seccion,
    e.nombre,
    hs.fecha,
    hs.total_horas,
    hs.horas_ordinarias,
    hs.horas_extra_diurnas,
    hs.total_pago,
    hs.pausas_activas_realizadas
FROM employees e
JOIN hours_summary hs ON e.id = hs.employee_id
WHERE e.cedula != '12345678'
ORDER BY hs.fecha DESC, e.nombre
LIMIT 10;

-- 3. Probar función de cálculo de pago
SELECT 
    'PRUEBA FUNCIÓN CALCULATE_PAY' as seccion,
    calculate_pay(
        7812.50, -- salario por hora
        8.0,     -- horas ordinarias
        2.0,     -- horas extra diurnas  
        0.0,     -- horas extra nocturnas
        0.0,     -- horas nocturnas
        0.0,     -- horas dominicales diurnas
        0.0,     -- horas dominicales nocturnas
        0.0,     -- horas festivas diurnas
        0.0      -- horas festivas nocturnas
    ) as calculo_ejemplo;

-- 4. Verificar festivos configurados
SELECT 
    'FESTIVOS CONFIGURADOS' as seccion,
    COUNT(*) as total_festivos,
    MIN(fecha) as primer_festivo,
    MAX(fecha) as ultimo_festivo
FROM holidays;

SELECT 
    'PRÓXIMOS FESTIVOS' as detalle,
    fecha,
    nombre,
    tipo
FROM holidays 
WHERE fecha >= CURRENT_DATE
ORDER BY fecha
LIMIT 5;

-- 5. Probar función is_holiday
SELECT 
    'PRUEBA FUNCIÓN IS_HOLIDAY' as seccion,
    '2025-01-01' as fecha_prueba,
    is_holiday('2025-01-01') as es_festivo_ano_nuevo,
    '2025-06-15' as fecha_normal,
    is_holiday('2025-06-15') as es_festivo_normal;

-- 6. Verificar vista consolidada (la que usará el dashboard)
SELECT 
    'VISTA EMPLOYEE_HOURS_SUMMARY' as seccion,
    COUNT(*) as registros_disponibles
FROM employee_hours_summary;

SELECT 
    'DATOS VISTA - MUESTRA' as detalle,
    nombre,
    fecha,
    total_horas,
    total_horas_extra,
    total_horas_dominicales,
    total_pago,
    eficiencia_pausas,
    es_domingo,
    es_festivo
FROM employee_hours_summary
WHERE fecha IS NOT NULL
ORDER BY fecha DESC, nombre
LIMIT 5;

-- 7. Verificar registros de tiempo (para dashboard en tiempo real)
SELECT 
    'REGISTROS DE TIEMPO RECIENTES' as seccion,
    COUNT(*) as total_registros,
    COUNT(DISTINCT employee_id) as empleados_con_registros,
    MAX(timestamp) as ultimo_registro
FROM time_records
WHERE timestamp >= CURRENT_DATE - INTERVAL '7 days';

-- 8. Verificar pausas activas (para reportes de bienestar)
SELECT 
    'PAUSAS ACTIVAS' as seccion,
    COUNT(*) as total_pausas,
    COUNT(CASE WHEN completada = true THEN 1 END) as pausas_completadas,
    COUNT(DISTINCT employee_id) as empleados_activos
FROM active_breaks
WHERE fecha_inicio >= CURRENT_DATE - INTERVAL '7 days';

-- 9. Simular consulta semanal (lo que hará Luisa)
SELECT 
    'REPORTE SEMANAL SIMULADO' as seccion,
    e.nombre,
    COUNT(hs.fecha) as dias_trabajados,
    ROUND(SUM(hs.total_horas), 1) as total_horas_semana,
    ROUND(SUM(hs.horas_extra_diurnas + hs.horas_extra_nocturnas), 1) as total_extras,
    SUM(hs.pausas_activas_realizadas) as total_pausas,
    TO_CHAR(SUM(hs.total_pago), 'FM$999,999') as total_pago_semana
FROM employees e
LEFT JOIN hours_summary hs ON e.id = hs.employee_id 
    AND hs.fecha >= CURRENT_DATE - INTERVAL '7 days'
WHERE e.cedula != '12345678' AND e.activo = true
GROUP BY e.id, e.nombre
ORDER BY SUM(hs.total_pago) DESC;

-- 10. Verificar integridad de datos para frontend
SELECT 
    'INTEGRIDAD PARA FRONTEND' as verificacion,
    CASE 
        WHEN (SELECT COUNT(*) FROM employees WHERE activo = true AND cedula != '12345678' AND salario_hora IS NOT NULL) >= 3
        THEN '✅ Empleados OK'
        ELSE '❌ Faltan empleados o salarios'
    END as empleados_status,
    
    CASE 
        WHEN (SELECT COUNT(*) FROM hours_summary) >= 3
        THEN '✅ Hours Summary OK' 
        ELSE '❌ Faltan registros de horas'
    END as horas_status,
    
    CASE 
        WHEN (SELECT COUNT(*) FROM holidays) >= 10
        THEN '✅ Festivos OK'
        ELSE '❌ Faltan festivos'
    END as festivos_status,
    
    CASE 
        WHEN (SELECT COUNT(*) FROM information_schema.routines WHERE routine_name IN ('is_holiday', 'calculate_pay')) = 2
        THEN '✅ Funciones OK'
        ELSE '❌ Faltan funciones'
    END as funciones_status; 