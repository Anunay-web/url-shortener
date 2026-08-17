const express = require("express");
const { createShortUrl, getUrlStats  } = require("../controllers/urlController");

const router = express.Router();

router.post("/", createShortUrl);

router.get("/:shortCode/stats", getUrlStats);

module.exports = router;