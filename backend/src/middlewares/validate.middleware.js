function validate(schema, source = "body") {
  return (request, response, next) => {
    const result = schema.validate(request[source], {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    if (result.error) {
      return response.status(400).json({
        message: "Datos invalidos",
        errors: result.error.details.map((detail) => detail.message),
      });
    }

    request[source] = result.value;
    return next();
  };
}

module.exports = validate;
