# API REST de canciones

Esta API permite consultar, crear, reemplazar y eliminar canciones. Los datos se guardan en memoria y se restablecen al reiniciar el servidor.

## Convenciones

- **URL base local:** `http://localhost:3000`. El puerto predeterminado es `3000`; se puede cambiar mediante la variable de entorno `PORT`.
- **Formato:** las peticiones y respuestas con contenido utilizan JSON.
- **Cabecera:** en las peticiones `POST` y `PUT`, enviar `Content-Type: application/json`.
- **Fechas:** `creadoEn` y `actualizadoEn` se devuelven como cadenas ISO 8601 en UTC, con milisegundos y sufijo `Z` (por ejemplo, `2026-10-26T19:19:01.307Z`). Las genera el servidor.
- **Texto:** se eliminan los espacios al principio y al final de los valores de texto recibidos.
- **IDs:** son enteros positivos asignados por el servidor. No se envían en el body.
- **Errores:** las respuestas de error tienen un objeto JSON con la propiedad `error`. La eliminación correcta devuelve `204` sin cuerpo.

## Modelo de datos

| Campo | Tipo | Obligatorio | Quién lo proporciona | Descripción |
| --- | --- | --- | --- | --- |
| `id` | entero positivo | Sí en la respuesta | Servidor | Identificador único de la canción. |
| `titulo` | cadena | Sí | Cliente | Título de la canción; no puede quedar vacío tras eliminar espacios. |
| `artista` | cadena | Sí | Cliente | Nombre del artista; no puede quedar vacío tras eliminar espacios. |
| `album` | cadena | No | Cliente | Álbum al que pertenece la canción. |
| `anio` | entero positivo | No | Cliente | Año de publicación. |
| `creadoEn` | cadena ISO 8601 UTC | Sí en la respuesta | Servidor | Fecha y hora de creación. No cambia al actualizar. |
| `actualizadoEn` | cadena ISO 8601 UTC | Sí en la respuesta | Servidor | Fecha y hora de la última creación o actualización. |

El objeto completo devuelto por la API tiene esta forma (los campos opcionales pueden no aparecer):

```json
{
  "id": 1,
  "titulo": "Bohemian Rhapsody",
  "artista": "Queen",
  "album": "A Night at the Opera",
  "anio": 1975,
  "creadoEn": "2026-10-01T10:00:00.000Z",
  "actualizadoEn": "2026-10-01T10:00:00.000Z"
}
```

Al crear o actualizar, enviar `titulo` y `artista`; `album` y `anio` son opcionales. Los campos desconocidos se ignoran. Si se envían `id`, `creadoEn` o `actualizadoEn` en el body, el servidor los descarta y utiliza sus propios valores.

## Errores

El formato general de error es:

```json
{
  "error": "Descripción del error."
}
```

| Código HTTP | Significado | Ejemplo de respuesta |
| --- | --- | --- |
| `400 Bad Request` | ID no válido, body no válido o datos que no cumplen la validación. | `{"error":"El título es obligatorio y debe ser texto."}` |
| `404 Not Found` | La ruta no existe o no hay una canción con el ID solicitado. | `{"error":"No existe una canción con ese id."}` |
| `500 Internal Server Error` | Error interno no previsto. | `{"error":"Error interno del servidor."}` |

Si la ruta completa no corresponde a ningún endpoint, el `404` devuelve `{"error":"La ruta solicitada no existe."}`. El `500` puede producirse en cualquiera de los endpoints si ocurre un error interno.

Otros mensajes posibles para `400` incluyen `El id debe ser un número entero positivo.`, `El cuerpo debe ser un objeto JSON.`, `El cuerpo de la petición contiene JSON inválido.`, `El artista es obligatorio y debe ser texto.`, `El álbum debe ser texto.` y `El año debe ser un número entero positivo.`. Enviar un array, un valor que no sea un objeto o un body vacío en una operación con body también produce `400`.

## Resumen de endpoints

| Método | Ruta | Descripción | Respuesta correcta |
| --- | --- | --- | --- |
| `GET` | `/api/canciones` | Lista todas las canciones. | `200 OK` |
| `GET` | `/api/canciones/:id` | Consulta una canción por ID. | `200 OK` |
| `POST` | `/api/canciones` | Crea una canción. | `201 Created` |
| `PUT` | `/api/canciones/:id` | Reemplaza los datos editables de una canción. | `200 OK` |
| `DELETE` | `/api/canciones/:id` | Elimina una canción. | `204 No Content` |

## Fichas de endpoints

### Listar canciones

**Método y ruta:** `GET /api/canciones`

**Parámetros:** ninguno.

**Body:** no se envía.

**Respuestas:**

- `200 OK`: array de canciones. Si no hay canciones, se devuelve `[]`.

```json
[
  {
    "id": 1,
    "titulo": "Bohemian Rhapsody",
    "artista": "Queen",
    "album": "A Night at the Opera",
    "anio": 1975,
    "creadoEn": "2026-10-01T10:00:00.000Z",
    "actualizadoEn": "2026-10-01T10:00:00.000Z"
  }
]
```

**Ejemplo de llamada:**

```bash
curl http://localhost:3000/api/canciones
```

### Consultar una canción

**Método y ruta:** `GET /api/canciones/:id`

**Parámetros:** `id` en la ruta; debe ser un entero positivo.

**Body:** no se envía.

**Respuestas:**

- `200 OK`: objeto de la canción encontrada.
- `400 Bad Request`: `{"error":"El id debe ser un número entero positivo."}`
- `404 Not Found`: `{"error":"No existe una canción con ese id."}`

Ejemplo de respuesta `200`:

```json
{
  "id": 1,
  "titulo": "Bohemian Rhapsody",
  "artista": "Queen",
  "album": "A Night at the Opera",
  "anio": 1975,
  "creadoEn": "2026-10-01T10:00:00.000Z",
  "actualizadoEn": "2026-10-01T10:00:00.000Z"
}
```

**Ejemplo de llamada:**

```bash
curl http://localhost:3000/api/canciones/1
```

### Crear una canción

**Método y ruta:** `POST /api/canciones`

**Parámetros:** ninguno.

**Body:** objeto JSON. `titulo` y `artista` son obligatorios; `album` y `anio` son opcionales.

```json
{
  "titulo": "Imagine",
  "artista": "John Lennon",
  "album": "Imagine",
  "anio": 1971
}
```

**Respuestas:**

- `201 Created`: objeto creado, incluyendo el ID y las fechas asignadas por el servidor.
- `400 Bad Request`: body inválido o datos que no cumplen la validación; por ejemplo, `{"error":"El título es obligatorio y debe ser texto."}`.

Ejemplo de respuesta `201`:

```json
{
  "id": 3,
  "titulo": "Imagine",
  "artista": "John Lennon",
  "album": "Imagine",
  "anio": 1971,
  "creadoEn": "2026-10-26T19:19:01.307Z",
  "actualizadoEn": "2026-10-26T19:19:01.307Z"
}
```

**Ejemplo de llamada:**

```bash
curl -X POST http://localhost:3000/api/canciones \
  -H "Content-Type: application/json" \
  -d "{\"titulo\":\"Imagine\",\"artista\":\"John Lennon\",\"album\":\"Imagine\",\"anio\":1971}"
```

### Actualizar una canción

**Método y ruta:** `PUT /api/canciones/:id`

**Parámetros:** `id` en la ruta; debe ser un entero positivo.

**Body:** objeto JSON con los mismos campos editables que `POST`. `titulo` y `artista` son obligatorios también en la actualización. `PUT` reemplaza los datos editables; si se omiten `album` o `anio`, no aparecerán en el recurso actualizado.

```json
{
  "titulo": "Imagine (Remastered)",
  "artista": "John Lennon",
  "album": "Imagine",
  "anio": 1971
}
```

**Respuestas:**

- `200 OK`: objeto actualizado; conserva `id` y `creadoEn`, y recibe un nuevo `actualizadoEn`.
- `400 Bad Request`: ID, body o datos inválidos; por ejemplo, `{"error":"El año debe ser un número entero positivo."}`.
- `404 Not Found`: `{"error":"No existe una canción con ese id."}`

Ejemplo de respuesta `200`:

```json
{
  "id": 1,
  "titulo": "Imagine (Remastered)",
  "artista": "John Lennon",
  "album": "Imagine",
  "anio": 1971,
  "creadoEn": "2026-10-01T10:00:00.000Z",
  "actualizadoEn": "2026-10-26T19:19:01.307Z"
}
```

**Ejemplo de llamada:**

```bash
curl -X PUT http://localhost:3000/api/canciones/1 \
  -H "Content-Type: application/json" \
  -d "{\"titulo\":\"Imagine (Remastered)\",\"artista\":\"John Lennon\",\"album\":\"Imagine\",\"anio\":1971}"
```

### Eliminar una canción

**Método y ruta:** `DELETE /api/canciones/:id`

**Parámetros:** `id` en la ruta; debe ser un entero positivo.

**Body:** no se envía.

**Respuestas:**

- `204 No Content`: canción eliminada correctamente; la respuesta no tiene body.
- `400 Bad Request`: `{"error":"El id debe ser un número entero positivo."}`
- `404 Not Found`: `{"error":"No existe una canción con ese id."}`

**Ejemplo de llamada:**

```bash
curl -i -X DELETE http://localhost:3000/api/canciones/1
```
