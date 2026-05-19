# Hito 4 - Integracion y despliegue

Este documento deja el proyecto listo para cumplir la rubrica del Hito 4: cliente desplegado, backend desplegado, base de datos desplegada e integracion real en produccion.

## 1. Base de datos en produccion

Opcion recomendada: crear una base PostgreSQL en Render junto al backend.

1. Crear el servicio PostgreSQL.
2. Guardar la `DATABASE_URL` que entrega la plataforma.
3. Abrir la consola SQL del servicio.
4. Ejecutar primero `database/schema.sql`.
5. Ejecutar despues `database/seed.sql`.
6. Confirmar que existen las tablas `users`, `categories`, `posts`, `post_images`, `favorites` y `messages`.

Si usas Neon, Supabase u otro PostgreSQL externo que exige SSL, configura tambien:

```env
DATABASE_SSL=true
DATABASE_SSL_REJECT_UNAUTHORIZED=false
```

## 2. Backend en Render

El backend esta preparado con `render.yaml`.

Configuracion manual equivalente:

```text
Root Directory: backend
Build Command: npm install
Start Command: npm start
Health Check Path: /api/health
```

Variables de entorno:

```env
NODE_ENV=production
DATABASE_URL=postgres://...
DATABASE_SSL=false
DATABASE_SSL_REJECT_UNAUTHORIZED=false
JWT_SECRET=una_clave_larga_y_secreta
CORS_ORIGIN=https://tu-sitio.netlify.app
```

Pruebas despues del deploy:

```text
https://tu-api.onrender.com/api/health
https://tu-api.onrender.com/api/categories
https://tu-api.onrender.com/api/posts
```

## 3. Frontend en Netlify

El frontend esta preparado con `netlify.toml` en la raiz del proyecto.

Configuracion manual equivalente:

```text
Base directory: frontend
Build command: npm run build
Publish directory: dist
```

Variable de entorno:

```env
VITE_API_URL=https://tu-api.onrender.com/api
```

El archivo `netlify.toml` incluye el redirect a `index.html`, necesario para que React Router funcione al recargar rutas internas como `/login`, `/perfil` o `/publicar`.

## 4. Prueba de integracion para la entrega

Antes de entregar el link del cliente, prueba estos flujos desde la URL de Netlify:

1. Cargar home, galeria y detalle de publicaciones.
2. Iniciar sesion con `demo@mercadovecino.cl` y contrasena `12345678`.
3. Registrar un usuario nuevo.
4. Crear una publicacion.
5. Recargar la pagina y confirmar que la publicacion sigue apareciendo.
6. Revisar en la base productiva que el registro quedo guardado en `posts` y sus imagenes en `post_images`.

## 5. Evidencia para la rubrica

| Requisito | Evidencia esperada |
|---|---|
| Deploy aplicacion cliente | URL publica de Netlify cargando sin errores de assets. |
| Deploy aplicacion backend | URL publica de Render respondiendo `/api/health`. |
| Deploy base de datos | Tablas creadas con `schema.sql` y datos iniciales con `seed.sql`. |
| Integracion cliente-backend | El frontend usa `VITE_API_URL`, el backend permite el origen de Netlify con `CORS_ORIGIN` y las acciones persisten en PostgreSQL. |
