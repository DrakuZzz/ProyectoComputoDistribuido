-- Eliminaciones y validación de integridad.

USE clinica;

-- La receta cancelada es un registro de prueba seguro para eliminar.
START TRANSACTION;
DELETE FROM recetas
WHERE id_receta = 7
  AND estado = 'cancelada';
SELECT ROW_COUNT() AS recetas_eliminadas;

-- ON DELETE CASCADE elimina también su detalle.
SELECT COUNT(*) AS detalles_restantes
FROM receta_medicamentos
WHERE receta_id = 7;
COMMIT;

-- Esta eliminación debe afectar cero filas: la cita no existe.
DELETE FROM citas
WHERE id_cita = 999999;
SELECT ROW_COUNT() AS citas_eliminadas;

USE farmacia;

-- No se elimina un medicamento que tenga inventario relacionado.
-- Primero se valida la existencia del medicamento y sus movimientos.
SELECT m.id_medicamento, m.nombre, COUNT(mi.id_movimiento) AS movimientos
FROM medicamentos m
LEFT JOIN movimientos_inventario mi ON mi.medicamento_id = m.id_medicamento
WHERE m.id_medicamento = 1
GROUP BY m.id_medicamento, m.nombre;
