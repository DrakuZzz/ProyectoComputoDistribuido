-- Creación de las bases de datos del sistema distribuido.
-- Ejecutar antes que los demás scripts.

CREATE DATABASE IF NOT EXISTS clinica
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

CREATE DATABASE IF NOT EXISTS farmacia
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;
