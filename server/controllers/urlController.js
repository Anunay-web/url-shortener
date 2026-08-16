const pool = require("../config/db");
const { nanoid } = require("nanoid");

const createShortUrl = async (req, res) => {
  try {
    const { originalUrl, expiresIn } = req.body;

    // validate input
    if (!originalUrl) {
      return res.status(400).json({
        success: false,
        message: "Original URL is required",
      });
    }
    try {
      new URL(originalUrl);
    } catch {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid URL",
      });
    }

    let expiresAt = null;

if (expiresIn !== undefined) {
  if (
    !Number.isInteger(expiresIn) ||
    expiresIn <= 0
  ) {
    return res.status(400).json({
      success: false,
      message: "expiresIn must be a positive integer in minutes",
    });
  }

  expiresAt = new Date(Date.now() + expiresIn * 60 * 1000);
}

    // generate unique short code
    const shortCode = nanoid(6);

    // save URL in PostgreSQL
    const result = await pool.query(
      `INSERT INTO urls (original_url, short_code, expires_at)
       VALUES ($1, $2, $3)
       RETURNING id, original_url, short_code, created_at, expires_at`,
      [originalUrl, shortCode, expiresAt]
    );

    const url = result.rows[0];

    res.status(201).json({
      success: true,
      data: {
        id: url.id,
        originalUrl: url.original_url,
        shortCode: url.short_code,
        shortUrl: `http://localhost:${process.env.PORT}/${url.short_code}`,
        createdAt: url.created_at,
        expiresAt: url.expires_at,
      },
    });
  } catch (error) {
    console.error("Create short URL error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create short URL",
    });
  }
};

module.exports = { createShortUrl };