const express = require("express");
const { redirectToOriginalUrl } = require("../controllers/redirectController");

const router = express.Router();

router.get("/:shortCode", redirectToOriginalUrl);

module.exports = router;