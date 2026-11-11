const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname)));

const soloFarmacia = (req, res, next) => {
    if (req.header('x-rol') !== 'farmacia') {
        return res.status(403).json({ error: 'Se requiere el rol de farmacia' });
    }
    next();
};

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'clinica',
    port: 3306
});

db.connect(err => {
    if (err) console.error('Error conectando a BD Farmacia:', err);
    else console.log('Conectado a clinica_farmacia (Puerto 4000)');
});

// GET: Consultar medicamentos
app.get('/api/farmacia/medicamentos', (req, res) => {
    db.query('SELECT * FROM medicamentos', (err, results) => {
        if (err) return res.status(500).json({ error: 'Error al consultar inventario' });
        res.json({
            nodo: "Servicio de Farmacia (Puerto 4000)",
            total: results.length,
            medicamentos: results
        });
    });
});

// Farmacia puede consultar una receta, pero nunca el diagnóstico clínico.
app.get('/api/farmacia/recetas/:id', soloFarmacia, (req, res) => {
    db.query(
        `SELECT r.id_receta, r.paciente, r.fecha, r.estado,
                rm.medicamento_id, rm.indicaciones, rm.cantidad
         FROM recetas r
         LEFT JOIN receta_medicamentos rm ON rm.receta_id = r.id_receta
         WHERE r.id_receta = ?`,
        [Number(req.params.id)],
        (err, results) => {
            if (err) return res.status(500).json({ error: 'Error al consultar la receta' });
            if (!results.length) return res.status(404).json({ error: 'Receta no encontrada' });
            res.json({ receta: results });
        }
    );
});

app.put('/api/farmacia/consultas/:id/diagnostico', soloFarmacia, (req, res) => {
    res.status(403).json({
        error: 'Farmacia puede consultar recetas, pero no puede modificar diagnósticos'
    });
});

// POST: Añadir medicamento
app.post('/api/farmacia/medicamentos', (req, res) => {
    const { nombre, stock, precio } = req.body;
    const query = 'INSERT INTO medicamentos (nombre, stock, precio) VALUES (?, ?, ?)';
    db.query(query, [nombre, stock, precio], (err, result) => {
        if (err) return res.status(500).json({ error: 'Error al registrar medicamento' });
        res.status(201).json({ mensaje: 'Medicamento añadido con éxito', id_medicamento: result.insertId });
    });
});

// PUT: Actualizar existencias de un medicamento
app.put('/api/farmacia/medicamentos/:id/stock', (req, res) => {
    const idMedicamento = Number(req.params.id);
    const stock = Number(req.body.stock);

    if (!Number.isInteger(idMedicamento) || idMedicamento <= 0 ||
        !Number.isInteger(stock) || stock < 0) {
        return res.status(400).json({ error: 'El ID y el stock deben ser números enteros válidos' });
    }

    db.query(
        'UPDATE medicamentos SET stock = ? WHERE id_medicamento = ?',
        [stock, idMedicamento],
        (err, result) => {
            if (err) return res.status(500).json({ error: 'Error al actualizar el stock' });
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Medicamento no encontrado' });
            }
            res.json({ mensaje: 'Stock actualizado correctamente', id_medicamento: idMedicamento, stock });
        }
    );
});

app.listen(4000, () => {
    console.log('Servicio de Farmacia corriendo en http://localhost:4000');
});