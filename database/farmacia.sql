-- Base de datos independiente del nodo de Farmacia.
-- Compatible con MySQL 8.x.

CREATE DATABASE IF NOT EXISTS farmacia
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;
USE farmacia;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS movimientos_inventario;
DROP TABLE IF EXISTS medicamentos;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE medicamentos (
    id_medicamento INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL,
    principio_activo VARCHAR(120) NOT NULL,
    stock INT UNSIGNED NOT NULL DEFAULT 0,
    precio DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_medicamentos_precio CHECK (precio >= 0),
    UNIQUE KEY uq_medicamentos_nombre (nombre)
) ENGINE = InnoDB;

CREATE TABLE movimientos_inventario (
    id_movimiento INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    medicamento_id INT UNSIGNED NOT NULL,
    tipo ENUM('entrada', 'salida', 'ajuste') NOT NULL,
    cantidad INT UNSIGNED NOT NULL,
    motivo VARCHAR(150) NOT NULL,
    fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_movimiento_cantidad CHECK (cantidad > 0)
) ENGINE = InnoDB;

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
