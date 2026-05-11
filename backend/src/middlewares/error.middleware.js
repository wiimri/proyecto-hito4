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

  response.status(error.status || 500).json({
    message: error.message || "Error interno del servidor",
    errors: error.errors || [],
  });
}

module.exports = {
  notFound,
  errorHandler,
};
