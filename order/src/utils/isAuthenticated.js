const jwt = require('jsonwebtoken');
require('dotenv').config();

function isAuthenticated(req, res, next) {
    // Lấy token từ header x-auth-token (chuẩn dự án này)
    const token = req.header('x-auth-token');
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        // Verify the token using the JWT library and the secret key
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decodedToken;
        next();
    } catch (err) {
        console.error(err);
        return res.status(401).json({ message: 'Unauthorized' });
    }
}

module.exports = isAuthenticated;