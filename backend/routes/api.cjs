const express = require("express");
const router = express.Router();
const Page = require("../models/Page.cjs");

// GET /api/updates – получить последние обновления по разделам
router.get("/updates", async (req, res) => {
  try {
    const sections = await Page.distinct("section");
    let updates = [];
    for (const sec of sections) {
      const doc = await Page.findOne({ section: sec }).sort({ updatedAt: -1 });
      if (doc) {
        updates.push({
          section: doc.section,
          type: doc.type,
          title: doc.title,
          updatedAt: doc.updatedAt,
        });
      }
    }
    updates.sort((a, b) => b.updatedAt - a.updatedAt);
    res.json(updates);
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET /api/:section/:type – получить контент страницы
router.get("/:section/:type", async (req, res) => {
  try {
    const { section, type } = req.params;
    const page = await Page.findOne({ section, type });
    if (!page) return res.status(404).json({ error: "Page not found" });
    res.json({
      section: page.section,
      type: page.type,
      title: page.title,
      content: page.content,
      updatedAt: page.updatedAt,
    });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// POST /api/:section/:type – добавить новый блок контента на страницу (создаст документ, если его нет)
router.post("/:section/:type", async (req, res) => {
  const { section, type } = req.params;
  const newBlock = req.body; // данные нового блока контента (например, { type: "text", data: "Новый блок" })
  try {
    const updatedPage = await Page.findOneAndUpdate(
      { section, type },
      {
        $push: { content: newBlock },
        $set: { title: req.body.title || type, updatedAt: new Date() },
      },
      { new: true, upsert: true }
    );
    res.status(201).json({
      message: "Content added",
      page: updatedPage,
    });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
