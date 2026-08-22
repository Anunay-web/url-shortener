const express = require("express");
const { createShortUrl, getUrlStats, deleteUrl, getAllUrls  } = require("../controllers/urlController");
const authenticate = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authenticate, createShortUrl);

router.get("/", authenticate, getAllUrls);

router.get("/:shortCode/stats", authenticate, getUrlStats);

router.delete("/:shortCode", authenticate, deleteUrl);

module.exports = router;