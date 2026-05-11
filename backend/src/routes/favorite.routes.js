const express = require("express");
const Joi = require("joi");
const db = require("../db");
const asyncHandler = require("../utils/async-handler");
const auth = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");

const router = express.Router();
const favoriteSchema = Joi.object({ postId: Joi.number().integer().positive().required() });

router.get("/", auth, asyncHandler(async (request, response) => {
  const result = await db.query(
    `SELECT f.id, json_build_object('id', p.id, 'title', p.title, 'price', p.price) AS post
     FROM favorites f
     JOIN posts p ON p.id = f.post_id
     WHERE f.user_id = $1
     ORDER BY f.created_at DESC`,
    [request.user.id]
  );
  response.json(result.rows);
}));

router.post("/", auth, validate(favoriteSchema), asyncHandler(async (request, response) => {
  const result = await db.query(
    `INSERT INTO favorites (user_id, post_id)
     VALUES ($1, $2)
     ON CONFLICT (user_id, post_id) DO UPDATE SET post_id = EXCLUDED.post_id
     RETURNING id, user_id AS "userId", post_id AS "postId"`,
    [request.user.id, request.body.postId]
  );
  response.status(201).json(result.rows[0]);
}));

router.delete("/:postId", auth, asyncHandler(async (request, response) => {
  await db.query("DELETE FROM favorites WHERE user_id = $1 AND post_id = $2", [request.user.id, request.params.postId]);
  response.json({ message: "Favorito eliminado correctamente" });
}));

module.exports = router;
