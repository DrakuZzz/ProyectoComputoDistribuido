-- Consultas simples, filtros y relaciones.

USE clinica;

-- Consulta simple.
SELECT id_paciente, nombre, correo
FROM pacientes
ORDER BY nombre;

-- Filtro de citas programadas.
SELECT id_cita, paciente_id, medico_id, fecha, motivo
FROM citas
WHERE estado = 'programada'
ORDER BY fecha;

-- Relación entre citas, pacientes y médicos.
SELECT c.id_cita, p.nombre AS paciente, m.nombre AS medico,
       c.fecha, c.motivo, c.estado
FROM citas c
JOIN pacientes p ON p.id_paciente = c.paciente_id
JOIN medicos m ON m.id_medico = c.medico_id
ORDER BY c.fecha;

-- Relación entre consultas y resultados.
SELECT co.id_consulta, p.nombre AS paciente, co.diagnostico,
       r.tipo_prueba, r.resultado, r.validado
FROM consultas co
JOIN pacientes p ON p.id_paciente = co.paciente_id
LEFT JOIN resultados r ON r.consulta_id = co.id_consulta
ORDER BY co.id_consulta;

-- Recetas y sus detalles. El nombre del medicamento se obtiene del nodo
-- Farmacia mediante la API, porque las bases están separadas.
SELECT r.id_receta, r.paciente, r.medico, r.estado,
       rm.medicamento_id, rm.indicaciones, rm.cantidad
FROM recetas r
LEFT JOIN receta_medicamentos rm ON rm.receta_id = r.id_receta
ORDER BY r.fecha DESC;

USE farmacia;

-- Inventario con filtro de existencias.
SELECT id_medicamento, nombre, principio_activo, stock, precio
FROM medicamentos
WHERE stock > 0
ORDER BY nombre;

-- Movimientos con el nombre del medicamento.
SELECT mi.id_movimiento, m.nombre AS medicamento, mi.tipo,
       mi.cantidad, mi.motivo, mi.fecha
FROM movimientos_inventario mi
JOIN medicamentos m ON m.id_medicamento = mi.medicamento_id
ORDER BY mi.fecha DESC;
