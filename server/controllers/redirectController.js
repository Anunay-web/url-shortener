const pool = require("../config/db");

const redirectToOriginalUrl = async (req, res) => {
  try {
    const { shortCode } = req.params;

    const result = await pool.query(
      `SELECT original_url, expires_at
       FROM urls
       WHERE short_code = $1`,
      [shortCode]
    );

    // short code does not exist
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Short URL not found",
      });
    }

    const url = result.rows[0];

    // check expiration
    if (url.expires_at && new Date(url.expires_at) < new Date()) {
      return res.status(410).json({
        success: false,
        message: "Short URL has expired",
      });
    }

    // redirect user
    return res.redirect(url.original_url);
  } catch (error) {
    console.error("Redirect error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to redirect",
    });
  }
};

module.exports = {
  redirectToOriginalUrl,
};