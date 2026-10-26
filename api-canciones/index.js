require('dotenv').config(); //lee las variables del archivo dotenv

const app = require('./src/app'); //importa la aplicación Express

const PORT = process.env.PORT || 3000; //obtiene el puerto configurado, la alternativa || es por si el puerto no está definido

app.listen(PORT, () => { //inicia el server
    console.log(`Servidor escuchando en http://localhost:${PORT}`); //se ejecuta cuando el server empieza a escuchar
});