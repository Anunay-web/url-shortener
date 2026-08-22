const express = require("express");
const { createShortUrl, getUrlStats, deleteUrl, getAllUrls  } = require("../controllers/urlController");
const authenticate = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authenticate, createShortUrl);

router.get("/", getAllUrls);

router.get("/:shortCode/stats", getUrlStats);

router.delete("/:shortCode", deleteUrl);

module.exports = router;