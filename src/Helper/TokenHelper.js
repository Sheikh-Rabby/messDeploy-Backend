const jwt = require("jsonwebtoken");

exports.EncodeToken = (email, user_id) => {
    let KEY="123-ABC-XYZ";
    const EXPIRE = { expiresIn: '7d' };
    const PAYLOAD = { email: email, user_id: user_id };
    return jwt.sign(PAYLOAD, KEY, EXPIRE);
}

exports.DecodeToken = (token) => {
    try {
        let KEY="123-ABC-XYZ";
        return jwt.verify(token, KEY);
    } catch (err) {
        console.error("Token verification failed:", err);
        return { error: "Invalid or expired token" };
    }
}
