-- Verificar cédula de administrador en la base de datos

-- 1. Buscar usuarios con nombre Luisa
SELECT 'USUARIOS CON NOMBRE LUISA' as seccion, cedula, nombre, salario FROM employees WHERE nombre ILIKE '%luisa%';

-- 2. Buscar usuarios con cédula 12345678
SELECT 'USUARIO CON CÉDULA 12345678' as seccion, cedula, nombre, salario FROM employees WHERE cedula = '12345678';

-- 3. Buscar usuarios con cédula 123456789  
SELECT 'USUARIO CON CÉDULA 123456789' as seccion, cedula, nombre, salario FROM employees WHERE cedula = '123456789';

-- 4. Mostrar todos los empleados para referencia
SELECT 'TODOS LOS EMPLEADOS' as seccion, cedula, nombre FROM employees ORDER BY nombre; 