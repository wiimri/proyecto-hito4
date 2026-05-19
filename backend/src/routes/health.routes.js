const express = require("express");

const router = express.Router();

router.get("/", (request, response) => {
  response.json({ status: "ok", service: "mercado-vecino-api-hito4" });
});

module.exports = router;
