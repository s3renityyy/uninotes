const express = require("express");
const jwt = require("jsonwebtoken");
const isAdminMiddleware = require("../middleware/adminAuth.cjs");
const router = express.Router();
const Page = require("../models/Page.cjs");

const isValidRouteKey = (str) => /^[a-zA-Z0-9_-]+$/.test(str);

router.put("/admin/:section/:type", isAdminMiddleware, async (req, res) => {
  const { newSection, newType, newTitle } = req.body;
  try {
    await Page.updateOne(
      { section: req.params.section, type: req.params.type },
      { $set: { section: newSection, type: newType, title: newTitle } }
    );
    res.json({ message: "Роут обновлен" });
  } catch (err) {
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

router.post("/admin/login", (req, res) => {
  const { password } = req.body;
  if (password === process.env.ADMIN_KEY) {
    const tokenAdmin = jwt.sign(
      { role: "admin" },
      process.env.JWT_SECRET_ADMIN,
      {
        expiresIn: "1h",
      }
    );
    res.cookie("tokenAdmin", tokenAdmin, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    return res.json({ success: true });
  }
  res.status(401).json({ success: false });
});

router.post("/admin/logout", (req, res) => {
  res.clearCookie("tokenAdmin").json({ message: "Выход выполнен" });
});

router.post("/admin/:section/:type", isAdminMiddleware, async (req, res) => {
  const { section, type } = req.params;

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
      title: req.body.title || type,
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
