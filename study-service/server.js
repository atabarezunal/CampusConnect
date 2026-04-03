require('dotenv').config();
const app = require('./src/app');


const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, () => {
    console.log('==============================================');
    console.log(` Study Service iniciado correctamente`);
    console.log(` Puerto: ${PORT}`);
    console.log(` URL: http://localhost:${PORT}/api/study`);
    console.log('==============================================');
});

process.on('unhandledRejection', (err) => {
    console.log('❌ Error no manejado:', err.message);
    server.close(() => process.exit(1));
});