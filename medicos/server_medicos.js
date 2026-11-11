const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname)));

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'clinica',
    port: 3306
});

db.connect(err => {
    if (err) console.error('Error conectando a BD Médicos:', err);
    else console.log('Conectado a clinica_medicos (Puerto 3000)');
});

// Configuración de Nodemailer para correo automático
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'akape.ent@gmail.com',
        pass: 'rikj pfxi cfor lttz'
    }
});

// GET: Consultar recetas
app.get('/api/medicos/recetas', (req, res) => {
    const query = `
        SELECT r.*, rm.medicamento_id, rm.indicaciones AS medicamento_indicaciones
        FROM recetas r
        LEFT JOIN receta_medicamentos rm ON rm.receta_id = r.id_receta
        ORDER BY r.fecha DESC, r.id_receta DESC
    `;
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: 'Error al consultar recetas' });
        res.json({ nodo: "Servicio de Médicos (Puerto 3000)", recetas: results });
    });
});

app.get('/api/medicos/pacientes', (req, res) => {
    db.query(
        'SELECT id_paciente, nombre, correo FROM pacientes ORDER BY nombre',
        (err, results) => {
            if (err) return res.status(500).json({ error: 'Error al consultar pacientes' });
            res.json({ pacientes: results });
        }
    );
});

app.get('/api/medicos/identificar/:cedula', (req, res) => {
    db.query(
        'SELECT id_medico, nombre, especialidad, cedula FROM medicos WHERE cedula = ? AND activo = TRUE',
        [req.params.cedula.trim()],
        (err, results) => {
            if (err) return res.status(500).json({ error: 'Error al identificar al médico' });
            if (!results.length) return res.status(404).json({ error: 'No existe un médico activo con esa cédula' });
            res.json({ medico: results[0] });
        }
    );
});

app.post('/api/medicos/citas', (req, res) => {
    const { paciente_id, cedula_medico, fecha, motivo } = req.body;
    if (!Number.isInteger(paciente_id) || paciente_id <= 0 ||
        !cedula_medico?.trim() || !fecha || !motivo?.trim()) {
        return res.status(400).json({ error: 'Paciente, cédula, fecha y motivo son obligatorios' });
    }

    db.query(
        `SELECT m.id_medico
         FROM medicos m
         JOIN pacientes p ON p.id_paciente = ?
         WHERE m.cedula = ? AND m.activo = TRUE`,
        [paciente_id, cedula_medico.trim()],
        (identityError, rows) => {
            if (identityError) return res.status(500).json({ error: 'Error al validar paciente y médico' });
            if (!rows.length) return res.status(400).json({ error: 'El paciente o la cédula del médico no existe' });

            db.query(
                'INSERT INTO citas (paciente_id, medico_id, fecha, motivo, estado) VALUES (?, ?, ?, ?, ?)',
                [paciente_id, rows[0].id_medico, fecha, motivo.trim(), 'programada'],
                (insertError, result) => insertError
                    ? res.status(500).json({ error: 'Error al registrar la cita' })
                    : res.status(201).json({ mensaje: 'Cita registrada', id_cita: result.insertId })
            );
        }
    );
});

// GET: Consultar inventario del nodo de farmacia (Puerto 4000) vía HTTP
app.get('/api/medicos/consultar-farmacia', async (req, res) => {
    try {
        const respuesta = await fetch('http://localhost:4000/api/farmacia/medicamentos');
        const datosFarmacia = await respuesta.json();
        res.json({
            mensaje: "Datos obtenidos del nodo externo de Farmacia (Puerto 4000)",
            inventario_externo: datosFarmacia
        });
    } catch (error) {
        res.status(503).json({ error: "Servicio de Farmacia no disponible en el puerto 4000" });
    }
});

// POST: Crear receta, guardar en BD y enviar correo automático
app.post('/api/medicos/recetas', async (req, res) => {
    const { paciente_id, cedula_medico, medicamentos } = req.body;

    if (!Number.isInteger(paciente_id) || !cedula_medico?.trim() ||
        !Array.isArray(medicamentos) || medicamentos.length === 0 ||
        medicamentos.some(({ medicamento_id, indicaciones }) =>
            !Number.isInteger(medicamento_id) || !indicaciones?.trim())) {
        return res.status(400).json({ error: 'Seleccione un paciente, indique una cédula válida y agregue medicamentos con indicaciones' });
    }

    let inventario;
    try {
        const farmaciaResponse = await fetch('http://localhost:4000/api/farmacia/medicamentos');
        if (!farmaciaResponse.ok) throw new Error(`Farmacia respondió HTTP ${farmaciaResponse.status}`);
        inventario = await farmaciaResponse.json();
    } catch (error) {
        console.error('Error al validar medicamentos en el nodo de Farmacia:', error);
        return res.status(503).json({ error: 'Servicio de Farmacia no disponible para validar medicamentos' });
    }

    const medicamentosDisponibles = new Set(
        inventario.medicamentos.map(({ id_medicamento }) => id_medicamento)
    );
    if (medicamentos.some(({ medicamento_id }) => !medicamentosDisponibles.has(medicamento_id))) {
        return res.status(400).json({ error: 'Uno o más medicamentos no existen en el inventario de Farmacia' });
    }

    db.query(
        `SELECT p.nombre AS paciente, p.correo AS correo_paciente,
                m.id_medico, m.nombre AS medico
         FROM pacientes p
         JOIN medicos m ON m.cedula = ? AND m.activo = TRUE
         WHERE p.id_paciente = ?`,
        [cedula_medico.trim(), paciente_id],
        (identityError, identityResults) => {
        if (identityError) return res.status(500).json({ error: 'Error al validar paciente y médico' });
        if (!identityResults.length) {
            return res.status(400).json({ error: 'El paciente o la cédula del médico no existe' });
        }

        const { paciente, correo_paciente, id_medico, medico } = identityResults[0];
        db.beginTransaction((transactionError) => {
        if (transactionError) return res.status(500).json({ error: 'Error al iniciar el registro de la receta' });

        const query = `INSERT INTO recetas
            (paciente_id, medico_id, paciente, correo_paciente, medico)
            VALUES (?, ?, ?, ?, ?)`;
        db.query(query, [paciente_id, id_medico, paciente, correo_paciente, medico], (err, result) => {
        if (err) {
            return db.rollback(() => res.status(500).json({ error: 'Error al guardar la receta' }));
        }

        const recetaId = result.insertId;
        const valores = medicamentos.map(({ medicamento_id, indicaciones }) =>
            [recetaId, medicamento_id, indicaciones.trim()]);
        db.query(
            'INSERT INTO receta_medicamentos (receta_id, medicamento_id, indicaciones) VALUES ?',
            [valores],
            async (detailError) => {
            if (detailError) {
                return db.rollback(() => res.status(500).json({ error: 'Error al guardar los medicamentos de la receta' }));
            }

        const mailOptions = {
            from: 'akape.ent@gmail.com',
            to: correo_paciente,
            subject: '🏥 Su Receta Médica Digital - Clínica',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                    <h2 style="color: #0056b3;">Clínica Médica - Receta Digital</h2>
                    <p>Estimado/a <strong>${paciente}</strong>,</p>
                    <p>A continuación se detallan las indicaciones de su consulta médica:</p>
                    <ul style="background: #f9f9f9; padding: 15px; border-radius: 5px;">
                        ${medicamentos.map(({ medicamento_id, indicaciones }) =>
                            `<li><strong>Medicamento #${medicamento_id}:</strong> ${indicaciones}</li>`).join('')}
                    </ul>
                    <p>Presente esta notificación en farmacia.</p>
                    <p style="font-size: 12px; color: #777;">Mensaje automático del sistema distribuido.</p>
                </div>
            `
        };

        try {
            await transporter.sendMail(mailOptions);
            db.commit((commitError) => {
                if (commitError) return res.status(500).json({ error: 'Error al confirmar la receta' });
                res.status(201).json({
                mensaje: 'Receta registrada en base de datos y correo enviado automáticamente al paciente',
                id_receta: recetaId
                });
            });
        } catch (mailError) {
            db.commit((commitError) => {
                if (commitError) return res.status(500).json({ error: 'Error al confirmar la receta' });
                res.status(201).json({
                mensaje: 'Receta guardada en BD, pero falló el envío del correo electrónico',
                id_receta: recetaId
                });
            });
        }
            });
        });
        });
    });
});

app.listen(3000, () => {
    console.log('Servicio de Médicos corriendo en http://localhost:3000');
});