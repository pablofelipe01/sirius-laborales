-- 🚑 SCRIPT DE CORRECCIÓN PARA PRODUCCIÓN
-- Limpiar datos de prueba y corregir problemas identificados
-- Ejecutar en SQL Editor de Supabase

-- ========================================
-- 1. LIMPIAR DATOS DE PRUEBA
-- ========================================

-- 1.1 Identificar y eliminar empleados de prueba
DELETE FROM employees 
WHERE cedula IN ('11111111', '22222222', '33333333', '44444444', '55555555', '66666666', '77777777', '88888888')
   OR (nombre ILIKE '%juan carlos%' AND cedula = '11111111')
   OR (nombre ILIKE '%maria elena%' AND cedula = '22222222')
   OR (nombre ILIKE '%carlos alberto%' AND cedula = '33333333')
   OR (nombre ILIKE '%ana sofía%' AND cedula = '44444444');

-- 1.2 Limpiar todos los datos de time_records de la última semana (incluye dummy data)
DELETE FROM time_records 
WHERE DATE(timestamp) >= CURRENT_DATE - INTERVAL '7 days';

-- 1.3 Limpiar hours_summary de la última semana 
DELETE FROM hours_summary 
WHERE fecha >= CURRENT_DATE - INTERVAL '7 days';

-- 1.4 Limpiar active_breaks de la última semana
DELETE FROM active_breaks 
WHERE DATE(fecha_inicio) >= CURRENT_DATE - INTERVAL '7 days';

-- ========================================
-- 2. VERIFICAR Y CORREGIR EMPLEADOS REALES
-- ========================================

-- 2.1 Actualizar datos de empleados reales SIRIUS
UPDATE employees SET 
    activo = true,
    salario_hora = CASE 
        WHEN salario_hora IS NULL OR salario_hora = 0 
        THEN ROUND(COALESCE(salario, 39130) / 160, 2)  -- Usar salario real de Pablo o default
        ELSE salario_hora
    END,
    cargo = COALESCE(cargo, 'Empleado'),
    departamento = COALESCE(departamento, 'Tecnología')
WHERE cedula IN ('79454772', '1019090206', '1018497693', '1006534877', '1123561461');

-- 2.2 Verificar que Pablo está configurado correctamente
UPDATE employees SET 
    nombre = 'Pablo Acebedo',
    apodo = 'Pablo',
    salario = 39130,
    salario_hora = 244.56,
    cargo = 'CTO',
    departamento = 'Tecnología',
    activo = true
WHERE cedula = '79454772';

-- 2.3 Verificar que Luisa está configurada correctamente  
UPDATE employees SET 
    nombre = 'Luisa Ramírez',
    apodo = 'Luisa',
    cargo = 'Coordinadora líder en gestión del ser',
    departamento = 'Administrativo',
    activo = true
WHERE cedula = '1019090206';

-- ========================================
-- 3. CORREGIR PROBLEMAS DE ESTADO
-- ========================================

-- 3.1 Si Pablo tiene registro de salida HOY incorrecto, eliminarlo
DELETE FROM time_records tr
WHERE EXISTS (
    SELECT 1 FROM employees e 
    WHERE e.id = tr.employee_id 
      AND e.cedula = '79454772'
)
AND DATE(tr.timestamp) = CURRENT_DATE
AND tr.tipo = 'salida';

-- 3.2 Asegurarse de que Pablo tenga registro de entrada HOY
-- (Solo si no tiene registro de entrada)
DO $$
DECLARE
    pablo_id UUID;
    tiene_entrada BOOLEAN := false;
BEGIN
    -- Obtener ID de Pablo
    SELECT id INTO pablo_id FROM employees WHERE cedula = '79454772';
    
    IF pablo_id IS NOT NULL THEN
        -- Verificar si ya tiene entrada HOY
        SELECT EXISTS(
            SELECT 1 FROM time_records 
            WHERE employee_id = pablo_id 
              AND DATE(timestamp) = CURRENT_DATE 
              AND tipo = 'entrada'
        ) INTO tiene_entrada;
        
        -- Si no tiene entrada, crear una
        IF NOT tiene_entrada THEN
            INSERT INTO time_records (employee_id, tipo, timestamp, mensaje_motivacional)
            VALUES (pablo_id, 'entrada', CURRENT_DATE + TIME '07:04:00', 'Buenos días! Empezando la jornada 🌱');
            
            RAISE NOTICE 'Entrada creada para Pablo a las 7:04 AM';
        END IF;
    END IF;
END $$;

-- ========================================
-- 4. VERIFICAR CONFIGURACIÓN DE TABLA
-- ========================================

-- 4.1 Asegurar que salario_hora está en el campo correcto
-- (Algunos empleados pueden tener salario mensual en lugar de por hora)
UPDATE employees 
SET salario_hora = CASE 
    WHEN salario > 100000 THEN ROUND(salario / 160, 2)  -- Convertir salario mensual a por hora
    ELSE salario  -- Ya es por hora
END
WHERE salario_hora IS NULL AND salario IS NOT NULL;

-- ========================================
-- 5. REGENERAR SOLO DATOS MÍNIMOS NECESARIOS
-- ========================================

-- 5.1 NO generar datos de prueba automáticamente
-- Solo trabajar con registros reales de empleados

-- ========================================
-- 6. VERIFICACIÓN POST-LIMPIEZA
-- ========================================

-- 6.1 Mostrar empleados activos después de limpieza
SELECT 
    '✅ EMPLEADOS ACTIVOS DESPUÉS DE LIMPIEZA' as resultado,
    e.cedula,
    e.nombre,
    e.apodo,
    e.salario_hora,
    e.cargo,
    e.departamento
FROM employees e 
WHERE e.activo = true
ORDER BY e.nombre;

-- 6.2 Verificar estado de Pablo HOY
SELECT 
    '🔍 PABLO - ESTADO DESPUÉS DE CORRECCIÓN' as resultado,
    e.nombre,
    COUNT(tr.id) as registros_hoy,
    STRING_AGG(tr.tipo, ', ' ORDER BY tr.timestamp) as tipos_registro,
    MIN(tr.timestamp) as primer_registro,
    MAX(tr.timestamp) as ultimo_registro
FROM employees e
LEFT JOIN time_records tr ON e.id = tr.employee_id 
    AND DATE(tr.timestamp) = CURRENT_DATE
WHERE e.cedula = '79454772'
GROUP BY e.id, e.nombre;

-- 6.3 Verificar que no quedan datos de prueba
SELECT 
    '🧹 VERIFICACIÓN DE LIMPIEZA' as resultado,
    
    (SELECT COUNT(*) FROM employees 
     WHERE cedula IN ('11111111', '22222222', '33333333', '44444444')) as empleados_dummy_restantes,
    
    (SELECT COUNT(*) FROM time_records 
     WHERE DATE(timestamp) >= CURRENT_DATE - INTERVAL '7 days') as registros_tiempo_ultima_semana,
    
    (SELECT COUNT(*) FROM hours_summary 
     WHERE fecha >= CURRENT_DATE - INTERVAL '7 days') as resumen_horas_ultima_semana,
     
    (SELECT COUNT(*) FROM employees WHERE activo = true) as total_empleados_activos;

-- 6.4 Verificar cálculo en tiempo real para Pablo
WITH pablo_calculo AS (
    SELECT 
        e.id,
        e.nombre,
        e.salario_hora,
        MIN(CASE WHEN tr.tipo = 'entrada' THEN tr.timestamp END) as entrada,
        MAX(CASE WHEN tr.tipo = 'salida' THEN tr.timestamp END) as salida,
        COUNT(tr.id) as total_registros
    FROM employees e
    LEFT JOIN time_records tr ON e.id = tr.employee_id 
        AND DATE(tr.timestamp) = CURRENT_DATE
    WHERE e.cedula = '79454772'
    GROUP BY e.id, e.nombre, e.salario_hora
)
SELECT 
    '⏰ PABLO - CÁLCULO EN TIEMPO REAL' as resultado,
    pc.nombre,
    pc.entrada,
    pc.salida,
    pc.total_registros,
    CASE 
        WHEN pc.entrada IS NOT NULL AND pc.salida IS NULL THEN
            EXTRACT(EPOCH FROM (NOW() - pc.entrada)) / 3600.0
        WHEN pc.entrada IS NOT NULL AND pc.salida IS NOT NULL THEN
            EXTRACT(EPOCH FROM (pc.salida - pc.entrada)) / 3600.0
        ELSE 0
    END as horas_trabajadas_calculadas,
    CASE 
        WHEN pc.entrada IS NOT NULL AND pc.salida IS NULL THEN 'Trabajando actualmente'
        WHEN pc.entrada IS NOT NULL AND pc.salida IS NOT NULL THEN 'Jornada completada'
        ELSE 'Sin actividad'
    END as estado_actual
FROM pablo_calculo pc; 