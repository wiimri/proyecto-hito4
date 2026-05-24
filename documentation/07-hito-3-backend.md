# Hito 3 - Desarrollo Backend

## Objetivo

Implementar una API REST para Mercado Vecino usando Node.js, Express y PostgreSQL. El backend permite autenticar usuarios, consultar publicaciones, crear recursos protegidos con JWT y validar datos antes de llegar a la base de datos.

Esta entrega toma el feedback del Hito 2 y avanza desde datos mockeados hacia persistencia real, autenticacion real y subida de archivos desde el backend.

## Arquitectura del backend

```text
backend/src/
  app.js
  server.js
  db.js
  middlewares/
    auth.middleware.js
    error.middleware.js
    validate.middleware.js
    upload.middleware.js
  routes/
    auth.routes.js
    category.routes.js
    favorite.routes.js
    health.routes.js
    message.routes.js
    post.routes.js
    user.routes.js
  schemas/
    auth.schema.js
    post.schema.js
    user.schema.js
  utils/
    async-handler.js
    token.js
```

## Conexion con PostgreSQL

El archivo `backend/src/db.js` centraliza la conexion a PostgreSQL usando `@neondatabase/serverless`.

- `Pool` administra conexiones.
- `query(text, params)` ejecuta consultas parametrizadas.
- `transaction(callback)` permite crear recursos relacionados con `BEGIN`, `COMMIT` y `ROLLBACK`.

## Autenticacion y JWT

El flujo de autenticacion esta en `backend/src/routes/auth.routes.js`.

1. Registro: recibe nombre, correo, telefono y contrasena.
2. Login: valida credenciales contra la base de datos.
3. Token: `backend/src/utils/token.js` firma un JWT con datos basicos del usuario.
4. Rutas privadas: `auth.middleware.js` exige `Authorization: Bearer token`.

## Middlewares

- `auth.middleware.js`: valida token JWT y agrega `request.user`.
- `validate.middleware.js`: valida body, params o query con Joi antes del controlador.
- `error.middleware.js`: responde errores de forma consistente.
- `upload.middleware.js`: recibe imagenes con Multer, valida tipo de archivo y normaliza rutas para guardarlas en PostgreSQL.
- `notFound`: responde rutas no existentes con 404.

Todos trabajan con `next()` para mantener el flujo de Express.

## Rutas REST

| Recurso | Rutas |
|---|---|
| Health | `GET /api/health` |
| Auth | `POST /api/auth/register`, `POST /api/auth/login` |
| Categories | `GET /api/categories` |
| Posts | `GET /api/posts`, `GET /api/posts/:id`, `POST /api/posts`, `PUT /api/posts/:id`, `DELETE /api/posts/:id` |
| Users | `GET /api/users/me`, `PUT /api/users/me` |
| Favorites | `GET /api/favorites`, `POST /api/favorites`, `DELETE /api/favorites/:postId` |
| Messages | `GET /api/messages`, `POST /api/messages` |

## Continuidad con el client

Aunque el Hito 3 se evalua como backend, el client de continuidad queda preparado para consumir la API:

- `client/src/services/api.js` centraliza llamadas HTTP.
- `MarketplaceContext.jsx` carga categorias y publicaciones desde PostgreSQL a traves de la API.
- Login y registro consumen `/api/auth/login` y `/api/auth/register`.
- Crear y editar publicaciones envia `multipart/form-data` con archivos reales.
- La ruta `*` del client renderiza `NotFound`, cubriendo rutas inexistentes.

Si el backend no esta disponible, el client conserva fallback local para mantener la navegacion del prototipo.

## Base de datos

Los scripts SQL estan en:

```text
documentation/database/schema.sql
documentation/database/seed.sql
```

Tablas principales:

- `users`
- `categories`
- `posts`
- `post_images`
- `favorites`
- `messages`

## Subida de imagenes

Para que el flujo sea similar a un marketplace real, las publicaciones no dependen de URLs pegadas manualmente. El backend acepta archivos mediante `multipart/form-data`.

Rutas con subida:

- `POST /api/posts`
- `PUT /api/posts/:id`

Campo de archivos:

```text
images
```

Configuracion:

- Hasta 6 imagenes por publicacion.
- Maximo 5 MB por imagen.
- Solo archivos `image/*`.
- Almacenamiento local en `backend/uploads/posts`.
- Exposicion publica por `/uploads/posts/nombre-archivo`.

La tabla `post_images` no guarda el binario de la imagen, sino la ruta publica del archivo. Esto evita cargar la base de datos con archivos pesados y mantiene PostgreSQL encargado de los datos relacionales.

## Tests con Supertest

El archivo `backend/tests/api.test.js` valida escenarios de API:

- Health responde 200.
- Categorias responde 200 usando consultas a Neon PostgreSQL.
- Login invalido responde 401.
- Perfil sin token responde 401.
- Publicacion inexistente responde 404.
- Crear publicacion con token y archivo de imagen responde 201.

Comando:

```bash
npm run backend:test
```

## Cumplimiento de rubrica

| Criterio | Implementacion |
|---|---|
| Nuevo proyecto npm con dependencias | `package.json` raiz y `backend/package.json`. |
| Uso de Neon PostgreSQL | `backend/src/db.js`. |
| JWT | `auth.routes.js`, `token.js`, `auth.middleware.js`. |
| CORS | `app.js`. |
| Middlewares | `middlewares/` con validacion, autenticacion y errores. |
| Supertest | `backend/tests/api.test.js`. |
| Integracion con client de continuidad | `client/src/services/api.js` y `MarketplaceContext.jsx` consumen la API real. |

