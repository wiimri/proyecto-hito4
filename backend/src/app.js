require("dotenv").config();

const express = require("express");
const path = require("path");
const cors = require("cors");

const healthRoutes = require("./routes/health.routes");
const authRoutes = require("./routes/auth.routes");
const categoryRoutes = require("./routes/category.routes");
const userRoutes = require("./routes/user.routes");
const postRoutes = require("./routes/post.routes");
const favoriteRoutes = require("./routes/favorite.routes");
const messageRoutes = require("./routes/message.routes");

const { notFound, errorHandler } = require("./middlewares/error.middleware");

function createApp() {
  const app = express();

  const productionOrigins = [
    "https://proyecto-hito4-frontend.onrender.com",
    "https://proyecto-hito4-front-3.onrender.com",
  ];

  const localOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
  ];

  const configuredOrigins = (process.env.CORS_ORIGIN || "")
    .split(",")
    .map((origin) => origin.trim().replace(/\/+$/, ""))
    .filter(Boolean);

  const allowedOrigins = [
    ...new Set([...productionOrigins, ...localOrigins, ...configuredOrigins]),
  ];

  const corsOptions = {
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.warn(`CORS no permitido para origen: ${origin}`);
      return callback(null, false);
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: false,
    optionsSuccessStatus: 204,
  };

  app.use(cors(corsOptions));
  app.options("*", cors(corsOptions));

  app.use(express.json({ limit: "2mb" }));
  app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

  app.get("/", (request, response) => {
    response.json({
      status: "ok",
      service: "mercado-vecino-api-hito4",
      corsOrigins: allowedOrigins,
      endpoints: [
        "/health",
        "/api/health",
        "/categories",
        "/api/categories",
        "/productos",
        "/api/productos",
        "/posts",
        "/api/posts",
      ],
    });
  });

  const routes = [
    ["/health", healthRoutes],
    ["/auth", authRoutes],
    ["/categories", categoryRoutes],
    ["/users", userRoutes],
    ["/posts", postRoutes],
    ["/favorites", favoriteRoutes],
    ["/messages", messageRoutes],
  ];

  for (const [routePath, router] of routes) {
    app.use(`/api${routePath}`, router);
    app.use(routePath, router);
  }

  app.use("/salud", healthRoutes);
  app.use("/categorias", categoryRoutes);
  app.use("/api/categorias", categoryRoutes);
  app.use("/publicaciones", postRoutes);
  app.use("/api/publicaciones", postRoutes);
  app.use("/productos", postRoutes);
  app.use("/api/productos", postRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
