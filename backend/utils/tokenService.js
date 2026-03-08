import jwt from "jsonwebtoken";

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
};

// Generate access + refresh tokens and set as cookies
// Returns the accessToken so it can be included in JSON response for mobile clients
export const setAuthCookies = (res, userId) => {
    const accessToken = jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }  // Extended for mobile: 7 days instead of 15 min
    );

    const refreshToken = jwt.sign(
        { userId },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: "30d" }
    );

    res.cookie("accessToken", accessToken, {
        ...COOKIE_OPTIONS,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.cookie("refreshToken", refreshToken, {
        ...COOKIE_OPTIONS,
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    return accessToken;
};

// Clear auth cookies on logout
export const clearAuthCookies = (res) => {
    res.clearCookie("accessToken", COOKIE_OPTIONS);
    res.clearCookie("refreshToken", COOKIE_OPTIONS);
};
