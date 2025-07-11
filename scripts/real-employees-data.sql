-- Script de empleados reales SIRIUS Regenerative
-- Reemplaza empleados de prueba con datos reales

-- 1. Limpiar empleados de prueba anteriores
DELETE FROM time_records WHERE employee_id IN (
  SELECT id FROM employees WHERE cedula IN ('11111111', '22222222', '33333333', '44444444', '12345678')
);

DELETE FROM hours_summary WHERE employee_id IN (
  SELECT id FROM employees WHERE cedula IN ('11111111', '22222222', '33333333', '44444444', '12345678')
);

DELETE FROM active_breaks WHERE employee_id IN (
  SELECT id FROM employees WHERE cedula IN ('11111111', '22222222', '33333333', '44444444', '12345678')
);

DELETE FROM achievements WHERE employee_id IN (
  SELECT id FROM employees WHERE cedula IN ('11111111', '22222222', '33333333', '44444444', '12345678')
);

DELETE FROM overtime_requests WHERE employee_id IN (
  SELECT id FROM employees WHERE cedula IN ('11111111', '22222222', '33333333', '44444444', '12345678')
);

DELETE FROM employees WHERE cedula IN ('11111111', '22222222', '33333333', '44444444', '12345678');

-- 2. Insertar empleados reales de SIRIUS
INSERT INTO employees (cedula, nombre, apodo, salario, cargo, departamento, pausas_activas_enabled, racha_pausas, emoji_favorito) VALUES

-- PERSONAL ADMINISTRATIVO
('1019090206', 'Luisa Ramírez', 'Lu', 26956.52, 'Coordinadora líder en gestión del ser', 'Administrativo', true, 0, '🌱'),
('1018497693', 'Alejandro Uricoechea', 'Alejo', 34782.61, 'Director Financiero', 'Administrativo', true, 0, '💼'),
('1026272126', 'Joys Moreno', 'Fer', 22548.87, 'Coordinadora líder en gerencia', 'Administrativo', true, 0, '⭐'),
('1016080562', 'Carolina Casas', 'Caro', 14173.91, 'Asistente Financiera y Contable', 'Administrativo', true, 0, '📊'),
('1006416103', 'Yeison Cogua', 'Jason', 7579.83, 'Redactor Creativo', 'Administrativo', true, 0, '✍️'),

-- PERSONAL DE PIRÓLISIS
('1006534877', 'Santiago Amaya', 'Santi', 12225.39, 'Jefe de pirólisis', 'Pirólisis', true, 0, '🔥'),
('1122626299', 'Mario Barrera', 'Mario', 7579.83, 'Auxiliar operativo', 'Pirólisis', true, 0, '⚙️'),
('1006866318', 'Kevin Ávila', 'Kevin', 7579.83, 'Auxiliar operativo', 'Pirólisis', true, 0, '🔧'),
('1019887392', 'Luis Alberto Obando', 'Beto', 7579.83, 'Auxiliar operativo', 'Pirólisis', true, 0, '🛠️'),

-- PERSONAL DE LABORATORIO
('1123561461', 'Alexandra Orosco', 'Alexa', 8260.87, 'Auxiliar operativa', 'Laboratorio', true, 0, '🧪'),
('1057014925', 'Yesenia Ramírez', 'Yess', 8260.87, 'Auxiliar operativa', 'Laboratorio', true, 0, '🔬'),
('8122626068', 'Angi Cardenas', 'Angi', 7579.83, 'Auxiliar operativa', 'Laboratorio', true, 0, '⚗️'),

-- PERSONAL RAAS (Research and Advanced Analytics Systems)
('1006774686', 'David Hernández', 'David', 12225.39, 'Ingeniero de desarrollo', 'RAAS', true, 0, '💻');

-- 3. Verificar inserción
SELECT 
    cedula,
    nombre,
    cargo,
    departamento,
    salario as salario_hora,
    (salario * 240) as salario_mensual_estimado
FROM employees 
ORDER BY departamento, salario DESC;

-- 4. Crear algunos registros de horas de ejemplo para empleados reales
-- (Solo para que el sistema tenga datos iniciales de demostración)

-- Luisa (Administradora) - Jornada administrativa típica
INSERT INTO hours_summary (
    employee_id, 
    fecha, 
    horas_ordinarias, 
    horas_extra_diurnas, 
    horas_extra_nocturnas,
    horas_nocturnas,
    horas_dominicales_diurnas,
    horas_dominicales_nocturnas,
    horas_festivas_diurnas,
    horas_festivas_nocturnas,
    total_horas,
    salario_base,
    recargo_nocturno,
    recargo_dominical,
    recargo_festivo,
    extra_diurna,
    extra_nocturna,
    extra_dominical_diurna,
    extra_dominical_nocturna,
    extra_festiva_diurna,
    extra_festiva_nocturna,
    total_pago,
    pausas_activas_realizadas
) VALUES (
    (SELECT id FROM employees WHERE cedula = '1019090206'),
    CURRENT_DATE,
    8.0,  -- 8 horas ordinarias
    0, 0, 0, 0, 0, 0, 0,  -- Sin horas extra por ahora
    8.0,  -- total horas
    26956.52 * 8,  -- salario base
    0, 0, 0, 0, 0, 0, 0, 0, 0,  -- recargos
    26956.52 * 8,  -- total pago
    2  -- 2 pausas activas realizadas
);

-- Santiago (Jefe Pirólisis) - Puede tener horas extra
INSERT INTO hours_summary (
    employee_id, 
    fecha, 
    horas_ordinarias, 
    horas_extra_diurnas, 
    horas_extra_nocturnas,
    horas_nocturnas,
    horas_dominicales_diurnas,
    horas_dominicales_nocturnas,
    horas_festivas_diurnas,
    horas_festivas_nocturnas,
    total_horas,
    salario_base,
    recargo_nocturno,
    recargo_dominical,
    recargo_festivo,
    extra_diurna,
    extra_nocturna,
    extra_dominical_diurna,
    extra_dominical_nocturna,
    extra_festiva_diurna,
    extra_festiva_nocturna,
    total_pago,
    pausas_activas_realizadas
) VALUES (
    (SELECT id FROM employees WHERE cedula = '1006534877'),
    CURRENT_DATE,
    8.0,  -- 8 horas ordinarias
    2.0,  -- 2 horas extra diurnas
    0, 0, 0, 0, 0, 0,  
    10.0,  -- total horas
    12225.39 * 8,  -- salario base (8h normales)
    0, 0, 0,  
    12225.39 * 2 * 1.25,  -- extra diurna (+25%)
    0, 0, 0, 0, 0,  
    (12225.39 * 8) + (12225.39 * 2 * 1.25),  -- total pago
    3  -- 3 pausas activas realizadas
);

-- Mario (Auxiliar Pirólisis) - Jornada operativa
INSERT INTO hours_summary (
    employee_id, 
    fecha, 
    horas_ordinarias, 
    horas_extra_diurnas, 
    horas_extra_nocturnas,
    horas_nocturnas,
    horas_dominicales_diurnas,
    horas_dominicales_nocturnas,
    horas_festivas_diurnas,
    horas_festivas_nocturnas,
    total_horas,
    salario_base,
    recargo_nocturno,
    recargo_dominical,
    recargo_festivo,
    extra_diurna,
    extra_nocturna,
    extra_dominical_diurna,
    extra_dominical_nocturna,
    extra_festiva_diurna,
    extra_festiva_nocturna,
    total_pago,
    pausas_activas_realizadas
) VALUES (
    (SELECT id FROM employees WHERE cedula = '1122626299'),
    CURRENT_DATE,
    8.0,  -- 8 horas ordinarias
    0, 0, 0, 0, 0, 0, 0,  
    8.0,  -- total horas
    7579.83 * 8,  -- salario base
    0, 0, 0, 0, 0, 0, 0, 0, 0,  
    7579.83 * 8,  -- total pago
    1  -- 1 pausa activa realizada
);

-- Confirmar datos insertados
SELECT 
    'RESUMEN DE EMPLEADOS SIRIUS' as info,
    COUNT(*) as total_empleados,
    COUNT(DISTINCT departamento) as departamentos,
    ROUND(AVG(salario), 2) as salario_promedio_hora,
    ROUND(MIN(salario), 2) as salario_min_hora,
    ROUND(MAX(salario), 2) as salario_max_hora
FROM employees;

-- Mostrar empleados por departamento
SELECT 
    departamento,
    COUNT(*) as empleados,
    ROUND(AVG(salario), 2) as salario_promedio_hora,
    ROUND(AVG(salario * 240), 0) as salario_promedio_mensual
FROM employees 
GROUP BY departamento 
ORDER BY salario_promedio_hora DESC; 