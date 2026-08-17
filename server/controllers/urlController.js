const pool = require("../config/db");
const { nanoid } = require("nanoid");

const createShortUrl = async (req, res) => {
  try {
    const { originalUrl, expiresIn,customCode } = req.body;

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
    let shortCode = nanoid(6);
    if (customCode) {
      const cleanedCode = customCode.trim();
      if (!/^[a-zA-Z0-9_-]+$/.test(cleanedCode)) {
        return res.status(400).json({
          success: false,
          message: "Custom code can only contain letters, numbers, hyphens and underscores",
        });
      }

  if (cleanedCode.length < 3 || cleanedCode.length > 20) {
    return res.status(400).json({
      success: false,
      message: "Custom code must be between 3 and 20 characters",
    });
  }

  shortCode = cleanedCode;
}

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

    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "Custom code is already in use",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create short URL",
    });
  }
};


const getUrlStats = async (req, res) => {
  try {
    const { shortCode } = req.params;
    
    const result = await pool.query(
      `SELECT original_url, short_code, click_count, created_at, expires_at
      FROM urls
      WHERE short_code = $1`,
      [shortCode]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Short URL not found",
      });
    }
    
    const url = result.rows[0];
    
    return res.status(200).json({
      success: true,
      data: {
        shortCode: url.short_code,
        originalUrl: url.original_url,
        clickCount: url.click_count,
        createdAt: url.created_at,
        expiresAt: url.expires_at,
      },
    });
  } catch (error) {
    console.error("Get URL stats error:", error);
    
    return res.status(500).json({
      success: false,
      message: "Failed to get URL statistics",
    });
  }
};

module.exports = { createShortUrl, getUrlStats };