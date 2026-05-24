# Hito 4 - Integracion y despliegue

Esta guia resume el flujo de produccion elegido para la entrega: backend y cliente en Render, base de datos PostgreSQL en Neon.

## 1. Base de datos en Neon

1. Crear una base PostgreSQL en Neon.
2. Copiar la cadena `DATABASE_URL`.
3. Abrir SQL Editor.
4. Ejecutar `documentation/database/schema.sql`.
5. Ejecutar `documentation/database/seed.sql`.
6. Verificar que existan las tablas `users`, `categories`, `posts`, `post_images`, `favorites` y `messages`.

La URL de Neon tiene una forma similar a:

```env
DATABASE_URL=postgresql://USUARIO:PASSWORD@HOST/neondb?sslmode=require&channel_binding=require
```

## 2. Backend en Render

Crear un Web Service:

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

Pruebas despues del deploy:

```text
https://tu-backend-render.onrender.com/api/health
https://tu-backend-render.onrender.com/api/health/db
https://tu-backend-render.onrender.com/api/categories
```

`/api/health/db` ejecuta una consulta real contra Neon y devuelve la version de PostgreSQL.

## 3. Cliente en Render

Crear un Static Site:

```text
Root Directory: client
Build Command: npm install && npm run build
Publish Directory: dist
```

Variable:

```env
VITE_BACKEND_URL=https://tu-backend-render.onrender.com
```

Cuando Render entregue la URL del cliente, copiarla en `CORS_ORIGIN` del backend y redeployar el Web Service.

## 4. Prueba de integracion

Desde la URL publica del cliente:

1. Cargar inicio, publicaciones y detalle.
2. Iniciar sesion con `demo@mercadovecino.cl` y `12345678`.
3. Registrar un usuario nuevo.
4. Crear una publicacion.
5. Recargar la pagina y confirmar que la publicacion persiste.
6. Revisar en Neon que se insertaron registros en `users`, `posts` o `post_images`.

## 5. Evidencia para la rubrica

| Requisito | Evidencia esperada |
|---|---|
| Deploy aplicacion cliente | Static Site de Render cargando sin errores. |
| Deploy aplicacion backend | Web Service de Render respondiendo `/api/health`. |
| Deploy base de datos | Neon con tablas creadas y datos iniciales cargados. |
| Integracion cliente-backend | Login, registro y publicaciones persisten en Neon desde el cliente desplegado. |

