const express = require('express');
const cors = require('cors');
const routes = require('./routes/routeStudy');

const app = express();
app.use(cors());
app.use(express.json());

// Tus rutas colgarán de /api/study
app.use('/api/study', routes);

module.exports = app;