const jwt = require("jsonwebtoken");

module.exports = function requireAuth(req, res, next) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ message: "No token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id; // נשתמש בזה במסלולים
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid token" });
  }
};
