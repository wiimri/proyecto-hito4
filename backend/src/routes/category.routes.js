const express = require("express");
const db = require("../db");
const asyncHandler = require("../utils/async-handler");

const router = express.Router();

router.get("/", asyncHandler(async (request, response) => {
  const result = await db.query("SELECT id, name, description FROM categories ORDER BY name ASC");
  response.json(result.rows);
}));

module.exports = router;
