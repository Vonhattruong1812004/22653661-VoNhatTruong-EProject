//test:
const jwt = require("jsonwebtoken");
const config = require("../config");

module.exports = function(req, res, next) {
    // Lấy toàn bộ header
    const authHeader = req.header("authorization");

    // 1. Kiểm tra xem header có tồn tại không
    if (!authHeader) {
        return res.status(401).json({ message: "No token, authorization denied" });
    }

    // 2. Tách chữ "Bearer " ra để lấy token thật
    // Header sẽ có dạng "Bearer <token>"
    const token = authHeader.split(' ')[1];

    // 3. Kiểm tra xem token có tồn tại sau khi tách không
    if (!token) {
        return res.status(401).json({ message: "Token format is invalid" });
    }

    try {
        // 4. Chỉ xác thực token thật
        const decoded = jwt.verify(token, config.jwtSecret);
        req.user = decoded;
        next();
    } catch (e) {
        console.error("JWT Verify Error:", e.message);
        res.status(400).json({ message: "Token is not valid" });
    }
};