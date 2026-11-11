const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname)));

const db = mysql.createConnection({
    host: 'localhost', user: 'root', password: '123456', database: 'clinica', port: 3306
});
db.connect(error => {
    if (error) console.error('Error conectando a BD Clínica:', error);
    else console.log('Conectado a clinica_admin (Puerto 5000)');
});

const integer = value => Number.isInteger(Number(value)) && Number(value) > 0;
const required = (body, fields) => fields.every(field => typeof body[field] === 'string' ? body[field].trim() : body[field] !== undefined);
const failure = (res, error, message) => {
    if (error && error.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Ya existe un registro con ese correo, nombre o cédula' });
    if (error && error.code === 'ER_NO_REFERENCED_ROW_2') return res.status(400).json({ error: 'La referencia relacionada no existe' });
    console.error(message, error);
    return res.status(500).json({ error: message });
};
const farmaciaRequest = async (path, options = {}) => {
    const response = await fetch(`http://localhost:4000${path}`, {
        ...options,
        headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }
    });
    const data = await response.json();
    return { response, data };
};

app.get('/api/clinica/pacientes', (req, res) => {
    db.query('SELECT * FROM pacientes ORDER BY nombre', (e, rows) => e ? failure(res, e, 'Error al consultar pacientes') : res.json({ pacientes: rows }));
});
app.post('/api/clinica/pacientes', (req, res) => {
    const { nombre, correo, telefono, fecha_nacimiento } = req.body;
    if (!required(req.body, ['nombre', 'correo', 'fecha_nacimiento'])) return res.status(400).json({ error: 'Nombre, correo y fecha de nacimiento son obligatorios' });
    db.query('INSERT INTO pacientes (nombre, correo, telefono, fecha_nacimiento) VALUES (?, ?, ?, ?)', [nombre.trim(), correo.trim(), telefono?.trim() || null, fecha_nacimiento], (e, result) => e ? failure(res, e, 'Error al registrar paciente') : res.status(201).json({ mensaje: 'Paciente registrado', id_paciente: result.insertId }));
});

app.get('/api/clinica/medicos', (req, res) => {
    db.query('SELECT * FROM medicos ORDER BY nombre', (e, rows) => e ? failure(res, e, 'Error al consultar médicos') : res.json({ medicos: rows }));
});
app.post('/api/clinica/medicos', (req, res) => {
    const { nombre, especialidad, correo, cedula } = req.body;
    if (!required(req.body, ['nombre', 'especialidad', 'correo', 'cedula'])) return res.status(400).json({ error: 'Todos los campos del médico son obligatorios' });
    db.query('INSERT INTO medicos (nombre, especialidad, correo, cedula) VALUES (?, ?, ?, ?)', [nombre.trim(), especialidad.trim(), correo.trim(), cedula.trim()], (e, result) => e ? failure(res, e, 'Error al registrar médico') : res.status(201).json({ mensaje: 'Médico registrado', id_medico: result.insertId }));
});

app.get('/api/clinica/citas', (req, res) => {
    db.query(`SELECT c.*, p.nombre AS paciente, m.nombre AS medico FROM citas c JOIN pacientes p ON p.id_paciente=c.paciente_id JOIN medicos m ON m.id_medico=c.medico_id ORDER BY c.fecha DESC`, (e, rows) => e ? failure(res, e, 'Error al consultar citas') : res.json({ citas: rows }));
});
app.post('/api/clinica/citas', (req, res) => {
    const { paciente_id, medico_id, fecha, motivo, estado = 'programada' } = req.body;
    if (!integer(paciente_id) || !integer(medico_id) || !fecha || !motivo?.trim() || !['programada', 'atendida', 'cancelada'].includes(estado)) return res.status(400).json({ error: 'Datos de cita inválidos' });
    db.query('INSERT INTO citas (paciente_id, medico_id, fecha, motivo, estado) VALUES (?, ?, ?, ?, ?)', [paciente_id, medico_id, fecha, motivo.trim(), estado], (e, result) => e ? failure(res, e, 'Error al registrar cita') : res.status(201).json({ mensaje: 'Cita registrada', id_cita: result.insertId }));
});

app.get('/api/clinica/consultas', (req, res) => {
    db.query(`SELECT c.*, p.nombre AS paciente, m.nombre AS medico FROM consultas c JOIN pacientes p ON p.id_paciente=c.paciente_id JOIN medicos m ON m.id_medico=c.medico_id ORDER BY c.fecha DESC`, (e, rows) => e ? failure(res, e, 'Error al consultar consultas') : res.json({ consultas: rows }));
});
app.post('/api/clinica/consultas', (req, res) => {
    const { cita_id, paciente_id, medico_id, diagnostico, notas } = req.body;
    if (!integer(cita_id) || !integer(paciente_id) || !integer(medico_id) || !diagnostico?.trim()) return res.status(400).json({ error: 'Cita, paciente, médico y diagnóstico son obligatorios' });
    db.query('INSERT INTO consultas (cita_id, paciente_id, medico_id, diagnostico, notas) VALUES (?, ?, ?, ?, ?)', [cita_id, paciente_id, medico_id, diagnostico.trim(), notas?.trim() || null], (e, result) => e ? (e.code === 'ER_DUP_ENTRY' ? res.status(409).json({ error: 'La cita ya tiene una consulta registrada' }) : failure(res, e, 'Error al registrar consulta')) : res.status(201).json({ mensaje: 'Consulta registrada', id_consulta: result.insertId }));
});

app.get('/api/clinica/resultados', (req, res) => {
    db.query('SELECT * FROM resultados ORDER BY fecha DESC', (e, rows) => e ? failure(res, e, 'Error al consultar resultados') : res.json({ resultados: rows }));
});
app.post('/api/clinica/resultados', (req, res) => {
    const { consulta_id, tipo_prueba, resultado, validado = false } = req.body;
    if (!integer(consulta_id) || !tipo_prueba?.trim() || !resultado?.trim()) return res.status(400).json({ error: 'Consulta, tipo de prueba y resultado son obligatorios' });
    db.query('INSERT INTO resultados (consulta_id, tipo_prueba, resultado, validado) VALUES (?, ?, ?, ?)', [consulta_id, tipo_prueba.trim(), resultado.trim(), Boolean(validado)], (e, result) => e ? failure(res, e, 'Error al registrar resultado') : res.status(201).json({ mensaje: 'Resultado registrado', id_resultado: result.insertId }));
});

app.get('/api/clinica/usuarios', (req, res) => {
    db.query('SELECT id_usuario, nombre, correo, rol, activo FROM usuarios ORDER BY nombre', (e, rows) => e ? failure(res, e, 'Error al consultar usuarios') : res.json({ usuarios: rows }));
});
app.post('/api/clinica/usuarios', (req, res) => {
    const { nombre, correo, password_hash, rol } = req.body;
    if (!required(req.body, ['nombre', 'correo', 'password_hash']) || !['administrador', 'recepcion', 'medico', 'laboratorio', 'farmacia'].includes(rol)) return res.status(400).json({ error: 'Datos o rol de usuario inválidos' });
    db.query('INSERT INTO usuarios (nombre, correo, password_hash, rol) VALUES (?, ?, ?, ?)', [nombre.trim(), correo.trim(), password_hash, rol], (e, result) => e ? failure(res, e, 'Error al registrar usuario') : res.status(201).json({ mensaje: 'Usuario registrado', id_usuario: result.insertId }));
});

app.get('/api/clinica/medicamentos', async (req, res) => {
    try {
        const { response, data } = await farmaciaRequest('/api/farmacia/medicamentos');
        res.status(response.status).json(data);
    } catch (error) {
        console.error('Error al consultar medicamentos del nodo de Farmacia:', error);
        res.status(503).json({ error: 'Servicio de Farmacia no disponible' });
    }
});
app.get('/api/clinica/movimientos', async (req, res) => {
    try {
        const { response, data } = await farmaciaRequest('/api/farmacia/movimientos');
        res.status(response.status).json(data);
    } catch (error) {
        console.error('Error al consultar movimientos del nodo de Farmacia:', error);
        res.status(503).json({ error: 'Servicio de Farmacia no disponible' });
    }
});
app.post('/api/clinica/movimientos', async (req, res) => {
    try {
        const { response, data } = await farmaciaRequest('/api/farmacia/movimientos', {
            method: 'POST',
            body: JSON.stringify(req.body)
        });
        res.status(response.status).json(data);
    } catch (error) {
        console.error('Error al registrar movimiento en el nodo de Farmacia:', error);
        res.status(503).json({ error: 'Servicio de Farmacia no disponible' });
    }
});

app.listen(5000, () => console.log('Servicio de Clínica corriendo en http://localhost:5000'));
