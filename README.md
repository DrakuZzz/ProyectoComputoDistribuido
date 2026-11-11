# ProyectoComputoDistribuido

## Base de datos de la clínica

El proceso principal modelado es **recepción de paciente → cita → consulta
médica → laboratorio → receta → farmacia**. Los esquemas se encuentran en
[`database/clinica.sql`](./database/clinica.sql) y
[`database/farmacia.sql`](./database/farmacia.sql). La base `clinica` define
las tablas mínimas solicitadas:

1. `pacientes`
2. `medicos`
3. `citas`
4. `consultas`
5. `resultados`
6. `usuarios`

También incluye `recetas` y `receta_medicamentos`; las tablas de inventario
`medicamentos` y `movimientos_inventario` viven en la base independiente
`farmacia` para completar el flujo de farmacia.

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
`receta_medicamentos.medicamento_id` conserva el identificador del
medicamento, pero no usa una clave foránea porque `medicamentos` está en otra
base de datos. Los nodos coordinan ese identificador mediante sus APIs.

El script incluye diez registros de prueba en cada tabla. Para
instalarlo en MySQL:

```bash
mysql -u root -p < database/clinica.sql
mysql -u root -p < database/farmacia.sql
```

El servicio de Médicos (puerto 3000) y el de Clínica (puerto 5000) usan la base
`clinica`. El servicio de Farmacia (puerto 4000) usa la base `farmacia` para el
inventario y consulta la base `clinica` únicamente para leer recetas. Después
de importar ambos scripts, se puede iniciar el proyecto con:

```bash
npm start
```

El módulo de administración clínica se encuentra en
[`clinica/index.html`](./clinica/index.html) y funciona en el puerto 5000.
Expone operaciones para pacientes, médicos, citas, consultas, resultados,
usuarios y movimientos de inventario. Las operaciones de inventario se
redirigen por HTTP al nodo de Farmacia, donde actualizan el stock dentro de una
transacción y rechazan salidas mayores al stock actual.

En el módulo de Médicos, las recetas solo pueden asociarse a pacientes
registrados y la cédula se valida contra un médico activo antes de guardar la
receta.

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