require("dotenv").config();

module.exports = {
    mongoURI: process.env.MONGODB_URI, // <-- Đúng với file .env
    jwtSecret: process.env.JWT_SECRET || "secret",
};