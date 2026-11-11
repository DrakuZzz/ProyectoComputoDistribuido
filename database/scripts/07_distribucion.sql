-- Distribución propuesta y pruebas.
--
-- Fragmentación vertical por nodo:
--   clinica: usuarios, pacientes, medicos, citas, consultas, resultados,
--            recetas y receta_medicamentos.
--   farmacia: medicamentos y movimientos_inventario.
--
-- No se crea una clave foránea entre bases. medicamento_id en
-- receta_medicamentos se coordina mediante la API HTTP del nodo de Farmacia.

-- Prueba del fragmento clínico.
USE clinica;
SELECT 'nodo clinica' AS nodo, COUNT(*) AS pacientes
FROM pacientes;

SELECT r.id_receta, r.paciente, rm.medicamento_id, rm.indicaciones
FROM recetas r
JOIN receta_medicamentos rm ON rm.receta_id = r.id_receta
WHERE r.id_receta = 1;

-- Prueba del fragmento de farmacia.
USE farmacia;
SELECT 'nodo farmacia' AS nodo, COUNT(*) AS medicamentos
FROM medicamentos;

SELECT m.id_medicamento, m.nombre, m.stock, mi.tipo, mi.cantidad
FROM medicamentos m
LEFT JOIN movimientos_inventario mi ON mi.medicamento_id = m.id_medicamento
WHERE m.id_medicamento = 1
ORDER BY mi.fecha DESC;

-- Verificación de que los esquemas están separados.
SELECT TABLE_SCHEMA, TABLE_NAME
FROM information_schema.TABLES
WHERE TABLE_SCHEMA IN ('clinica', 'farmacia')
ORDER BY TABLE_SCHEMA, TABLE_NAME;
