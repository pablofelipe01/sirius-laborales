-- Verificar datos dummy en la base de datos SIRIUS
-- Este script muestra todos los datos que deberían estar disponibles

-- 1. Empleados registrados
SELECT 
    'EMPLEADOS' as seccion,
    count(*) as total_registros
FROM employees;

SELECT 
    cedula,
    nombre,
    apodo,
    salario,
    emoji_favorito,
    pausas_activas_enabled,
    racha_pausas
FROM employees 
ORDER BY nombre;

-- 2. Resumen de horas (debería tener datos simulados)
SELECT 
    'HORAS_SUMMARY' as seccion,
    count(*) as total_registros
FROM hours_summary;

SELECT 
    e.nombre,
    e.apodo,
    h.fecha,
    h.horas_ordinarias,
    h.horas_extra_diurnas,
    h.horas_extra_nocturnas,
    h.total_horas,
    h.total_pago,
    h.pausas_activas_realizadas
FROM hours_summary h
JOIN employees e ON h.employee_id = e.id
ORDER BY h.fecha DESC, e.nombre;

-- 3. Festivos configurados
SELECT 
    'FESTIVOS' as seccion,
    count(*) as total_registros
FROM holidays
WHERE year = 2025;

SELECT 
    nombre,
    fecha,
    tipo,
    nacional
FROM holidays 
WHERE year = 2025
ORDER BY fecha;

-- 4. Registros de tiempo (si existen)
SELECT 
    'TIME_RECORDS' as seccion,
    count(*) as total_registros
FROM time_records;

-- 5. Pausas activas (si existen)
SELECT 
    'ACTIVE_BREAKS' as seccion,
    count(*) as total_registros
FROM active_breaks;

-- 6. Solicitudes de horas extra (si existen)
SELECT 
    'OVERTIME_REQUESTS' as seccion,
    count(*) as total_registros
FROM overtime_requests;

-- Resumen general
SELECT 
    'RESUMEN GENERAL' as tipo,
    (SELECT count(*) FROM employees) as empleados,
    (SELECT count(*) FROM hours_summary) as resumenes_horas,
    (SELECT count(*) FROM holidays WHERE year = 2025) as festivos_2025,
    (SELECT count(*) FROM time_records) as registros_tiempo,
    (SELECT count(*) FROM active_breaks) as pausas_activas; 