const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const cookieParser = require("cookie-parser");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "secret_jwt_key";

router.use(cookieParser());

router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  const existingUser = await User.findOne({ username });
  if (existingUser)
    return res.status(400).json({ message: "Пользователь уже существует" });

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new User({ username, password: hashedPassword });
  await user.save();

  const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1d" });

  res
    .cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 86400000,
    })
    .json({ user: { id: user._id, username: user.username } });
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (!user)
    return res.status(400).json({ message: "Неверный username или пароль" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch)
    return res.status(400).json({ message: "Неверный username или пароль" });

  const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1d" });

  res
    .cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 86400000,
    })
    .json({ user: { id: user._id, username: user.username } });
});

router.post("/logout", (req, res) => {
  res.clearCookie("token").json({ message: "Выход выполнен" });
});

router.get("/me", async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Нет токена" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user)
      return res.status(404).json({ message: "Пользователь не найден" });

    res.json({ user });
  } catch (err) {
    res.status(401).json({ message: "Неверный токен" });
  }
});

module.exports = router;
