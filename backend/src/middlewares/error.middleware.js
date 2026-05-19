function notFound(request, response) {
  response.status(404).json({
    message: "Ruta no encontrada",
    errors: [],
  });
}

function errorHandler(error, request, response, next) {
  console.error(error);

  if (error.code === "23505") {
    return response.status(409).json({
      message: "El registro ya existe",
      errors: [],
    });
  }

  if (error.code === "42P01") {
    return response.status(500).json({
      message: "La base de datos no tiene las tablas creadas. Ejecuta database/schema.sql y luego database/seed.sql.",
      errors: [],
    });
  }

  if (["ECONNREFUSED", "ENOTFOUND", "ETIMEDOUT"].includes(error.code)) {
    return response.status(500).json({
      message: "No se pudo conectar a PostgreSQL. Revisa DATABASE_URL en las variables de entorno de Netlify.",
      errors: [],
    });
  }

  if (["28P01", "28000"].includes(error.code)) {
    return response.status(500).json({
      message: "PostgreSQL rechazo las credenciales. Revisa usuario y password en DATABASE_URL.",
      errors: [],
    });
  }

  response.status(error.status || 500).json({
    message: error.message || "Error interno del servidor",
    errors: error.errors || [],
  });
}

module.exports = {
  notFound,
  errorHandler,
};
