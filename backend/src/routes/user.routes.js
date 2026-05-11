const express = require("express");
const db = require("../db");
const asyncHandler = require("../utils/async-handler");
const auth = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const { profileSchema } = require("../schemas/user.schema");

const router = express.Router();

router.get("/me", auth, asyncHandler(async (request, response) => {
  const result = await db.query(
    `SELECT u.id, u.full_name AS "fullName", u.email, u.phone, u.avatar_url AS "avatarUrl",
      COUNT(p.id)::int AS "activePosts"
     FROM users u
     LEFT JOIN posts p ON p.user_id = u.id AND p.status = 'active'
     WHERE u.id = $1
     GROUP BY u.id`,
    [request.user.id]
  );

  const user = result.rows[0];
  if (!user) return response.status(404).json({ message: "Usuario no encontrado", errors: [] });
  return response.json({ ...user, stats: { activePosts: user.activePosts } });
}));

router.put("/me", auth, validate(profileSchema), asyncHandler(async (request, response) => {
  const { fullName, phone, avatarUrl } = request.body;
  const result = await db.query(
    `UPDATE users
     SET full_name = $1, phone = $2, avatar_url = $3, updated_at = CURRENT_TIMESTAMP
     WHERE id = $4
     RETURNING id, full_name AS "fullName", email, phone, avatar_url AS "avatarUrl"`,
    [fullName, phone || null, avatarUrl || null, request.user.id]
  );

  response.json(result.rows[0]);
}));

module.exports = router;
