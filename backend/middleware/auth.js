import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "secret_jwt_key";

export default function auth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token)
    return res.status(401).json({ message: "Нет токена, доступ запрещён" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (e) {
    res.status(400).json({ message: "Неверный токен" });
  }
}
