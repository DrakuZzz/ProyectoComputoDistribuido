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

const dbFarmacia = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'farmacia',
    port: 3306
});
const dbClinica = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'clinica',
    port: 3306
});

dbFarmacia.connect(err => {
    if (err) console.error('Error conectando a BD Farmacia:', err);
    else console.log('Conectado a farmacia (Puerto 4000)');
});
dbClinica.connect(err => {
    if (err) console.error('Error conectando a BD Clínica para recetas:', err);
    else console.log('Conectado a clinica para recetas (Puerto 4000)');
});

// GET: Consultar medicamentos
app.get('/api/farmacia/medicamentos', (req, res) => {
    dbFarmacia.query('SELECT * FROM medicamentos ORDER BY nombre', (err, results) => {
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
    dbClinica.query(
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
    dbFarmacia.query(query, [nombre, stock, precio], (err, result) => {
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

    dbFarmacia.query(
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

app.get('/api/farmacia/movimientos', (req, res) => {
    dbFarmacia.query(
        `SELECT mi.*, m.nombre AS medicamento
         FROM movimientos_inventario mi
         JOIN medicamentos m ON m.id_medicamento = mi.medicamento_id
         ORDER BY mi.fecha DESC`,
        (err, results) => {
            if (err) return res.status(500).json({ error: 'Error al consultar movimientos' });
            res.json({ movimientos: results });
        }
    );
});

app.post('/api/farmacia/movimientos', (req, res) => {
    const { medicamento_id, tipo, cantidad, motivo } = req.body;
    if (!Number.isInteger(Number(medicamento_id)) || Number(medicamento_id) <= 0 ||
        !Number.isInteger(Number(cantidad)) || Number(cantidad) <= 0 ||
        !['entrada', 'salida', 'ajuste'].includes(tipo) || !motivo?.trim()) {
        return res.status(400).json({ error: 'Datos de movimiento inválidos' });
    }

    dbFarmacia.beginTransaction(error => {
        if (error) return res.status(500).json({ error: 'Error al iniciar el movimiento' });
        dbFarmacia.query('SELECT stock FROM medicamentos WHERE id_medicamento = ? FOR UPDATE', [medicamento_id], (lockError, rows) => {
            if (lockError || !rows.length) {
                return dbFarmacia.rollback(() => lockError
                    ? res.status(500).json({ error: 'Error al consultar stock' })
                    : res.status(404).json({ error: 'Medicamento no encontrado' }));
            }
            const stock = rows[0].stock;
            const nuevoStock = tipo === 'entrada' ? stock + Number(cantidad) : tipo === 'salida' ? stock - Number(cantidad) : Number(cantidad);
            if (nuevoStock < 0) return dbFarmacia.rollback(() => res.status(400).json({ error: 'No hay stock suficiente para la salida' }));
            dbFarmacia.query('UPDATE medicamentos SET stock = ? WHERE id_medicamento = ?', [nuevoStock, medicamento_id], updateError => {
                if (updateError) return dbFarmacia.rollback(() => res.status(500).json({ error: 'Error al actualizar stock' }));
                dbFarmacia.query(
                    'INSERT INTO movimientos_inventario (medicamento_id, tipo, cantidad, motivo) VALUES (?, ?, ?, ?)',
                    [medicamento_id, tipo, cantidad, motivo.trim()],
                    (insertError, result) => {
                        if (insertError) return dbFarmacia.rollback(() => res.status(500).json({ error: 'Error al registrar movimiento' }));
                        dbFarmacia.commit(commitError => commitError
                            ? res.status(500).json({ error: 'Error al confirmar movimiento' })
                            : res.status(201).json({ mensaje: 'Movimiento registrado', id_movimiento: result.insertId, stock: nuevoStock }));
                    }
                );
            });
        });
    });
});

app.listen(4000, () => {
    console.log('Servicio de Farmacia corriendo en http://localhost:4000');
});