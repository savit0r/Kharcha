import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
    // Support both cookie-based auth (web) and Bearer token (mobile/React Native)
    let token = req.cookies.accessToken;

    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
        return res.status(401).json({ message: "Not authenticated. Please login." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Token expired or invalid. Please login again." });
    }
};

export default authMiddleware;
