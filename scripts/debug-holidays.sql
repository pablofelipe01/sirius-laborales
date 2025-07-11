-- Script de diagnóstico para tabla holidays
-- Ejecutar en SQL Editor de Supabase

-- 1. Verificar si la tabla holidays existe
SELECT 
    'holidays' as tabla,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'holidays') 
         THEN 'EXISTE' 
         ELSE 'NO EXISTE' 
    END as estado;

-- 2. Ver la estructura actual de holidays (si existe)
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'holidays'
ORDER BY ordinal_position;

-- 3. Ver todos los datos actuales en holidays (si existe y tiene datos)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'holidays') THEN
        RAISE NOTICE 'Tabla holidays existe. Mostrando contenido...';
        -- Intentar mostrar datos básicos
        PERFORM 1 FROM holidays LIMIT 1;
    ELSE
        RAISE NOTICE 'Tabla holidays NO existe';
    END IF;
EXCEPTION 
    WHEN others THEN
        RAISE NOTICE 'Error al acceder a holidays: %', SQLERRM;
END $$; 