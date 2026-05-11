const jwt = require("jsonwebtoken");

const jwtSecret = process.env.JWT_SECRET || "dev_secret_change_me";

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, fullName: user.fullName },
    jwtSecret,
    { expiresIn: "8h" }
  );
}

function verifyToken(token) {
  return jwt.verify(token, jwtSecret);
}

module.exports = {
  signToken,
  verifyToken,
};
