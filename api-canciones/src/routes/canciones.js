
const express = require('express');

// Creamos un router para agrupar las rutas de canciones.
const router = express.Router();

// Array que actúa como base de datos temporal.
// Los datos se perderán cuando reiniciemos el servidor.
let canciones = [
    {
        id: 1,
        titulo: 'Bohemian Rhapsody',
        artista: 'Queen',
        album: 'A Night at the Opera',
        anio: 1975,
        creadoEn: '2026-10-01T10:00:00.000Z',
        actualizadoEn: '2026-10-01T10:00:00.000Z'
    },
    {
        id: 2,
        titulo: 'Billie Jean',
        artista: 'Michael Jackson',
        album: 'Thriller',
        anio: 1982,
        creadoEn: '2026-10-02T10:00:00.000Z',
        actualizadoEn: '2026-10-02T10:00:00.000Z'
    }
];

// Próximo ID disponible para las canciones nuevas.
let siguienteId = 3;

// Comprueba que los datos enviados por el cliente sean válidos.
// Devuelve un mensaje si hay un error o null si todo está correcto.
function validarCancion(body) {

    // El título debe ser un texto no vacío.
    if (
        typeof body.titulo !== 'string' ||
        body.titulo.length === 0
    ) {
        return 'El título es obligatorio y debe ser texto.';
    }

    // El artista también es obligatorio.
    if (
        typeof body.artista !== 'string' ||
        body.artista.length === 0
    ) {
        return 'El artista es obligatorio y debe ser texto.';
    }

    // El álbum es opcional, pero si se envía debe ser texto.
    if (
        body.album !== undefined &&
        typeof body.album !== 'string'
    ) {
        return 'El álbum debe ser texto.';
    }

    // El año es opcional, pero debe ser un entero positivo.
    if (
        body.anio !== undefined &&
        (!Number.isInteger(body.anio) || body.anio < 1)
    ) {
        return 'El año debe ser un número entero positivo.';
    }

    // No se ha encontrado ningún error.
    return null;
}

// ==================================================
// GET /api/canciones
// Devuelve todas las canciones.
// ==================================================
router.get('/', (req, res) => {

    // Respondemos con HTTP 200 y el array en formato JSON.
    res.status(200).json(canciones);
});

// ==================================================
// GET /api/canciones/:id
// Devuelve una canción concreta.
// ==================================================
router.get('/:id', (req, res) => {

    // El ID de la URL llega como texto; lo convertimos a número.
    const id = Number(req.params.id);

    // Comprobamos que sea un entero positivo.
    if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({
            error: 'El id debe ser un número entero positivo.'
        });
    }

    // find() devuelve la canción cuyo ID coincide.
    // Si no la encuentra, devuelve undefined.
    const cancion = canciones.find(c => c.id === id);

    // Si no existe la canción, respondemos con 404.
    if (!cancion) {
        return res.status(404).json({
            error: 'No existe una canción con ese id.'
        });
    }

    // Si existe, devolvemos el objeto encontrado.
    res.status(200).json(cancion);
});

// ==================================================
// POST /api/canciones
// Crea una canción nueva.
// ==================================================
router.post('/', (req, res) => {

    // Validamos el body que ya ha preparado el middleware.
    const error = validarCancion(req.body);

    // Si hay errores, respondemos con 400 y no creamos nada.
    if (error) {
        return res.status(400).json({ error });
    }

    // Creamos el objeto con los campos permitidos.
    const nuevaCancion = {
        // El servidor asigna el ID y aumenta el contador.
        id: siguienteId++,

        // Campos obligatorios enviados por el cliente.
        titulo: req.body.titulo,
        artista: req.body.artista,

        // Añadimos el álbum solo si se ha enviado.
        ...(req.body.album !== undefined && {
            album: req.body.album
        }),

        // Añadimos el año solo si se ha enviado.
        ...(req.body.anio !== undefined && {
            anio: req.body.anio
        }),

        // Estas fechas las añade enriquecerBody.
        creadoEn: req.body.creadoEn,
        actualizadoEn: req.body.actualizadoEn
    };

    // Guardamos la nueva canción en el array.
    canciones.push(nuevaCancion);

    // HTTP 201 indica que se ha creado un recurso.
    // Devolvemos el objeto creado, incluido su ID.
    res.status(201).json(nuevaCancion);
});

// ==================================================
// PUT /api/canciones/:id
// Sustituye los datos editables de una canción.
// ==================================================
router.put('/:id', (req, res) => {

    // Convertimos el ID recibido en la URL a número.
    const id = Number(req.params.id);

    // Si el ID es inválido, respondemos con 400.
    if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({
            error: 'El id debe ser un número entero positivo.'
        });
    }

    // findIndex() devuelve la posición de la canción.
    // Devuelve -1 cuando no existe.
    const indice = canciones.findIndex(c => c.id === id);

    // Comprobamos que la canción exista.
    if (indice === -1) {
        return res.status(404).json({
            error: 'No existe una canción con ese id.'
        });
    }

    // Validamos los nuevos datos antes de modificar el array.
    const error = validarCancion(req.body);

    if (error) {
        return res.status(400).json({ error });
    }

    // Guardamos la canción original para conservar sus metadatos.
    const cancionAnterior = canciones[indice];

    // Construimos el objeto actualizado.
    const cancionActualizada = {
        // El ID original no cambia.
        id: cancionAnterior.id,

        // Nuevos datos enviados por el cliente.
        titulo: req.body.titulo,
        artista: req.body.artista,

        // Los campos opcionales se incluyen si se han enviado.
        ...(req.body.album !== undefined && {
            album: req.body.album
        }),

        ...(req.body.anio !== undefined && {
            anio: req.body.anio
        }),

        // Conservamos la fecha de creación original.
        creadoEn: cancionAnterior.creadoEn,

        // La fecha de actualización la genera el middleware.
        actualizadoEn: req.body.actualizadoEn
    };

    // Sustituimos la canción antigua por la nueva.
    canciones[indice] = cancionActualizada;

    // HTTP 200 indica que la actualización ha funcionado.
    res.status(200).json(cancionActualizada);
});

// ==================================================
// DELETE /api/canciones/:id
// Elimina una canción.
// ==================================================
router.delete('/:id', (req, res) => {

    // Convertimos el ID de la URL a número.
    const id = Number(req.params.id);

    // Comprobamos que el ID sea válido.
    if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({
            error: 'El id debe ser un número entero positivo.'
        });
    }

    // Buscamos la posición de la canción.
    const indice = canciones.findIndex(c => c.id === id);

    // Si no existe, devolvemos un error 404.
    if (indice === -1) {
        return res.status(404).json({
            error: 'No existe una canción con ese id.'
        });
    }

    // Eliminamos un elemento del array en esa posición.
    canciones.splice(indice, 1);

    // HTTP 204 indica que se ha eliminado correctamente.
    // No enviamos ningún cuerpo en la respuesta.
    res.status(204).send();
});

// Exportamos el router para utilizarlo desde app.js.
module.exports = router;
