# 03 - Dependencias a utilizar

## client

| Dependencia | Uso |
| --- | --- |
| React | Construccion de interfaz por componentes. |
| Vite | Servidor de desarrollo y empaquetado rapido. |
| React Router DOM | Navegacion entre vistas publicas y privadas. |
| Axios | Consumo de API REST desde el client. |
| Bootstrap o Tailwind CSS | Framework CSS para acelerar layout responsivo. |
| React Hook Form | Manejo y validacion de formularios. |
| SweetAlert2 | Alertas de exito, error y confirmacion. |

## Backend

| Dependencia | Uso |
| --- | --- |
| Node.js | Entorno de ejecucion JavaScript. |
| Express | Creacion de API REST. |
| @neondatabase/serverless | Conexion serverless con Neon PostgreSQL. |
| cors | Permitir consumo desde client. |
| dotenv | Manejo de variables de entorno. |
| bcryptjs | Encriptacion de contrasenas. |
| jsonwebtoken | Autenticacion con JWT. |
| multer | Recepcion de imagenes de publicaciones. |
| joi | Validacion de datos request. |
| nodemon | Reinicio automatico en desarrollo. |

## Base de datos

| Dependencia | Uso |
| --- | --- |
| PostgreSQL | Base de datos relacional principal. |
| pgAdmin o DBeaver | Administracion visual de tablas, relaciones y consultas. |

## Dependencias usadas por este prototipo entregable

El client incluido en `client/` esta hecho con HTML, CSS y JavaScript puro para que pueda abrirse sin instalacion. El backend en `backend/` deja preparada la estructura Express y sus dependencias en `package.json`.

