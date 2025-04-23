const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const isAdminMiddleware = (req, res, next) => {
  const token = req.cookies.tokenAdmin;
  if (!token) return res.status(403).send("Not authorized");

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET_ADMIN);

    const currentKeyHash = crypto
      .createHash("sha256")
      .update(process.env.ADMIN_KEY)
      .digest("hex");

    if (payload.keyHash !== currentKeyHash) {
      return res.status(403).send("Admin key changed. Please log in again.");
    }

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp - now < 15 * 60) {
      const newToken = jwt.sign(
        { role: "admin", keyHash: currentKeyHash },
        process.env.JWT_SECRET_ADMIN,
        { expiresIn: "1h" }
      );
      res.cookie("tokenAdmin", newToken, {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
      });
    }

    if (payload.role === "admin") {
      return next();
    } else {
      return res.status(403).send("Not admin");
    }
  } catch (err) {
    return res.status(403).send("Invalid token admin");
  }
};

module.exports = isAdminMiddleware;
