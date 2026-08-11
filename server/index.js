const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Welcome to the URL Shortener API",
    });
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