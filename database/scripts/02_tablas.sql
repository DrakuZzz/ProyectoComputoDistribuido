-- Tablas, claves y restricciones de clinica y farmacia.
-- Compatible con MySQL 8.x.

USE clinica;
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS receta_medicamentos;
DROP TABLE IF EXISTS recetas;
DROP TABLE IF EXISTS resultados;
DROP TABLE IF EXISTS consultas;
DROP TABLE IF EXISTS citas;
DROP TABLE IF EXISTS medicos;
DROP TABLE IF EXISTS pacientes;
DROP TABLE IF EXISTS usuarios;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE usuarios (
    id_usuario INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol ENUM('administrador', 'recepcion', 'medico', 'laboratorio', 'farmacia') NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE = InnoDB;

CREATE TABLE pacientes (
    id_paciente INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(150) NOT NULL UNIQUE,
    telefono VARCHAR(20),
    fecha_nacimiento DATE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE = InnoDB;

CREATE TABLE medicos (
    id_medico INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    especialidad VARCHAR(100) NOT NULL,
    correo VARCHAR(150) NOT NULL UNIQUE,
    cedula VARCHAR(30) NOT NULL UNIQUE,
    activo BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE = InnoDB;

CREATE TABLE citas (
    id_cita INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    paciente_id INT UNSIGNED NOT NULL,
    medico_id INT UNSIGNED NOT NULL,
    fecha DATETIME NOT NULL,
    motivo VARCHAR(255) NOT NULL,
    estado ENUM('programada', 'atendida', 'cancelada') NOT NULL DEFAULT 'programada',
    CONSTRAINT fk_citas_paciente FOREIGN KEY (paciente_id) REFERENCES pacientes (id_paciente),
    CONSTRAINT fk_citas_medico FOREIGN KEY (medico_id) REFERENCES medicos (id_medico),
    INDEX idx_citas_fecha (fecha)
) ENGINE = InnoDB;

CREATE TABLE consultas (
    id_consulta INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    cita_id INT UNSIGNED NOT NULL UNIQUE,
    paciente_id INT UNSIGNED NOT NULL,
    medico_id INT UNSIGNED NOT NULL,
    diagnostico TEXT NOT NULL,
    notas TEXT,
    fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_consultas_cita FOREIGN KEY (cita_id) REFERENCES citas (id_cita),
    CONSTRAINT fk_consultas_paciente FOREIGN KEY (paciente_id) REFERENCES pacientes (id_paciente),
    CONSTRAINT fk_consultas_medico FOREIGN KEY (medico_id) REFERENCES medicos (id_medico)
) ENGINE = InnoDB;

CREATE TABLE resultados (
    id_resultado INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    consulta_id INT UNSIGNED NOT NULL,
    tipo_prueba VARCHAR(100) NOT NULL,
    resultado TEXT NOT NULL,
    fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    validado BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_resultados_consulta FOREIGN KEY (consulta_id) REFERENCES consultas (id_consulta)
) ENGINE = InnoDB;

CREATE TABLE recetas (
    id_receta INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    paciente_id INT UNSIGNED NULL,
    medico_id INT UNSIGNED NULL,
    paciente VARCHAR(100) NOT NULL,
    correo_paciente VARCHAR(150) NOT NULL,
    medico VARCHAR(100) NOT NULL,
    fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estado ENUM('emitida', 'surtida', 'cancelada') NOT NULL DEFAULT 'emitida',
    CONSTRAINT fk_recetas_paciente FOREIGN KEY (paciente_id) REFERENCES pacientes (id_paciente),
    CONSTRAINT fk_recetas_medico FOREIGN KEY (medico_id) REFERENCES medicos (id_medico),
    INDEX idx_recetas_paciente (paciente_id),
    INDEX idx_recetas_medico (medico_id)
) ENGINE = InnoDB;

CREATE TABLE receta_medicamentos (
    id_detalle INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    receta_id INT UNSIGNED NOT NULL,
    medicamento_id INT UNSIGNED NOT NULL,
    indicaciones VARCHAR(255) NOT NULL,
    cantidad INT UNSIGNED NOT NULL DEFAULT 1,
    CONSTRAINT fk_detalle_receta FOREIGN KEY (receta_id) REFERENCES recetas (id_receta) ON DELETE CASCADE,
    UNIQUE KEY uq_receta_medicamento (receta_id, medicamento_id)
) ENGINE = InnoDB;

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
