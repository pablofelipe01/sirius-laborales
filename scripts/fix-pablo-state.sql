-- 🔧 SCRIPT ESPECÍFICO PARA CORREGIR PABLO
-- Solucionar problema de estado "Terminado" y datos inconsistentes
-- Ejecutar en SQL Editor de Supabase

-- ========================================
-- 1. DIAGNÓSTICO INICIAL DE PABLO
-- ========================================

-- 1.1 Estado actual completo de Pablo
SELECT 
    '🔍 PABLO - ESTADO ACTUAL COMPLETO' as diagnostico,
    e.id,
    e.cedula,
    e.nombre,
    e.apodo,
    e.salario,
    e.salario_hora,
    e.cargo,
    e.departamento,
    e.activo
FROM employees e 
WHERE e.cedula = '79454772';

-- 1.2 Todos los registros de Pablo HOY
SELECT 
    '📅 PABLO - TODOS LOS REGISTROS HOY' as diagnostico,
    tr.id,
    tr.tipo,
    tr.timestamp,
    tr.timestamp AT TIME ZONE 'America/Bogota' as hora_colombia,
    tr.mensaje_motivacional,
    tr.created_at
FROM time_records tr
JOIN employees e ON tr.employee_id = e.id
WHERE e.cedula = '79454772'
  AND DATE(tr.timestamp) = CURRENT_DATE
ORDER BY tr.timestamp ASC;

-- ========================================
-- 2. CORRECCIONES ESPECÍFICAS
-- ========================================

-- 2.1 Asegurar que Pablo tiene salario_hora correcto
UPDATE employees SET 
    salario = 39130,
    salario_hora = 244.56,  -- $39,130 / 160 horas mensuales
    cargo = 'CTO',
    departamento = 'Tecnología',
    activo = true
WHERE cedula = '79454772';

-- 2.2 LIMPIAR registros incorrectos de Pablo HOY
-- Solo si tiene registro de salida automático o incorrecto
DELETE FROM time_records 
WHERE employee_id = (SELECT id FROM employees WHERE cedula = '79454772')
  AND DATE(timestamp) = CURRENT_DATE
  AND tipo = 'salida'
  AND (
    mensaje_motivacional ILIKE '%dummy%' 
    OR mensaje_motivacional ILIKE '%test%'
    OR mensaje_motivacional ILIKE '%prueba%'
    OR timestamp::time = '17:00:00'  -- Horario típico de datos de prueba
  );

-- 2.3 Asegurar entrada correcta de Pablo si no existe
DO $$
DECLARE
    pablo_id UUID;
    tiene_entrada BOOLEAN := false;
BEGIN
    -- Obtener ID de Pablo
    SELECT id INTO pablo_id FROM employees WHERE cedula = '79454772';
    
    IF pablo_id IS NOT NULL THEN
        -- Verificar si tiene entrada HOY
        SELECT EXISTS(
            SELECT 1 FROM time_records 
            WHERE employee_id = pablo_id 
              AND DATE(timestamp) = CURRENT_DATE 
              AND tipo = 'entrada'
        ) INTO tiene_entrada;
        
        -- Si no tiene entrada válida, crear una basada en la hora actual o 7:04 AM
        IF NOT tiene_entrada THEN
            -- Si son después de las 7:04, usar 7:04. Si es antes, usar hora actual
            INSERT INTO time_records (employee_id, tipo, timestamp, mensaje_motivacional)
            VALUES (
                pablo_id, 
                'entrada', 
                CASE 
                    WHEN EXTRACT(HOUR FROM NOW()) >= 7 THEN CURRENT_DATE + TIME '07:04:00'
                    ELSE NOW() 
                END,
                'Buenos días! Iniciando jornada laboral 🌱'
            );
            
            RAISE NOTICE 'Entrada creada para Pablo';
        END IF;
    END IF;
END $$;

-- ========================================
-- 3. VERIFICAR Y LIMPIAR HOURS_SUMMARY
-- ========================================

-- 3.1 Verificar si Pablo tiene entrada incorrecta en hours_summary HOY
SELECT 
    '💰 PABLO - HOURS_SUMMARY HOY' as diagnostico,
    hs.fecha,
    hs.total_horas,
    hs.salario_base,
    hs.total_pago,
    hs.created_at
FROM hours_summary hs
JOIN employees e ON hs.employee_id = e.id
WHERE e.cedula = '79454772'
  AND hs.fecha = CURRENT_DATE;

-- 3.2 ELIMINAR entrada incorrecta de hours_summary HOY si existe
-- (Pablo debería calcularse en tiempo real, no tener entrada en hours_summary hasta completar jornada)
DELETE FROM hours_summary 
WHERE employee_id = (SELECT id FROM employees WHERE cedula = '79454772')
  AND fecha = CURRENT_DATE;

-- ========================================
-- 4. VERIFICACIONES POST-CORRECCIÓN
-- ========================================

-- 4.1 Estado final de Pablo
SELECT 
    '✅ PABLO - ESTADO DESPUÉS DE CORRECCIÓN' as verificacion,
    e.nombre,
    e.salario_hora,
    COUNT(tr.id) as registros_hoy,
    STRING_AGG(tr.tipo, ', ' ORDER BY tr.timestamp) as tipos_registros,
    MIN(tr.timestamp) as primer_registro,
    MAX(tr.timestamp) as ultimo_registro,
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
WHERE e.cedula = '79454772'
GROUP BY e.id, e.nombre, e.salario_hora;

-- 4.2 Cálculo manual de horas trabajadas por Pablo
WITH pablo_hoy AS (
    SELECT 
        MIN(CASE WHEN tr.tipo = 'entrada' THEN tr.timestamp END) as entrada,
        MAX(CASE WHEN tr.tipo = 'salida' THEN tr.timestamp END) as salida,
        MIN(CASE WHEN tr.tipo = 'inicio_almuerzo' THEN tr.timestamp END) as inicio_almuerzo,
        MAX(CASE WHEN tr.tipo = 'fin_almuerzo' THEN tr.timestamp END) as fin_almuerzo
    FROM time_records tr
    JOIN employees e ON tr.employee_id = e.id
    WHERE e.cedula = '79454772'
      AND DATE(tr.timestamp) = CURRENT_DATE
)
SELECT 
    '⏰ PABLO - CÁLCULO MANUAL HORAS' as verificacion,
    ph.entrada AT TIME ZONE 'America/Bogota' as entrada_colombia,
    ph.salida AT TIME ZONE 'America/Bogota' as salida_colombia,
    CASE 
        WHEN ph.entrada IS NOT NULL AND ph.salida IS NULL THEN
            ROUND(CAST(EXTRACT(EPOCH FROM (NOW() - ph.entrada)) / 3600.0 AS NUMERIC), 2)
        WHEN ph.entrada IS NOT NULL AND ph.salida IS NOT NULL THEN
            ROUND(CAST(EXTRACT(EPOCH FROM (ph.salida - ph.entrada)) / 3600.0 AS NUMERIC), 2)
        ELSE 0
    END as horas_trabajadas,
    CASE 
        WHEN ph.entrada IS NOT NULL AND ph.salida IS NULL THEN 'Trabajando actualmente'
        WHEN ph.entrada IS NOT NULL AND ph.salida IS NOT NULL THEN 'Jornada completada'
        ELSE 'Sin actividad'
    END as estado
FROM pablo_hoy ph;

-- 4.3 Verificar que no hay datos de prueba mezclados
SELECT 
    '🧹 VERIFICAR LIMPIEZA DE DATOS' as verificacion,
    (SELECT COUNT(*) FROM employees WHERE cedula LIKE '111%' OR cedula LIKE '222%') as empleados_dummy,
    (SELECT COUNT(*) FROM time_records WHERE mensaje_motivacional ILIKE '%dummy%' OR mensaje_motivacional ILIKE '%test%') as registros_dummy,
    (SELECT COUNT(*) FROM employees WHERE activo = true) as empleados_activos_total;

-- 4.4 Resumen ejecutivo
SELECT 
    '📋 RESUMEN EJECUTIVO - PABLO CORREGIDO' as titulo,
    CASE 
        WHEN EXISTS(SELECT 1 FROM employees WHERE cedula = '79454772' AND salario_hora > 0) 
        THEN '✅ Salario OK'
        ELSE '❌ Problema salario'
    END as salario_status,
    
    CASE 
        WHEN EXISTS(
            SELECT 1 FROM time_records tr
            JOIN employees e ON tr.employee_id = e.id
            WHERE e.cedula = '79454772' 
              AND DATE(tr.timestamp) = CURRENT_DATE
              AND tr.tipo = 'entrada'
        ) THEN '✅ Entrada registrada'
        ELSE '❌ Sin entrada'
    END as entrada_status,
    
    CASE 
        WHEN EXISTS(
            SELECT 1 FROM time_records tr
            JOIN employees e ON tr.employee_id = e.id
            WHERE e.cedula = '79454772' 
              AND DATE(tr.timestamp) = CURRENT_DATE
              AND tr.tipo = 'salida'
        ) THEN '⚠️ Tiene salida (debería estar trabajando)'
        ELSE '✅ Sin salida (trabajando)'
    END as salida_status,
    
    CASE 
        WHEN NOT EXISTS(
            SELECT 1 FROM hours_summary hs
            JOIN employees e ON hs.employee_id = e.id
            WHERE e.cedula = '79454772' 
              AND hs.fecha = CURRENT_DATE
        ) THEN '✅ Sin hours_summary HOY (correcto para tiempo real)'
        ELSE '⚠️ Tiene hours_summary HOY (puede interferir)'
    END as hours_summary_status; 