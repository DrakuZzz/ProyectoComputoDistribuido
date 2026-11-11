-- Actualizaciones controladas.

USE clinica;

START TRANSACTION;
UPDATE citas
SET estado = 'atendida'
WHERE id_cita = 1
  AND estado = 'programada';
SELECT ROW_COUNT() AS citas_actualizadas;
COMMIT;

START TRANSACTION;
UPDATE usuarios
SET activo = FALSE
WHERE correo = 'respaldo@clinica.example'
  AND rol = 'administrador';
SELECT id_usuario, correo, activo
FROM usuarios
WHERE correo = 'respaldo@clinica.example';
ROLLBACK;

USE farmacia;

START TRANSACTION;
UPDATE medicamentos
SET stock = stock + 10
WHERE id_medicamento = 1;
INSERT INTO movimientos_inventario
    (medicamento_id, tipo, cantidad, motivo)
VALUES
    (1, 'entrada', 10, 'Reposición de prueba');
COMMIT;

SELECT id_medicamento, nombre, stock
FROM medicamentos
WHERE id_medicamento = 1;
