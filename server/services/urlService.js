const pool = require("../config/db");
const { nanoid } = require("nanoid");

const createShortUrl = async ({
  originalUrl,
  customCode,
  expiresIn,
  userId,
}) => {
  let shortCode = customCode;

  // Generate random code if custom code is not provided
  if (!shortCode) {
    shortCode = nanoid(6);
  }

  // Check whether short code already exists
  const existingUrl = await pool.query(
    `SELECT id
     FROM urls
     WHERE short_code = $1`,
    [shortCode]
  );

  if (existingUrl.rows.length > 0) {
    const error = new Error("Short code already exists");
    error.statusCode = 409;
    throw error;
  }

  // Calculate expiration time
  let expiresAt = null;

  if (expiresIn !== undefined && expiresIn !== null) {
    const minutes = Number(expiresIn);

    if (!Number.isFinite(minutes) || minutes <= 0) {
      const error = new Error("expiresIn must be a positive number");
      error.statusCode = 400;
      throw error;
    }

    expiresAt = new Date(Date.now() + minutes * 60 * 1000);
  }

  // Save URL
  const result = await pool.query(
    `INSERT INTO urls (
      original_url,
      short_code,
      expires_at,
      user_id
    )
    VALUES ($1, $2, $3, $4)
    RETURNING id, original_url, short_code, created_at, expires_at`,
    [originalUrl, shortCode, expiresAt, userId]
  );

  return result.rows[0];
};

const getAllUrls = async (userId) => {
  const result = await pool.query(
    `SELECT id, original_url, short_code, created_at, expires_at, click_count
     FROM urls
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId]
  );

  return result.rows;
};


const getUrlStats = async (shortCode, userId) => {
  const result = await pool.query(
    `SELECT id, original_url, short_code, created_at, expires_at, click_count
     FROM urls
     WHERE short_code = $1
     AND user_id = $2`,
    [shortCode, userId]
  );

  if (result.rows.length === 0) {
    const error = new Error("Short URL not found");
    error.statusCode = 404;
    throw error;
  }

  return result.rows[0];
};


const deleteUrl = async (shortCode, userId) => {
  const result = await pool.query(
    `DELETE FROM urls
     WHERE short_code = $1
     AND user_id = $2
     RETURNING short_code`,
    [shortCode, userId]
  );

  if (result.rows.length === 0) {
    const error = new Error("Short URL not found");
    error.statusCode = 404;
    throw error;
  }

  return result.rows[0];
};


module.exports = {
  createShortUrl,
  getAllUrls,
  getUrlStats,
  deleteUrl,
};