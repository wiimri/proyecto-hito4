# Mercado Vecino - Hito 3 Desarrollo Backend

Marketplace local desarrollado como entrega del Hito 3 de Desafio Latam. El foco principal de esta version es el backend: API REST con Express, PostgreSQL mediante `pg`, autenticacion JWT, middlewares, CORS y pruebas automatizadas con Supertest.

El frontend React del Hito 2 se mantiene como continuidad visual del proyecto, pero la evaluacion de este hito se concentra en la API y su conexion con base de datos. En esta version el frontend complementario ya puede consumir el backend real cuando esta disponible.

## Tecnologias principales

- Node.js y npm
- Express
- PostgreSQL
- pg
- JWT con jsonwebtoken
- bcryptjs para contrasenas
- CORS
- Joi para validacion de entrada
- Multer para subida de imagenes
- Supertest y Jest para tests
- React, Vite, React Router y AnimeJS como frontend de continuidad

## Mejoras aplicadas desde el feedback del Hito 2

El feedback del Hito 2 recomendaba preparar el proyecto para una integracion completa con backend real, mejorar modularizacion y contemplar rutas no existentes. En el Hito 3 se aplicaron estas mejoras:

- Los datos principales pasan a persistirse en PostgreSQL mediante una API REST.
- El frontend complementario consume categorias y publicaciones desde `http://localhost:3000/api`.
- Login y registro usan JWT real emitido por el backend.
- Crear y editar publicaciones usa `multipart/form-data` para subir imagenes reales.
- Se mantiene fallback local solo para que el frontend no quede inutilizable si el backend esta apagado.
- La ruta fallback `*` renderiza una pagina 404 con `NotFound`.
- La logica backend se separa en rutas, middlewares, schemas, utilidades y tests.

## Credenciales demo

El archivo `database/seed.sql` crea una cuenta lista para autenticar:

```text
Email: demo@mercadovecino.cl
Contrasena: 12345678
```

## Estructura del proyecto

```text
marketplace-hito3/
  backend/
    package.json
    .env.example
    src/
      app.js
      server.js
      db.js
      middlewares/
      routes/
      schemas/
      utils/
    tests/
      api.test.js
  database/
    schema.sql
    seed.sql
  frontend/
    index.html
    package.json
    public/assets/
    src/
      services/api.js
  docs/
    01-boceto-vistas.md
    02-navegacion.md
    03-dependencias.md
    04-base-datos.md
    05-contrato-api.md
    06-hito-2-frontend.md
    07-hito-3-backend.md
  package.json
  README.md
```

## Instalacion

Desde la raiz del proyecto:

```bash
npm install
npm install --prefix backend
npm install --prefix frontend
```

Las dependencias importantes del backend quedan declaradas en `backend/package.json`, incluyendo:

```bash
pg
jsonwebtoken
cors
multer
supertest
jest
```

## Configurar PostgreSQL

En pgAdmin crea una base de datos llamada:

```text
marketplace_hito3
```

Luego abre Query Tool sobre esa base y ejecuta, en este orden:

```text
database/schema.sql
database/seed.sql
```

Despues crea un archivo `backend/.env` usando `backend/.env.example` como referencia:

```env
PORT=3000
DATABASE_URL=postgres://postgres:TU_PASSWORD@localhost:5432/marketplace_hito3
JWT_SECRET=mercado_vecino_hito3_desarrollo
```

Reemplaza `TU_PASSWORD` por tu clave real de PostgreSQL.

## Ejecutar backend

Desde la raiz:

```bash
npm run backend:dev
```

O directamente:

```bash
cd backend
npm run dev
```

Luego prueba:

```text
http://localhost:3000/api/health
http://localhost:3000/api/categories
http://localhost:3000/api/posts
```

## Ejecutar frontend

Desde la raiz:

```bash
npm start
```

Luego abre:

```text
http://localhost:5173
```

Si el backend esta encendido, el frontend usa la API real. Si no esta encendido, mantiene datos locales de respaldo para seguir navegando como prototipo.

## Tests

Desde la raiz:

```bash
npm run backend:test
```

Los tests usan Jest y Supertest. Cubren rutas publicas, rutas protegidas, escenarios correctos y errores HTTP.

## Endpoints principales

| Metodo | Ruta | Protegida | Descripcion |
|---|---|---|---|
| GET | `/api/health` | No | Estado de la API |
| POST | `/api/auth/register` | No | Registro de usuario |
| POST | `/api/auth/login` | No | Login y generacion de JWT |
| GET | `/api/categories` | No | Listado de categorias |
| GET | `/api/posts` | No | Listado paginado y filtrable |
| GET | `/api/posts/:id` | No | Detalle de publicacion |
| POST | `/api/posts` | Si | Crear publicacion |
| PUT | `/api/posts/:id` | Si | Editar publicacion propia |
| DELETE | `/api/posts/:id` | Si | Eliminar publicacion propia |
| GET | `/api/users/me` | Si | Perfil del usuario autenticado |
| PUT | `/api/users/me` | Si | Actualizar perfil |
| GET | `/api/favorites` | Si | Favoritos del usuario |
| POST | `/api/favorites` | Si | Agregar favorito |
| DELETE | `/api/favorites/:postId` | Si | Quitar favorito |
| GET | `/api/messages` | Si | Mensajes recibidos |
| POST | `/api/messages` | Si | Enviar mensaje |

## Ejemplo de login

```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "demo@mercadovecino.cl",
  "password": "12345678"
}
```

La respuesta incluye un `token`. Para rutas privadas se usa asi:

```http
Authorization: Bearer TU_TOKEN
```

## Subida real de imagenes

Las publicaciones pueden crearse con archivos reales, no solo con URLs. El backend recibe `multipart/form-data` en `POST /api/posts` y `PUT /api/posts/:id`.

Campo de archivos:

```text
images
```

Limites configurados:

```text
Maximo 6 imagenes por publicacion
Maximo 5 MB por imagen
Solo archivos con mimetype image/*
```

Las imagenes se guardan localmente en:

```text
backend/uploads/posts/
```

Y quedan disponibles publicamente desde:

```text
http://localhost:3000/uploads/posts/NOMBRE_ARCHIVO
```

Ejemplo en Thunder Client o Postman:

```http
POST http://localhost:3000/api/posts
Authorization: Bearer TU_TOKEN
Content-Type: multipart/form-data

categoryId: 1
title: Notebook Lenovo 14 pulgadas
description: Equipo ideal para estudio y trabajo remoto.
price: 320000
condition: Usado - bueno
commune: Santiago
images: archivo notebook.png
```

Desde el frontend complementario, el formulario de crear/editar publicacion envia estos archivos usando `FormData`, por lo que el flujo ya no depende solamente de URLs manuales.

## Cumplimiento rubrica Hito 3

| Criterio | Evidencia |
|---|---|
| Crear proyecto npm e instalar dependencias | `package.json`, `backend/package.json`, scripts de instalacion y dependencias declaradas. |
| Utilizar paquete pg | `backend/src/db.js` usa `Pool`, `query` y transacciones con PostgreSQL. |
| Autenticacion/autorizacion con JWT | `backend/src/routes/auth.routes.js`, `backend/src/utils/token.js` y middleware `auth.middleware.js`. |
| Usar CORS | `backend/src/app.js` aplica `app.use(cors())`. |
| Middlewares con next | `auth.middleware.js`, `validate.middleware.js` y `error.middleware.js` separan responsabilidades y usan `next()`. |
| Tests con Supertest | `backend/tests/api.test.js` prueba mas de 4 rutas con estados 200, 201, 401 y 404. |
| Subida de archivos para publicaciones | `upload.middleware.js` usa Multer, guarda archivos en `backend/uploads/posts` y registra rutas en `post_images`. |

## Notas de entrega

La carpeta esta preparada para abrirse en Visual Studio Code. Para la entrega del Hito 3, la evidencia principal esta en `backend/`, `database/`, `backend/tests/`, este `README.md` y `docs/07-hito-3-backend.md`.
