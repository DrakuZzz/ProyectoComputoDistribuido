// ==========================================
// ARCHIVO PRINCIPAL DE LA CLÍNICA (Raíz)
// Orquestador de microservicios distribuidos
// ==========================================

console.log('----------------------------------------------------');
console.log('🏥 Iniciando Sistema Distribuido de la Clínica...');
console.log('----------------------------------------------------');

// 1. Lanza el servidor de Farmacia (Puerto 4000)
require('./farmacia/server_farmacia.js');

// 2. Lanza el servidor de Médicos (Puerto 3000)
require('./medicos/server_medicos.js');