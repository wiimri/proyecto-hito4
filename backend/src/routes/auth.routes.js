const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../db");
const asyncHandler = require("../utils/async-handler");
const validate = require("../middlewares/validate.middleware");
const { signToken } = require("../utils/token");
const { registerSchema, loginSchema } = require("../schemas/auth.schema");

const router = express.Router();

router.post("/register", validate(registerSchema), asyncHandler(async (request, response) => {
  const { fullName, email, phone, password } = request.body;
  const passwordHash = await bcrypt.hash(password, 10);

  const result = await db.query(
    `INSERT INTO users (full_name, email, phone, password_hash)
     VALUES ($1, $2, $3, $4)
     RETURNING id, full_name AS "fullName", email, phone`,
    [fullName, email, phone || null, passwordHash]
  );

  const user = result.rows[0];
  response.status(201).json({ user, token: signToken(user) });
}));

router.post("/login", validate(loginSchema), asyncHandler(async (request, response) => {
  const { email, password } = request.body;
  const result = await db.query(
    `SELECT id, full_name AS "fullName", email, phone, password_hash AS "passwordHash"
     FROM users
     WHERE email = $1`,
    [email]
  );

  const user = result.rows[0];
  const matches = user ? await bcrypt.compare(password, user.passwordHash) : false;
  if (!matches) {
    return response.status(401).json({ message: "Credenciales invalidas", errors: [] });
  }

  delete user.passwordHash;
  return response.json({ user, token: signToken(user) });
}));

module.exports = router;
