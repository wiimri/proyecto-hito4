# Mercado Vecino - Hito 4 Integracion y despliegue

Marketplace desarrollado para el Hito 4 de Desafio Latam. Esta version esta organizada para desplegar el backend y el cliente en Render, usando Neon como PostgreSQL online.

## Estructura

```text
marketplace-hito4/
  backend/          API REST con Express, JWT, CORS, Multer y Neon PostgreSQL
  client/           Aplicacion React con Vite
  documentation/    Documentacion, schema.sql y seed.sql
  README.md
```

## Tecnologias

- Node.js y npm
- Express
- Neon PostgreSQL con `pg` para la API y `@neondatabase/serverless` para diagnostico de conexion
- JWT con `jsonwebtoken`
- bcryptjs
- CORS
- Joi
- Multer
- Jest y Supertest
- React, Vite, React Router y AnimeJS
- Render para despliegue

## Variables de entorno

Backend (`backend/.env` en local o Environment Variables en Render):

```env
PORT=3000
NODE_ENV=production
DATABASE_URL=postgresql://USUARIO:PASSWORD@HOST/neondb?sslmode=require&channel_binding=require
JWT_SECRET=una_clave_larga_y_segura
CORS_ORIGIN=https://tu-cliente-render.onrender.com
```

Cliente (`client/.env` en local o Environment Variables en Render Static Site):

```env
VITE_BACKEND_URL=https://tu-backend-render.onrender.com
```

No se suben credenciales reales al repositorio. Usa `.env.example` como plantilla.

## Base de datos Neon

En la consola SQL de Neon ejecuta, en este orden:

```text
documentation/database/schema.sql
documentation/database/seed.sql
```

El seed crea una cuenta demo:

```text
Email: demo@mercadovecino.cl
Contrasena: 12345678
```

## Ejecutar en local

Instalar dependencias:

```bash
npm install
npm install --prefix backend
npm install --prefix client
```

Backend:

```bash
npm run backend:dev
```

Cliente:

```bash
npm run client
```

URLs locales:

```text
Backend: http://localhost:3000/api/health
Cliente: http://localhost:5173
```

Tambien puedes levantar ambos servicios desde la raiz:

```bash
npm start
```

Ese comando arranca el backend en `http://localhost:3000` y el cliente en `http://localhost:5173`. Si levantas solo el cliente, login y registro mostraran `Failed to fetch` porque la API no estara escuchando en el puerto 3000.

## Deploy en Render

### Backend

Crear un Web Service desde este repositorio:

```text
Root Directory: backend
Build Command: npm install
Start Command: npm start
```

Variables:

```env
NODE_ENV=production
DATABASE_URL=postgresql://...
JWT_SECRET=una_clave_larga_y_segura
CORS_ORIGIN=https://tu-cliente-render.onrender.com
```

Pruebas:

```text
https://tu-backend-render.onrender.com/api/health
https://tu-backend-render.onrender.com/api/health/db
https://tu-backend-render.onrender.com/api/categories
```

### Cliente

Crear un Static Site desde este repositorio:

```text
Root Directory: client
Build Command: npm install && npm run build
Publish Directory: dist
```

Variable:

```env
VITE_BACKEND_URL=https://tu-backend-render.onrender.com
```

Cuando Render entregue la URL del cliente, vuelve al backend y actualiza `CORS_ORIGIN` con esa URL.

## Endpoints principales

| Metodo | Ruta | Protegida | Descripcion |
|---|---|---|---|
| GET | `/api/health` | No | Estado de la API |
| GET | `/api/health/db` | No | Verifica conexion con Neon y muestra version de PostgreSQL |
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

## Validacion

```bash
npm run backend:test
npm run client:build
```

## Rubrica Hito 4

| Requisito | Evidencia |
|---|---|
| Deploy aplicacion cliente | Static Site de Render desde `client/`. |
| Deploy aplicacion backend | Web Service de Render desde `backend/`. |
| Deploy base de datos | Neon PostgreSQL con `schema.sql` y `seed.sql`. |
| Integracion cliente-backend | `VITE_API_URL`, `CORS_ORIGIN`, JWT y persistencia en Neon. |
