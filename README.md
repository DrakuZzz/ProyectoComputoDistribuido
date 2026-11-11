# ProyectoComputoDistribuido

## Base de datos de la clínica

El proceso principal modelado es **recepción de paciente → cita → consulta
médica → laboratorio → receta → farmacia**. El esquema se encuentra en
[`database/clinica.sql`](./database/clinica.sql) y define las tablas mínimas
solicitadas:

1. `pacientes`
2. `medicos`
3. `citas`
4. `consultas`
5. `medicamentos`
6. `resultados`
7. `usuarios`

También incluye `recetas`, `receta_medicamentos` y `movimientos_inventario`
para completar el flujo de farmacia.

Las relaciones se implementan con claves foráneas:

- `citas.paciente_id` → `pacientes.id_paciente`
- `citas.medico_id` → `medicos.id_medico`
- `consultas.cita_id` → `citas.id_cita`
- `consultas.paciente_id` → `pacientes.id_paciente`
- `consultas.medico_id` → `medicos.id_medico`
- `resultados.consulta_id` → `consultas.id_consulta`
- `recetas.paciente_id` → `pacientes.id_paciente`
- `recetas.medico_id` → `medicos.id_medico`
- `receta_medicamentos.receta_id` → `recetas.id_receta`
- `receta_medicamentos.medicamento_id` → `medicamentos.id_medicamento`
- `movimientos_inventario.medicamento_id` → `medicamentos.id_medicamento`

El script incluye diez registros de prueba en cada tabla. Para
instalarlo en MySQL:

```bash
mysql -u root -p < database/clinica.sql
```

Los servicios de Médicos (puerto 3000) y Farmacia (puerto 4000) usan ahora la
base `clinica`. Después de importar el script, se puede iniciar el proyecto con:

```bash
npm start
```

### Usuarios y restricción de farmacia

La tabla `usuarios` distingue los roles `administrador`, `recepcion`,
`medico`, `laboratorio` y `farmacia`. Para probar la regla principal:

```bash
# Farmacia sí puede consultar la receta
curl -H "x-rol: farmacia" http://localhost:4000/api/farmacia/recetas/1

# Farmacia no puede modificar el diagnóstico: responde HTTP 403
curl -X PUT -H "x-rol: farmacia" \
  -H "Content-Type: application/json" \
  -d '{"diagnostico":"Cambio no autorizado"}' \
  http://localhost:4000/api/farmacia/consultas/1/diagnostico
```

La comunicación entre los nodos se realiza mediante la API HTTP. DHCP, DNS y
HTTPS son servicios de infraestructura que deben configurarse en el entorno de
despliegue; no se simulan dentro del código de la aplicación.