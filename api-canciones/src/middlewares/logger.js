function logger(req, res, next) {
    const fecha = new Date().toISOString();

    console.log(
        `[${fecha}] ${req.method} ${req.originalUrl}` //[2026-10-26T18:30:00.000Z] GET /api/canciones
    );

    next();
}

module.exports = logger;