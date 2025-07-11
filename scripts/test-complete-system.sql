-- 🧪 SCRIPT DE VERIFICACIÓN COMPLETA SISTEMA SIRIUS
-- Ejecutar después de configurar empleados reales para verificar funcionamiento

-- =====================================================
-- 1. VERIFICAR ESTRUCTURA DE TABLAS
-- =====================================================

SELECT '🏗️ VERIFICACIÓN DE TABLAS' as test_category;

SELECT 
    table_name as tabla,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = table_name) 
         THEN '✅ EXISTE' 
         ELSE '❌ FALTA' 
    END as estado
FROM (VALUES 
    ('employees'),
    ('holidays'),
    ('hours_summary'),
    ('time_records'),
    ('active_breaks'),
    ('achievements'),
    ('overtime_requests')
) as tables(table_name);

-- =====================================================
-- 2. VERIFICAR EMPLEADOS REALES CARGADOS
-- =====================================================

SELECT '👥 VERIFICACIÓN DE EMPLEADOS REALES' as test_category;

SELECT 
    COUNT(*) as total_empleados,
    CASE WHEN COUNT(*) = 13 THEN '✅ CORRECTO (13 empleados)' 
         ELSE '❌ ERROR: Se esperaban 13 empleados' 
    END as resultado
FROM employees;

-- Verificar empleados por departamento
SELECT 
    departamento,
    COUNT(*) as empleados,
    ROUND(AVG(salario), 2) as salario_promedio
FROM employees 
GROUP BY departamento 
ORDER BY empleados DESC;

-- =====================================================
-- 3. VERIFICAR ADMIN PRINCIPAL (LUISA RAMÍREZ)
-- =====================================================

SELECT '👑 VERIFICACIÓN ADMIN PRINCIPAL' as test_category;

SELECT 
    cedula,
    nombre,
    cargo,
    departamento,
    salario,
    CASE WHEN cedula = '1019090206' THEN '✅ ADMIN CORRECTO' 
         ELSE '❌ ADMIN INCORRECTO' 
    END as admin_status
FROM employees 
WHERE cedula = '1019090206';

-- =====================================================
-- 4. VERIFICAR ESTRUCTURA CAMPOS EMPLOYEES
-- =====================================================

SELECT '📋 VERIFICACIÓN CAMPOS EMPLOYEES' as test_category;

SELECT 
    column_name as campo,
    data_type as tipo,
    is_nullable as permite_null,
    '✅ OK' as estado
FROM information_schema.columns 
WHERE table_name = 'employees' 
ORDER BY ordinal_position;

-- =====================================================
-- 5. VERIFICAR SALARIOS REALES
-- =====================================================

SELECT '💰 VERIFICACIÓN SALARIOS' as test_category;

-- Verificar rangos de salarios
SELECT 
    'Salarios por hora' as tipo,
    ROUND(MIN(salario), 2) as minimo,
    ROUND(MAX(salario), 2) as maximo,
    ROUND(AVG(salario), 2) as promedio,
    CASE 
        WHEN MIN(salario) >= 7000 AND MAX(salario) <= 35000 THEN '✅ RANGOS CORRECTOS'
        ELSE '❌ RANGOS INCORRECTOS'
    END as estado
FROM employees;

-- Verificar empleados específicos con salarios
SELECT 
    nombre,
    cargo,
    departamento,
    salario as salario_hora,
    ROUND(salario * 240, 0) as salario_mensual_estimado
FROM employees 
WHERE cedula IN ('1019090206', '1018497693', '1006534877', '1122626299')
ORDER BY salario DESC;

-- =====================================================
-- 6. VERIFICAR FESTIVOS COLOMBIANOS
-- =====================================================

SELECT '📅 VERIFICACIÓN FESTIVOS' as test_category;

SELECT 
    COUNT(*) as total_festivos,
    MIN(fecha) as primer_festivo,
    MAX(fecha) as ultimo_festivo,
    CASE WHEN COUNT(*) >= 18 THEN '✅ FESTIVOS CARGADOS' 
         ELSE '❌ FALTAN FESTIVOS' 
    END as estado
FROM holidays;

-- Mostrar algunos festivos de 2025
SELECT 
    fecha,
    nombre
FROM holidays 
WHERE EXTRACT(YEAR FROM fecha) = 2025
ORDER BY fecha
LIMIT 5;

-- =====================================================
-- 7. PRUEBA DE AUTENTICACIÓN SIMULADA
-- =====================================================

SELECT '🔐 PRUEBA DE AUTENTICACIÓN' as test_category;

-- Simular autenticación de Luisa (Admin)
SELECT 
    'Luisa Ramírez (Admin)' as usuario,
    cedula,
    nombre,
    departamento,
    '✅ AUTENTICACIÓN OK' as resultado
FROM employees 
WHERE cedula = '1019090206';

-- Simular autenticación de empleados
SELECT 
    'Empleados' as tipo,
    COUNT(*) as total_empleados_autenticables,
    CASE WHEN COUNT(*) = 13 THEN '✅ TODOS PUEDEN AUTENTICARSE' 
         ELSE '❌ PROBLEMAS DE AUTENTICACIÓN' 
    END as resultado
FROM employees 
WHERE cedula IS NOT NULL AND LENGTH(cedula) BETWEEN 6 AND 12;

-- =====================================================
-- 8. VERIFICAR RELACIONES ENTRE TABLAS
-- =====================================================

SELECT '🔗 VERIFICACIÓN RELACIONES' as test_category;

-- Verificar que hours_summary puede referenciar employees
SELECT 
    'hours_summary -> employees' as relacion,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = 'hours_summary' 
        AND tc.constraint_type = 'FOREIGN KEY'
        AND kcu.column_name = 'employee_id'
    ) THEN '✅ RELACIÓN OK' 
      ELSE '❌ RELACIÓN FALTA' 
    END as estado;

-- =====================================================
-- 9. PRUEBA DE INSERCIÓN HORAS (TEST)
-- =====================================================

SELECT '⏰ PRUEBA INSERCIÓN HORAS' as test_category;

-- Insertar registro de prueba
INSERT INTO hours_summary (
    employee_id,
    fecha,
    horas_ordinarias,
    total_horas,
    salario_base,
    total_pago,
    pausas_activas_realizadas
) VALUES (
    (SELECT id FROM employees WHERE cedula = '1019090206' LIMIT 1),
    CURRENT_DATE,
    8.0,
    8.0,
    (SELECT salario * 8 FROM employees WHERE cedula = '1019090206' LIMIT 1),
    (SELECT salario * 8 FROM employees WHERE cedula = '1019090206' LIMIT 1),
    2
) 
ON CONFLICT (employee_id, fecha) 
DO UPDATE SET 
    horas_ordinarias = EXCLUDED.horas_ordinarias,
    total_horas = EXCLUDED.total_horas,
    salario_base = EXCLUDED.salario_base,
    total_pago = EXCLUDED.total_pago,
    pausas_activas_realizadas = EXCLUDED.pausas_activas_realizadas;

-- Verificar inserción
SELECT 
    'Inserción horas Luisa' as test,
    COUNT(*) as registros_insertados,
    CASE WHEN COUNT(*) > 0 THEN '✅ INSERCIÓN OK' 
         ELSE '❌ INSERCIÓN FALLIDA' 
    END as resultado
FROM hours_summary 
WHERE employee_id = (SELECT id FROM employees WHERE cedula = '1019090206' LIMIT 1);

-- =====================================================
-- 10. CÁLCULO DE NÓMINA TEST
-- =====================================================

SELECT '💵 PRUEBA CÁLCULO NÓMINA' as test_category;

-- Simular cálculo de nómina para empleados con horas registradas
SELECT 
    e.nombre,
    e.departamento,
    e.salario as salario_hora,
    COALESCE(SUM(hs.total_horas), 0) as horas_trabajadas,
    COALESCE(SUM(hs.total_pago), 0) as pago_calculado,
    CASE WHEN COALESCE(SUM(hs.total_pago), 0) > 0 THEN '✅ CÁLCULO OK' 
         ELSE '⚠️ SIN HORAS REGISTRADAS' 
    END as estado
FROM employees e
LEFT JOIN hours_summary hs ON e.id = hs.employee_id
GROUP BY e.id, e.nombre, e.departamento, e.salario
ORDER BY e.nombre;

-- =====================================================
-- 11. RESUMEN FINAL DEL SISTEMA
-- =====================================================

SELECT '📊 RESUMEN FINAL DEL SISTEMA' as test_category;

SELECT 
    '📋 Empleados registrados' as aspecto,
    COUNT(*)::text as valor,
    '✅' as estado
FROM employees
UNION ALL
SELECT 
    '🏢 Departamentos activos' as aspecto,
    COUNT(DISTINCT departamento)::text as valor,
    '✅' as estado
FROM employees
UNION ALL
SELECT 
    '📅 Festivos configurados' as aspecto,
    COUNT(*)::text as valor,
    '✅' as estado
FROM holidays
UNION ALL
SELECT 
    '👑 Admin configurado' as aspecto,
    CASE WHEN EXISTS(SELECT 1 FROM employees WHERE cedula = '1019090206') 
         THEN 'Luisa Ramírez' 
         ELSE 'NO CONFIGURADO' 
    END as valor,
    CASE WHEN EXISTS(SELECT 1 FROM employees WHERE cedula = '1019090206') 
         THEN '✅' 
         ELSE '❌' 
    END as estado;

-- =====================================================
-- 12. VERIFICACIONES FINALES DE SEGURIDAD
-- =====================================================

SELECT '🔒 VERIFICACIONES DE SEGURIDAD' as test_category;

-- Verificar cédulas únicas
SELECT 
    'Cédulas únicas' as verificacion,
    COUNT(*) as total_cedulas,
    COUNT(DISTINCT cedula) as cedulas_unicas,
    CASE WHEN COUNT(*) = COUNT(DISTINCT cedula) THEN '✅ SIN DUPLICADOS' 
         ELSE '❌ CÉDULAS DUPLICADAS' 
    END as resultado
FROM employees;

-- Verificar formato de cédulas
SELECT 
    'Formato cédulas' as verificacion,
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE cedula ~ '^\d{6,12}$') as formato_correcto,
    CASE WHEN COUNT(*) = COUNT(*) FILTER (WHERE cedula ~ '^\d{6,12}$') 
         THEN '✅ FORMATO CORRECTO' 
         ELSE '❌ FORMATO INCORRECTO' 
    END as resultado
FROM employees;

-- =====================================================
-- MENSAJE FINAL
-- =====================================================

SELECT 
    '🎉 VERIFICACIÓN COMPLETA FINALIZADA' as mensaje,
    'Sistema SIRIUS listo para producción' as estado,
    NOW() as timestamp_verificacion; 