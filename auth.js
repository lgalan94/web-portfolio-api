const jwt = require('jsonwebtoken');
const secret = process.env.SECRET_KEY;

// 🔑 Create access token with 20-minute expiry
module.exports.createAccessToken = (user) => {
    const data = {
        id: user._id,
        isAdmin: user.isAdmin,
        email: user.email
    };

    // Add expiresIn: 20 minutes
    return jwt.sign(data, secret, { expiresIn: '20m' });
};

// 🔐 Verify JWT middleware
module.exports.verify = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: 'No authentication token provided.' });
    }

    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

    jwt.verify(token, secret, (err, decoded) => {
        if (err) {
            // Token expired or invalid
            return res.status(401).json({ message: 'Authorization failed or token expired.' });
        }

        // Attach user info from token to the request object
        req.user = decoded;
        next();
    });
};

// 🔒 Admin-only middleware
module.exports.adminOnly = (req, res, next) => {
    if (!req.user || req.user.isAdmin !== true) {
        return res.status(403).json({ message: 'Access denied: Admins only' });
    }
    next();
};

// 📝 Decode token without verifying (optional)
module.exports.decode = (token) => {
    token = token.startsWith('Bearer ') ? token.slice(7) : token;
    return jwt.decode(token, { complete: true }).payload;
};

// ⚡ Optional helper to check if token is expired
module.exports.isTokenExpired = (token) => {
    const payload = this.decode(token);
    if (!payload || !payload.exp) return true;
    const now = Math.floor(Date.now() / 1000); // current time in seconds
    return payload.exp < now; // true if expired
};
