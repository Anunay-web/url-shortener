const urlService = require("../services/urlService");
const logger = require("../utils/logger");

const createShortUrl = async (req, res) => {
  try {
    const { originalUrl, customCode, expiresIn } = req.body;

    // Validate original URL
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
        message: "Invalid URL",
      });
    }

    // Call service layer
    const url = await urlService.createShortUrl({
      originalUrl,
      customCode,
      expiresIn,
      userId: req.user.userId,
    });

    return res.status(201).json({
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
    logger.error("Create URL error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to create short URL",
    });
  }
};

const getUrlStats = async (req, res) => {
  try {
    const { shortCode } = req.params;

    const url = await urlService.getUrlStats(
      shortCode,
      req.user.userId
    );

    return res.status(200).json({
      success: true,
      data: {
        id: url.id,
        originalUrl: url.original_url,
        shortCode: url.short_code,
        createdAt: url.created_at,
        expiresAt: url.expires_at,
        clickCount: url.click_count,
      },
    });
  } catch (error) {
    logger.error("Get URL stats error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch URL stats",
    });
  }
};


const deleteUrl = async (req, res) => {
  try {
    const { shortCode } = req.params;

    const deletedUrl = await urlService.deleteUrl(
      shortCode,
      req.user.userId
    );

    return res.status(200).json({
      success: true,
      message: "Short URL deleted successfully",
      data: {
        shortCode: deletedUrl.short_code,
      },
    });
  } catch (error) {
    logger.error("Delete URL error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to delete URL",
    });
  }
};

const getAllUrls = async (req, res) => {
  try {
    const urls = await urlService.getAllUrls(req.user.userId);

    logger.info("URLs fetched successfully", {
  userId: req.user.userId,
  count: urls.length,
});
    return res.status(200).json({
      success: true,
      data: urls.map((url) => ({
        id: url.id,
        originalUrl: url.original_url,
        shortCode: url.short_code,
        createdAt: url.created_at,
        expiresAt: url.expires_at,
        clickCount: url.click_count,
      })),
    });
  } catch (error) {
    logger.error("Get URLs error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch URLs",
    });
  }
};

module.exports = { createShortUrl, getUrlStats, deleteUrl, getAllUrls };