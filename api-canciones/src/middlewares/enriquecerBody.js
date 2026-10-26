function enriquecerBody(req, res, next) {
    if (req.method !== 'POST' && req.method !== 'PUT') {
        return next(); //no modifica el cuerpo ni en get ni en delete, continúa la petición
    }

    if (req.body === null || typeof req.body !== 'object'
        || Array.isArray(req.body)) {
        return res.status(400).json({
            error: 'El cuerpo debe ser un objeto JSON.' 
        }); //Evita intentar limpiar un cuerpo vacío, un array o un valor que no sea un objeto.
    }

    // 1. Limpiar los espacios de los campos de texto.
    for (const campo in req.body) {
        if (typeof req.body[campo] === 'string') {
            req.body[campo] = req.body[campo].trim(); //convierte " Bohemian Rhapsody " en "Bohemian Rhapsody" y "   " en "".
        }
    }

    // 2. Eliminar los metadatos que controla el servidor, aunque el cliente intente enviar un identificador o una fecha inventada, se eliminan antes de llegar a la ruta. 
    delete req.body.id;
    delete req.body.creadoEn;
    delete req.body.actualizadoEn;

    // 3. Añadir las fechas que corresponden a la operación.
    const ahora = new Date().toISOString();

    if (req.method === 'POST') {
        req.body.creadoEn = ahora;
    }

    req.body.actualizadoEn = ahora;

    next();
}

module.exports = enriquecerBody;