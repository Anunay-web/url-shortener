const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./config/db");
const urlRoutes = require("./routes/urlRoutes");
const redirectRoutes = require("./routes/redirectRoutes");

const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/", redirectRoutes);

app.use("/api/urls", urlRoutes);

app.get("/api/db-test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.status(200).json({
      success: true,
      message: "PostgreSQL connection successful",
      time: result.rows[0].now,
    });
  } catch (error) {
    console.error("Database error:", error);

    res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
});

app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "URL Shortener API is running",
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});