const express = require("express");
const router = express.Router();
const Page = require("../models/Page.cjs");
const { ObjectId } = require("mongoose").Types;
const isAdminMiddleware = require("../middleware/adminAuth.cjs");
const jwt = require("jsonwebtoken");

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

router.get("/updates", async (req, res) => {
  try {
    const updates = await Page.find({}, "section type title updatedAt").sort({
      updatedAt: -1,
    });
    res.json(updates);
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/:section/:type", async (req, res) => {
  try {
    const { section, type } = req.params;
    const page = await Page.findOne({ section, type });
    if (!page) return res.status(404).json({ error: "Page not found" });
    res.json({
      ...page.toObject(),
      content: [...page.content]
        .sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded))
        .map((item) => ({
          ...item.toObject(),
          id: item._id,
        })),
    });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/:section/:type", isAdminMiddleware, async (req, res) => {
  const { section, type } = req.params;

  const { type: blockType, data, url, caption } = req.body;
  const newBlock =
    blockType && (data || url)
      ? { type: blockType, data, url, caption, dateAdded: new Date() }
      : null;

  const update = {
    $set: { title: req.body.title || type, updatedAt: new Date() },
  };

  if (newBlock) {
    update.$push = { content: newBlock };
  }

  try {
    const page = await Page.findOneAndUpdate({ section, type }, update, {
      new: true,
      upsert: true,
    });
    res.status(201).json({ message: "Content added", page });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/links", async (req, res) => {
  try {
    const pages = await Page.find({}, "section type title").sort({
      updatedAt: -1,
    });

    const sections = {};
    pages.forEach(({ section, type, title }) => {
      const sectionUpper = section.toUpperCase();
      if (!sections[section]) {
        sections[section] = { key: section, label: sectionUpper, children: [] };
      }
      sections[section].children.push({ key: type, label: title });
    });

    res.json(Object.values(sections));
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete(
  "/:section/:type/:contentId",
  isAdminMiddleware,
  async (req, res) => {
    const { section, type, contentId } = req.params;
    try {
      const result = await Page.findOneAndUpdate(
        { section, type },
        { $pull: { content: { _id: new ObjectId(contentId) } } },
        { new: true }
      );
      res.json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

router.put(
  "/:section/:type/:contentId",
  isAdminMiddleware,
  async (req, res) => {
    const { section, type, contentId } = req.params;
    const { data, caption } = req.body;
    try {
      await Page.updateOne(
        { section, type, "content._id": contentId },
        { $set: { "content.$.data": data, "content.$.caption": caption } }
      );
      res.json({ message: "Обновлено" });
    } catch (err) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

router.delete("/:section/:type", isAdminMiddleware, async (req, res) => {
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

router.put("/:section/:type", isAdminMiddleware, async (req, res) => {
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

module.exports = router;
