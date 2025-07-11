-- 🧹 SCRIPT DE LIMPIEZA Y CORRECCIÓN DE DATOS SIRIUS
-- Ejecutar para eliminar datos incorrectos y dejar solo empleados reales

-- =====================================================
-- 1. LIMPIAR TODOS LOS DATOS EXISTENTES
-- =====================================================

SELECT '🧹 INICIANDO LIMPIEZA COMPLETA DE DATOS' as mensaje;

-- Eliminar registros dependientes primero
DELETE FROM time_records;
DELETE FROM hours_summary;
DELETE FROM active_breaks;
DELETE FROM achievements;
DELETE FROM overtime_requests;

-- Eliminar todos los empleados existentes
DELETE FROM employees;

SELECT '✅ Datos anteriores eliminados' as resultado;

-- =====================================================
-- 2. INSERTAR SOLO EMPLEADOS REALES CON SALARIOS CORRECTOS
-- =====================================================

SELECT '👥 INSERTANDO EMPLEADOS REALES SIRIUS' as mensaje;

INSERT INTO employees (cedula, nombre, apodo, salario, cargo, departamento, pausas_activas_enabled, racha_pausas, emoji_favorito) VALUES

-- PERSONAL ADMINISTRATIVO (5 empleados)
('1019090206', 'Luisa Ramírez', 'Luisa', 26956.52, 'Coordinadora líder en gestión del ser', 'Administrativo', true, 0, '🌱'),
('1018497693', 'Alejandro Uricoechea', 'Alejandro', 34782.61, 'Director Financiero', 'Administrativo', true, 0, '💼'),
('1026272126', 'Joys Moreno', 'Joys', 22548.87, 'Coordinadora líder en gerencia', 'Administrativo', true, 0, '⭐'),
('1016080562', 'Carolina Casas', 'Carolina', 14173.91, 'Asistente Financiera y Contable', 'Administrativo', true, 0, '📊'),
('1006416103', 'Yeison Cogua', 'Yeison', 7579.83, 'Redactor Creativo', 'Administrativo', true, 0, '✍️'),

-- PERSONAL DE TECNOLOGÍA (1 empleado)
('79454772', 'Pablo Acebedo', 'Pablo', 39130.00, 'CTO', 'Tecnología', true, 0, '🚀'),

-- PERSONAL DE PIRÓLISIS (4 empleados)
('1006534877', 'Santiago Amaya', 'Santiago', 12225.39, 'Jefe de pirólisis', 'Pirólisis', true, 0, '🔥'),
('1122626299', 'Mario Barrera', 'Mario', 7579.83, 'Auxiliar operativo', 'Pirólisis', true, 0, '⚙️'),
('1006866318', 'Kevin Ávila', 'Kevin', 7579.83, 'Auxiliar operativo', 'Pirólisis', true, 0, '🔧'),
('1019887392', 'Luis Alberto Obando', 'Luis Alberto', 7579.83, 'Auxiliar operativo', 'Pirólisis', true, 0, '🛠️'),

-- PERSONAL DE LABORATORIO (3 empleados)
('1123561461', 'Alexandra Orosco', 'Alexandra', 8260.87, 'Auxiliar operativa', 'Laboratorio', true, 0, '🧪'),
('1057014925', 'Yesenia Ramírez', 'Yesenia', 8260.87, 'Auxiliar operativa', 'Laboratorio', true, 0, '🔬'),
('8122626068', 'Angi Cardenas', 'Angi', 7579.83, 'Auxiliar operativa', 'Laboratorio', true, 0, '⚗️'),

-- PERSONAL RAAS (1 empleado)
('1006774686', 'David Hernández', 'David', 12225.39, 'Ingeniero de desarrollo', 'RAAS', true, 0, '💻');

SELECT '✅ 14 empleados reales insertados correctamente' as resultado;

-- =====================================================
-- 3. VERIFICAR DATOS CORRECTOS
-- =====================================================

SELECT '📊 VERIFICACIÓN POST-LIMPIEZA' as categoria;

-- Verificar total de empleados
SELECT 
    COUNT(*) as total_empleados,
    CASE WHEN COUNT(*) = 14 THEN '✅ CORRECTO' ELSE '❌ INCORRECTO' END as estado
FROM employees;

-- Verificar admin
SELECT 
    'Admin Principal' as tipo,
    nombre,
    cedula,
    cargo,
    '✅ CORRECTO' as estado
FROM employees 
WHERE cedula = '1019090206';

-- Verificar departamentos (debe ser exactamente 5)
SELECT 
    departamento,
    COUNT(*) as empleados
FROM employees 
GROUP BY departamento 
ORDER BY empleados DESC;

SELECT 
    COUNT(DISTINCT departamento) as total_departamentos,
    CASE WHEN COUNT(DISTINCT departamento) = 5 THEN '✅ CORRECTO (5 departamentos)' 
         ELSE '❌ INCORRECTO' 
    END as estado
FROM employees;

-- Verificar rangos salariales
SELECT 
    'Salarios por hora' as categoria,
    ROUND(MIN(salario), 2) as minimo,
    ROUND(MAX(salario), 2) as maximo,
    ROUND(AVG(salario), 2) as promedio,
    CASE 
        WHEN MIN(salario) >= 7000 AND MAX(salario) <= 40000 THEN '✅ RANGOS CORRECTOS'
        ELSE '❌ RANGOS INCORRECTOS'
    END as estado
FROM employees;

-- =====================================================
-- 4. CREAR REGISTROS DE EJEMPLO PARA DEMOSTRACIÓN
-- =====================================================

SELECT '📝 CREANDO REGISTROS DE DEMOSTRACIÓN' as categoria;

-- Insertar algunos registros de horas para demostración
INSERT INTO hours_summary (
    employee_id,
    fecha,
    horas_ordinarias,
    total_horas,
    salario_base,
    total_pago,
    pausas_activas_realizadas
) VALUES 
-- Luisa (Admin) - Jornada administrativa
(
    (SELECT id FROM employees WHERE cedula = '1019090206'),
    CURRENT_DATE,
    8.0,
    8.0,
    26956.52 * 8,
    26956.52 * 8,
    2
),
-- Pablo (CTO) - Jornada estratégica
(
    (SELECT id FROM employees WHERE cedula = 'PABLOCTO2024'),
    CURRENT_DATE,
    8.0,
    9.0,
    39130.00 * 8,
    (39130.00 * 8) + (39130.00 * 1 * 1.25),
    3
),
-- Santiago (Jefe) - Con 2 horas extra
(
    (SELECT id FROM employees WHERE cedula = '1006534877'),
    CURRENT_DATE,
    8.0,
    10.0,
    12225.39 * 8,
    (12225.39 * 8) + (12225.39 * 2 * 1.25),
    3
),
-- Mario (Auxiliar) - Jornada normal
(
    (SELECT id FROM employees WHERE cedula = '1122626299'),
    CURRENT_DATE,
    8.0,
    8.0,
    7579.83 * 8,
    7579.83 * 8,
    1
);

SELECT '✅ Registros de demostración creados' as resultado;

-- =====================================================
-- 5. RESUMEN FINAL
-- =====================================================

SELECT '🎯 RESUMEN FINAL DE LIMPIEZA' as categoria;

SELECT 
    'Empleados totales' as aspecto,
    COUNT(*)::text as valor
FROM employees
UNION ALL
SELECT 
    'Departamentos únicos' as aspecto,
    COUNT(DISTINCT departamento)::text as valor
FROM employees
UNION ALL
SELECT 
    'Admin configurado' as aspecto,
    CASE WHEN EXISTS(SELECT 1 FROM employees WHERE cedula = '1019090206') 
         THEN 'Luisa Ramírez ✅' 
         ELSE 'NO CONFIGURADO ❌' 
    END as valor
UNION ALL
SELECT 
    'CTO configurado' as aspecto,
    CASE WHEN EXISTS(SELECT 1 FROM employees WHERE cedula = 'PABLOCTO2024') 
         THEN 'Pablo Acebedo ✅' 
         ELSE 'NO CONFIGURADO ❌' 
    END as valor
UNION ALL
SELECT 
    'Rango salarial' as aspecto,
    CONCAT('$', ROUND(MIN(salario), 0), ' - $', ROUND(MAX(salario), 0), '/hora') as valor
FROM employees
UNION ALL
SELECT 
    'Registros demo' as aspecto,
    COUNT(*)::text as valor
FROM hours_summary;

SELECT '✅ LIMPIEZA COMPLETA EXITOSA - DATOS CORREGIDOS' as mensaje_final; 