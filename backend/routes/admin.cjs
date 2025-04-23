const express = require("express");
const jwt = require("jsonwebtoken");
const isAdminMiddleware = require("../middleware/adminAuth.cjs");
const router = express.Router();
const Page = require("../models/Page.cjs");
const crypto = require("crypto");
const rateLimit = require("express-rate-limit");

const isValidRouteKey = (str) => /^[a-zA-Z0-9_-]+$/.test(str);

const attemptsByIP = new Map();

router.put("/admin/:section/:type", isAdminMiddleware, async (req, res) => {
  const { section, type, sectionTitle, typeTitle } = req.body;
  const { section: oldSection, type: oldType } = req.params;

  if (!section || !type || !sectionTitle || !typeTitle) {
    return res.status(400).json({ error: "Некорректные данные" });
  }

  if (section !== oldSection || type !== oldType) {
    const existing = await Page.findOne({ section, type });
    if (existing) {
      return res
        .status(409)
        .json({ error: "Роут с такими ключами уже существует" });
    }
  }

  try {
    await Page.updateOne(
      { section: oldSection, type: oldType },
      {
        $set: {
          section,
          type,
          sectionTitle: sectionTitle,
          typeTitle: typeTitle,
          updatedAt: new Date(),
        },
      }
    );
    res.json({ message: "Роут обновлен" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/admin/:section/:type", isAdminMiddleware, async (req, res) => {
  try {
    await Page.deleteOne({
      section: req.params.section,
      type: req.params.type,
    });
    res.json({ message: "Роут удален" });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/admin/me", isAdminMiddleware, (req, res) => {
  res.json({ ok: true });
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Слишком много попыток входа. Попробуйте позже." },
});

router.post("/admin/login", loginLimiter, async (req, res) => {
  const { password, captchaToken } = req.body;
  const ip = req.ip;

  const attempts = attemptsByIP.get(ip) || 0;

  if (attempts >= 5) {
    return res.status(429).json({ error: "IP временно заблокирован" });
  }

  if (attempts >= 3) {
    if (!captchaToken) {
      return res.status(400).json({ error: "Капча обязательна" });
    }

    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${captchaToken}&remoteip=${ip}`;
    const captchaRes = await fetch(verifyUrl, { method: "POST" });
    const captchaData = await captchaRes.json();

    if (!captchaData.success) {
      return res.status(403).json({ error: "Капча не пройдена" });
    }
  }

  if (password === process.env.ADMIN_KEY) {
    attemptsByIP.delete(ip);

    const adminKeyHash = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");

    const tokenAdmin = jwt.sign(
      { role: "admin", keyHash: adminKeyHash },
      process.env.JWT_SECRET_ADMIN,
      { expiresIn: "1h" }
    );

    res.cookie("tokenAdmin", tokenAdmin, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res.json({ success: true });
  }

  attemptsByIP.set(ip, attempts + 1);

  if (attempts + 1 === 5) {
    setTimeout(() => attemptsByIP.delete(ip), 10 * 60 * 1000);
  }

  return res.status(401).json({ success: false });
});

router.post("/admin/logout", (req, res) => {
  res.clearCookie("tokenAdmin").json({ message: "Выход выполнен" });
});

router.post("/admin/:section/:type", isAdminMiddleware, async (req, res) => {
  const { section, type } = req.params;
  const { sectionTitle, typeTitle } = req.body;

  if (!isValidRouteKey(section) || !isValidRouteKey(type)) {
    return res.status(400).json({ error: "Некорректный section или type" });
  }

  try {
    const exists = await Page.findOne({ section, type });
    if (exists) {
      return res.status(409).json({ error: "Страница уже существует" });
    }

    const page = await Page.create({
      section,
      type,
      sectionTitle: sectionTitle,
      typeTitle: typeTitle,
      createdAt: new Date(),
      updatedAt: new Date(),
      content: [],
    });

    res.status(201).json({ message: "Страница создана", page });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
});

module.exports = router;
