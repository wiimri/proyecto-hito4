const { verifyToken } = require("../utils/token");

function authMiddleware(request, response, next) {
  const header = request.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return response.status(401).json({
      message: "Token requerido",
      errors: [],
    });
  }

  try {
    request.user = verifyToken(token);
    return next();
  } catch (error) {
    return response.status(401).json({
      message: "Token invalido",
      errors: [],
    });
  }
}

module.exports = authMiddleware;
