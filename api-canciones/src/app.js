const express = require('express');

const logger = require('./middlewares/logger');
const enriquecerBody = require('./middlewares/enriquecerBody');
const cancionesRouter = require('./routes/canciones');

const app = express();

// 1. Registrar todas las peticiones.
app.use(logger);

// 2. Interpretar los cuerpos JSON.
app.use(express.json());

// 3. Limpiar y enriquecer POST y PUT.
app.use('/api/canciones', enriquecerBody);

// 4. Registrar las rutas de canciones.
app.use('/api/canciones', cancionesRouter);

// 5. Gestionar las rutas inexistentes.
app.use((req, res) => {
    res.status(404).json({
        error: 'La ruta solicitada no existe.'
    });
});

// 6. Gestionar errores de JSON mal formado.
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400
        && 'body' in err) {
        return res.status(400).json({
            error: 'El cuerpo de la petición contiene JSON inválido.'
        });
    }

    console.error(err);

    res.status(500).json({
        error: 'Error interno del servidor.'
    });
});

module.exports = app;