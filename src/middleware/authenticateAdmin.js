const jwt = require("jsonwebtoken");

const authenticateAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(403).json({ success: false, message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const allowedRoles = ["admin", "super-admin", "marketing", "developer"];

    if (!allowedRoles.includes(decoded.role)) {
      return res.status(403).json({ success: false, message: "Unauthorized access." });
    }
    req.user = decoded; // store user payload
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid token." });
  }
};

module.exports = authenticateAdmin;