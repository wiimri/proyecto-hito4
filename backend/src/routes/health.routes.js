const express = require("express");
const db = require("../db");
const asyncHandler = require("../utils/async-handler");

const router = express.Router();

router.get("/", (request, response) => {
  response.json({ status: "ok", service: "mercado-vecino-api-hito4" });
});

router.get("/db", asyncHandler(async (request, response) => {
  const result = await db.query("SELECT current_database() AS database, NOW() AS checked_at");
  const version = await db.getDatabaseVersion();

  response.json({
    status: "ok",
    database: result.rows[0].database,
    version,
    checkedAt: result.rows[0].checked_at,
  });
}));

module.exports = router;
