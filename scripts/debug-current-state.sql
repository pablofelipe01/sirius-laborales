-- 🔍 SCRIPT DE DIAGNÓSTICO EXHAUSTIVO
-- Investigar estado actual de Pablo y problemas en nómina/quincenas
-- Ejecutar en SQL Editor de Supabase

-- ========================================
-- 1. VERIFICAR ESTADO ACTUAL DE PABLO
-- ========================================

-- 1.1 Info básica de Pablo
SELECT 
    '🔍 PABLO ACEBEDO - DATOS BÁSICOS' as seccion,
    e.id,
    e.cedula,
    e.nombre,
    e.apodo,
    e.salario,
    e.salario_hora,
    e.cargo,
    e.departamento,
    e.activo,
    e.created_at
FROM employees e 
WHERE e.cedula = '79454772' OR e.nombre ILIKE '%pablo%';

-- 1.2 Registros de tiempo de Pablo HOY
SELECT 
    '📅 PABLO - REGISTROS DE HOY' as seccion,
    tr.id,
    tr.tipo,
    tr.timestamp,
    tr.timestamp AT TIME ZONE 'UTC' AT TIME ZONE 'America/Bogota' as timestamp_colombia,
    tr.mensaje_motivacional,
    tr.created_at
FROM time_records tr
JOIN employees e ON tr.employee_id = e.id
WHERE e.cedula = '79454772'
  AND DATE(tr.timestamp) = CURRENT_DATE
ORDER BY tr.timestamp ASC;

-- 1.3 Registros de tiempo de Pablo ÚLTIMOS 3 DÍAS
SELECT 
    '📊 PABLO - ÚLTIMOS 3 DÍAS' as seccion,
    DATE(tr.timestamp) as fecha,
    tr.tipo,
    tr.timestamp AT TIME ZONE 'UTC' AT TIME ZONE 'America/Bogota' as timestamp_colombia,
    tr.mensaje_motivacional
FROM time_records tr
JOIN employees e ON tr.employee_id = e.id
WHERE e.cedula = '79454772'
  AND DATE(tr.timestamp) >= CURRENT_DATE - INTERVAL '3 days'
ORDER BY tr.timestamp ASC;

-- 1.4 Hours_summary de Pablo
SELECT 
    '💰 PABLO - HOURS SUMMARY' as seccion,
    hs.fecha,
    hs.horas_ordinarias,
    hs.horas_extra_diurnas,
    hs.total_horas,
    hs.salario_base,
    hs.total_pago,
    hs.created_at,
    hs.updated_at
FROM hours_summary hs
JOIN employees e ON hs.employee_id = e.id
WHERE e.cedula = '79454772'
ORDER BY hs.fecha DESC
LIMIT 10;

-- ========================================
-- 2. VERIFICAR ESTADO GENERAL DE EMPLEADOS
-- ========================================

-- 2.1 Todos los empleados activos
SELECT 
    '👥 TODOS LOS EMPLEADOS ACTIVOS' as seccion,
    e.cedula,
    e.nombre,
    e.apodo,
    e.salario_hora,
    e.activo,
    e.created_at
FROM employees e 
WHERE e.activo = true
ORDER BY e.created_at DESC;

-- 2.2 Estado actual de todos los empleados HOY
SELECT 
    '📈 ESTADO HOY - TODOS LOS EMPLEADOS' as seccion,
    e.nombre,
    e.cedula,
    COUNT(tr.id) as registros_hoy,
    MAX(CASE WHEN tr.tipo = 'entrada' THEN tr.timestamp END) as ultima_entrada,
    MAX(CASE WHEN tr.tipo = 'salida' THEN tr.timestamp END) as ultima_salida,
    CASE 
        WHEN MAX(CASE WHEN tr.tipo = 'salida' THEN tr.timestamp END) IS NOT NULL 
        THEN 'Terminado'
        WHEN MAX(CASE WHEN tr.tipo = 'entrada' THEN tr.timestamp END) IS NOT NULL
        THEN 'Trabajando'
        ELSE 'Sin actividad'
    END as estado_calculado
FROM employees e
LEFT JOIN time_records tr ON e.id = tr.employee_id 
    AND DATE(tr.timestamp) = CURRENT_DATE
WHERE e.activo = true
GROUP BY e.id, e.nombre, e.cedula
ORDER BY e.nombre;

-- ========================================
-- 3. VERIFICAR HOURS_SUMMARY
-- ========================================

-- 3.1 Resumen general de hours_summary
SELECT 
    '📊 HOURS_SUMMARY - RESUMEN GENERAL' as seccion,
    COUNT(*) as total_registros,
    COUNT(DISTINCT employee_id) as empleados_diferentes,
    MIN(fecha) as fecha_mas_antigua,
    MAX(fecha) as fecha_mas_reciente,
    SUM(total_horas) as total_horas_sistema,
    SUM(total_pago) as total_pagos_sistema
FROM hours_summary;

-- 3.2 Hours_summary por fecha (últimos 7 días)
SELECT 
    '📅 HOURS_SUMMARY - ÚLTIMOS 7 DÍAS' as seccion,
    hs.fecha,
    COUNT(*) as empleados_con_datos,
    SUM(hs.total_horas) as total_horas_dia,
    SUM(hs.total_pago) as total_pago_dia,
    AVG(hs.total_horas) as promedio_horas_empleado
FROM hours_summary hs
WHERE hs.fecha >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY hs.fecha
ORDER BY hs.fecha DESC;

-- 3.3 Empleados CON datos en hours_summary HOY
SELECT 
    '✅ EMPLEADOS CON HOURS_SUMMARY HOY' as seccion,
    e.nombre,
    e.cedula,
    hs.total_horas,
    hs.salario_base,
    hs.total_pago
FROM hours_summary hs
JOIN employees e ON hs.employee_id = e.id
WHERE hs.fecha = CURRENT_DATE
ORDER BY e.nombre;

-- 3.4 Empleados SIN datos en hours_summary HOY pero CON actividad
SELECT 
    '❌ EMPLEADOS SIN HOURS_SUMMARY HOY (pero con actividad)' as seccion,
    e.nombre,
    e.cedula,
    COUNT(tr.id) as registros_hoy,
    MAX(tr.timestamp) as ultimo_registro
FROM employees e
JOIN time_records tr ON e.id = tr.employee_id
LEFT JOIN hours_summary hs ON e.id = hs.employee_id AND hs.fecha = CURRENT_DATE
WHERE DATE(tr.timestamp) = CURRENT_DATE
  AND hs.id IS NULL  -- No tiene entrada en hours_summary HOY
  AND e.activo = true
GROUP BY e.id, e.nombre, e.cedula
ORDER BY e.nombre;

-- ========================================
-- 4. VERIFICAR PROBLEMAS DE DATOS DE PRUEBA
-- ========================================

-- 4.1 Empleados que podrían ser de prueba
SELECT 
    '🧪 POSIBLES EMPLEADOS DE PRUEBA' as seccion,
    e.nombre,
    e.cedula,
    e.salario_hora,
    e.created_at,
    CASE 
        WHEN e.cedula IN ('11111111', '22222222', '33333333', '44444444', '55555555', '66666666', '77777777', '88888888') 
        THEN 'DUMMY DATA'
        WHEN e.nombre ILIKE '%juan%' OR e.nombre ILIKE '%maria%' OR e.nombre ILIKE '%carlos%' OR e.nombre ILIKE '%ana%'
        THEN 'POSIBLE DUMMY'
        ELSE 'REAL'
    END as tipo_empleado
FROM employees e
WHERE e.activo = true
ORDER BY e.created_at DESC;

-- 4.2 Registros que podrían ser de prueba (patrones sospechosos)
SELECT 
    '⚠️ REGISTROS SOSPECHOSOS (patrones de prueba)' as seccion,
    DATE(tr.timestamp) as fecha,
    COUNT(*) as total_registros,
    COUNT(DISTINCT tr.employee_id) as empleados_distintos,
    MIN(tr.timestamp) as primer_registro,
    MAX(tr.timestamp) as ultimo_registro,
    CASE 
        WHEN COUNT(*) % 4 = 0 AND COUNT(DISTINCT tr.employee_id) = COUNT(*) / 4 
        THEN 'PATRÓN DUMMY (4 registros por empleado)'
        WHEN (MIN(tr.timestamp))::time = '08:00:00' AND (MAX(tr.timestamp))::time = '17:00:00'
        THEN 'PATRÓN DUMMY (8-17 exacto)'
        ELSE 'NORMAL'
    END as patron_detectado
FROM time_records tr
WHERE DATE(tr.timestamp) >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY DATE(tr.timestamp)
ORDER BY DATE(tr.timestamp) DESC;

-- ========================================
-- 5. DIAGNÓSTICO DE CÁLCULOS
-- ========================================

-- 5.1 Verificar función calculateWorkHours simulada
WITH pablo_hoy AS (
    SELECT 
        e.id as employee_id,
        MIN(CASE WHEN tr.tipo = 'entrada' THEN tr.timestamp END) as entrada,
        MAX(CASE WHEN tr.tipo = 'salida' THEN tr.timestamp END) as salida,
        MIN(CASE WHEN tr.tipo = 'inicio_almuerzo' THEN tr.timestamp END) as inicio_almuerzo,
        MAX(CASE WHEN tr.tipo = 'fin_almuerzo' THEN tr.timestamp END) as fin_almuerzo
    FROM employees e
    LEFT JOIN time_records tr ON e.id = tr.employee_id 
        AND DATE(tr.timestamp) = CURRENT_DATE
    WHERE e.cedula = '79454772'
    GROUP BY e.id
)
SELECT 
    '🧮 PABLO - CÁLCULO MANUAL DE HORAS HOY' as seccion,
    ph.entrada,
    ph.salida,
    ph.inicio_almuerzo,
    ph.fin_almuerzo,
    CASE 
        WHEN ph.entrada IS NULL THEN 'Sin entrada registrada'
        WHEN ph.salida IS NULL THEN 'Trabajando actualmente'
        ELSE 'Jornada completada'
    END as estado,
    CASE 
        WHEN ph.entrada IS NOT NULL AND ph.salida IS NOT NULL THEN
            EXTRACT(EPOCH FROM (
                ph.salida - ph.entrada - 
                COALESCE(ph.fin_almuerzo - ph.inicio_almuerzo, INTERVAL '0 minutes')
            )) / 3600.0
        WHEN ph.entrada IS NOT NULL THEN
            EXTRACT(EPOCH FROM (
                NOW() - ph.entrada - 
                COALESCE(ph.fin_almuerzo - ph.inicio_almuerzo, INTERVAL '0 minutes')
            )) / 3600.0
        ELSE 0
    END as horas_calculadas_manual
FROM pablo_hoy ph;

-- ========================================
-- 6. VERIFICAR PROBLEMAS ESPECÍFICOS
-- ========================================

-- 6.1 Buscar registros duplicados o inconsistentes
SELECT 
    '🔍 REGISTROS DUPLICADOS O INCONSISTENTES' as seccion,
    tr.employee_id,
    e.nombre,
    DATE(tr.timestamp) as fecha,
    tr.tipo,
    COUNT(*) as cantidad,
    STRING_AGG(tr.timestamp::text, ', ') as timestamps
FROM time_records tr
JOIN employees e ON tr.employee_id = e.id
WHERE DATE(tr.timestamp) >= CURRENT_DATE - INTERVAL '3 days'
GROUP BY tr.employee_id, e.nombre, DATE(tr.timestamp), tr.tipo
HAVING COUNT(*) > 1
ORDER BY DATE(tr.timestamp) DESC, e.nombre;

-- 6.2 Verificar salarios y cálculos
SELECT 
    '💰 VERIFICACIÓN DE SALARIOS' as seccion,
    e.nombre,
    e.cedula,
    e.salario,
    e.salario_hora,
    CASE 
        WHEN e.salario_hora IS NULL THEN 'FALTA SALARIO_HORA'
        WHEN e.salario_hora = 0 THEN 'SALARIO_HORA = 0'
        WHEN e.salario IS NULL THEN 'FALTA SALARIO'
        ELSE 'OK'
    END as estado_salario
FROM employees e
WHERE e.activo = true
ORDER BY e.nombre;

-- ========================================
-- 7. RESUMEN EJECUTIVO
-- ========================================

SELECT 
    '📋 RESUMEN EJECUTIVO DE PROBLEMAS' as titulo,
    
    (SELECT COUNT(*) FROM employees WHERE activo = true) as total_empleados_activos,
    
    (SELECT COUNT(*) 
     FROM employees e 
     JOIN time_records tr ON e.id = tr.employee_id 
     WHERE DATE(tr.timestamp) = CURRENT_DATE 
       AND e.activo = true) as empleados_con_actividad_hoy,
    
    (SELECT COUNT(*) 
     FROM hours_summary 
     WHERE fecha = CURRENT_DATE) as empleados_en_hours_summary_hoy,
    
    (SELECT COUNT(*) 
     FROM employees e 
     WHERE e.cedula = '79454772' 
       AND EXISTS (
           SELECT 1 FROM time_records tr 
           WHERE tr.employee_id = e.id 
             AND DATE(tr.timestamp) = CURRENT_DATE
             AND tr.tipo = 'salida'
       )) as pablo_registro_salida_hoy,
    
    (SELECT COUNT(*) 
     FROM employees 
     WHERE salario_hora IS NULL OR salario_hora = 0) as empleados_sin_salario_hora; 