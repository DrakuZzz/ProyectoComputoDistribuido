-- Registros de prueba para ambas bases.

USE clinica;

INSERT INTO usuarios (nombre, correo, password_hash, rol) VALUES
('Administrador', 'admin@clinica.example', 'demo-hash-admin', 'administrador'),
('Recepción 1', 'recepcion1@clinica.example', 'demo-hash-recepcion1', 'recepcion'),
('Recepción 2', 'recepcion2@clinica.example', 'demo-hash-recepcion2', 'recepcion'),
('Dra. Laura Méndez', 'laura.mendez@clinica.example', 'demo-hash-medico1', 'medico'),
('Dr. Miguel Soto', 'miguel.soto@clinica.example', 'demo-hash-medico2', 'medico'),
('Laboratorio 1', 'lab1@clinica.example', 'demo-hash-lab1', 'laboratorio'),
('Laboratorio 2', 'lab2@clinica.example', 'demo-hash-lab2', 'laboratorio'),
('Farmacia 1', 'farmacia1@clinica.example', 'demo-hash-farmacia1', 'farmacia'),
('Farmacia 2', 'farmacia2@clinica.example', 'demo-hash-farmacia2', 'farmacia'),
('Administrador respaldo', 'respaldo@clinica.example', 'demo-hash-respaldo', 'administrador');

INSERT INTO pacientes (nombre, correo, telefono, fecha_nacimiento) VALUES
('Ana López', 'ana.lopez@example.com', '5551000001', '1990-02-14'),
('Bruno Martínez', 'bruno.martinez@example.com', '5551000002', '1985-07-21'),
('Carla Hernández', 'carla.hernandez@example.com', '5551000003', '1998-11-03'),
('Diego Ramírez', 'diego.ramirez@example.com', '5551000004', '1979-05-30'),
('Elena Torres', 'elena.torres@example.com', '5551000005', '1992-09-18'),
('Felipe Sánchez', 'felipe.sanchez@example.com', '5551000006', '1988-01-26'),
('Gabriela Cruz', 'gabriela.cruz@example.com', '5551000007', '2000-04-09'),
('Hugo Flores', 'hugo.flores@example.com', '5551000008', '1975-12-12'),
('Irene Vargas', 'irene.vargas@example.com', '5551000009', '1995-06-07'),
('Jorge Castillo', 'jorge.castillo@example.com', '5551000010', '1982-10-25');

INSERT INTO medicos (nombre, especialidad, correo, cedula) VALUES
('Dra. Laura Méndez', 'Medicina general', 'laura.mendez@clinica.example', 'CED-1001'),
('Dr. Miguel Soto', 'Cardiología', 'miguel.soto@clinica.example', 'CED-1002'),
('Dra. Natalia Ruiz', 'Pediatría', 'natalia.ruiz@clinica.example', 'CED-1003'),
('Dr. Óscar Peña', 'Dermatología', 'oscar.pena@clinica.example', 'CED-1004'),
('Dra. Patricia León', 'Ginecología', 'patricia.leon@clinica.example', 'CED-1005'),
('Dr. Ricardo Gil', 'Traumatología', 'ricardo.gil@clinica.example', 'CED-1006'),
('Dra. Sofía Mora', 'Neurología', 'sofia.mora@clinica.example', 'CED-1007'),
('Dr. Tomás Ríos', 'Oftalmología', 'tomas.rios@clinica.example', 'CED-1008'),
('Dra. Valeria Núñez', 'Endocrinología', 'valeria.nunez@clinica.example', 'CED-1009'),
('Dr. William Pardo', 'Neumología', 'william.pardo@clinica.example', 'CED-1010');

INSERT INTO citas (paciente_id, medico_id, fecha, motivo, estado) VALUES
(1, 1, '2026-11-12 08:00:00', 'Dolor de cabeza persistente', 'atendida'),
(2, 2, '2026-11-12 09:00:00', 'Control de presión arterial', 'atendida'),
(3, 3, '2026-11-12 10:00:00', 'Fiebre y tos', 'atendida'),
(4, 4, '2026-11-12 11:00:00', 'Revisión de piel', 'atendida'),
(5, 5, '2026-11-13 08:00:00', 'Consulta preventiva', 'programada'),
(6, 6, '2026-11-13 09:00:00', 'Dolor muscular', 'programada'),
(7, 7, '2026-11-13 10:00:00', 'Migraña', 'programada'),
(8, 8, '2026-11-13 11:00:00', 'Revisión visual', 'programada'),
(9, 9, '2026-11-14 08:00:00', 'Control metabólico', 'programada'),
(10, 10, '2026-11-14 09:00:00', 'Dificultad respiratoria', 'programada');

INSERT INTO consultas (cita_id, paciente_id, medico_id, diagnostico, notas) VALUES
(1, 1, 1, 'Cefalea tensional', 'Reposo e hidratación'),
(2, 2, 2, 'Hipertensión controlada', 'Continuar seguimiento'),
(3, 3, 3, 'Infección respiratoria leve', 'Vigilar temperatura'),
(4, 4, 4, 'Dermatitis de contacto', 'Evitar irritante'),
(5, 5, 5, 'Consulta preventiva', 'Sin hallazgos relevantes'),
(6, 6, 6, 'Contractura muscular', 'Aplicar frío local'),
(7, 7, 7, 'Migraña episódica', 'Llevar diario de síntomas'),
(8, 8, 8, 'Astenopía visual', 'Reducir tiempo de pantalla'),
(9, 9, 9, 'Resistencia a la insulina', 'Revisar alimentación'),
(10, 10, 10, 'Broncoespasmo leve', 'Control respiratorio');

INSERT INTO resultados (consulta_id, tipo_prueba, resultado, validado) VALUES
(1, 'Biometría hemática', 'Valores dentro de rango', TRUE),
(2, 'Perfil lipídico', 'Colesterol en seguimiento', TRUE),
(3, 'Prueba rápida', 'Resultado negativo', TRUE),
(4, 'Alergia cutánea', 'Reacción leve', TRUE),
(5, 'Glucosa', '92 mg/dL', TRUE),
(6, 'Radiografía', 'Sin lesión ósea', TRUE),
(7, 'Resonancia', 'Sin alteraciones agudas', FALSE),
(8, 'Agudeza visual', '20/25 ambos ojos', TRUE),
(9, 'Hemoglobina glucosilada', '6.1%', TRUE),
(10, 'Espirometría', 'Patrón obstructivo leve', FALSE);

INSERT INTO recetas
    (paciente_id, medico_id, paciente, correo_paciente, medico, estado)
VALUES
(1, 1, 'Ana López', 'ana.lopez@example.com', 'Dra. Laura Méndez', 'surtida'),
(2, 2, 'Bruno Martínez', 'bruno.martinez@example.com', 'Dr. Miguel Soto', 'emitida'),
(3, 3, 'Carla Hernández', 'carla.hernandez@example.com', 'Dra. Natalia Ruiz', 'surtida'),
(4, 4, 'Diego Ramírez', 'diego.ramirez@example.com', 'Dr. Óscar Peña', 'emitida'),
(5, 5, 'Elena Torres', 'elena.torres@example.com', 'Dra. Patricia León', 'surtida'),
(6, 6, 'Felipe Sánchez', 'felipe.sanchez@example.com', 'Dr. Ricardo Gil', 'emitida'),
(7, 7, 'Gabriela Cruz', 'gabriela.cruz@example.com', 'Dra. Sofía Mora', 'cancelada'),
(8, 8, 'Hugo Flores', 'hugo.flores@example.com', 'Dr. Tomás Ríos', 'emitida'),
(9, 9, 'Irene Vargas', 'irene.vargas@example.com', 'Dra. Valeria Núñez', 'surtida'),
(10, 10, 'Jorge Castillo', 'jorge.castillo@example.com', 'Dr. William Pardo', 'emitida');

INSERT INTO receta_medicamentos
    (receta_id, medicamento_id, indicaciones, cantidad)
VALUES
(1, 1, 'Tomar una tableta cada 8 horas', 10),
(2, 7, 'Tomar una tableta cada 24 horas', 30),
(3, 4, 'Tomar una tableta por la noche', 10),
(4, 9, 'Tomar una tableta cada 12 horas', 14),
(5, 5, 'Tomar una cápsula antes del desayuno', 30),
(6, 2, 'Tomar una tableta después de comer', 15),
(7, 3, 'Tomar una cápsula cada 8 horas', 21),
(8, 8, 'Usar dos inhalaciones cuando sea necesario', 1),
(9, 6, 'Tomar una tableta con la cena', 30),
(10, 10, 'Tomar una tableta cada 24 horas', 3);

USE farmacia;
INSERT INTO medicamentos (nombre, principio_activo, stock, precio) VALUES
('Paracetamol 500 mg', 'Paracetamol', 120, 25.50),
('Ibuprofeno 400 mg', 'Ibuprofeno', 95, 38.00),
('Amoxicilina 500 mg', 'Amoxicilina', 80, 72.90),
('Loratadina 10 mg', 'Loratadina', 110, 45.00),
('Omeprazol 20 mg', 'Omeprazol', 75, 58.50),
('Metformina 850 mg', 'Metformina', 65, 64.00),
('Losartán 50 mg', 'Losartán', 90, 83.00),
('Salbutamol 100 mcg', 'Salbutamol', 40, 115.00),
('Diclofenaco 50 mg', 'Diclofenaco', 70, 42.50),
('Azitromicina 500 mg', 'Azitromicina', 55, 96.00);

INSERT INTO movimientos_inventario
    (medicamento_id, tipo, cantidad, motivo)
VALUES
(1, 'entrada', 120, 'Carga inicial'),
(2, 'entrada', 95, 'Carga inicial'),
(3, 'entrada', 80, 'Carga inicial'),
(4, 'entrada', 110, 'Carga inicial'),
(5, 'entrada', 75, 'Carga inicial'),
(6, 'entrada', 65, 'Carga inicial'),
(7, 'entrada', 90, 'Carga inicial'),
(8, 'entrada', 40, 'Carga inicial'),
(9, 'entrada', 70, 'Carga inicial'),
(10, 'entrada', 55, 'Carga inicial');
