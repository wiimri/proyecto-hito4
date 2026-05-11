const express = require("express");
const Joi = require("joi");
const db = require("../db");
const asyncHandler = require("../utils/async-handler");
const auth = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");

const router = express.Router();
const messageSchema = Joi.object({
  postId: Joi.number().integer().positive().required(),
  receiverId: Joi.number().integer().positive().required(),
  body: Joi.string().min(1).required(),
});

router.get("/", auth, asyncHandler(async (request, response) => {
  const result = await db.query(
    `SELECT m.id,
      json_build_object('id', p.id, 'title', p.title) AS post,
      json_build_object('id', sender.id, 'fullName', sender.full_name) AS sender,
      json_build_object('id', receiver.id, 'fullName', receiver.full_name) AS receiver,
      m.body,
      m.created_at AS "createdAt"
     FROM messages m
     JOIN posts p ON p.id = m.post_id
     JOIN users sender ON sender.id = m.sender_id
     JOIN users receiver ON receiver.id = m.receiver_id
     WHERE m.sender_id = $1 OR m.receiver_id = $1
     ORDER BY m.created_at DESC`,
    [request.user.id]
  );
  response.json(result.rows);
}));

router.post("/", auth, validate(messageSchema), asyncHandler(async (request, response) => {
  const { postId, receiverId, body } = request.body;
  const result = await db.query(
    `INSERT INTO messages (post_id, sender_id, receiver_id, body)
     VALUES ($1, $2, $3, $4)
     RETURNING id, post_id AS "postId", sender_id AS "senderId", receiver_id AS "receiverId", body, created_at AS "createdAt"`,
    [postId, request.user.id, receiverId, body]
  );
  response.status(201).json(result.rows[0]);
}));

module.exports = router;
