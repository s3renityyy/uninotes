export default function checkAdminKey(req, res, next) {
  const adminKey = req.headers["x-admin-key"];
  if (adminKey !== process.env.ADMIN_KEY) {
    return res.status(403).json({ message: "Forbidden: Invalid admin key" });
  }
  next();
}
