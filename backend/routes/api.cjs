const express = require("express");
const router = express.Router();
const Page = require("../models/Page.cjs");
const { ObjectId } = require("mongoose").Types;
const isAdminMiddleware = require("../middleware/adminAuth.cjs");

const isValidRouteKey = (str) => /^[a-zA-Z0-9_-]+$/.test(str);

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

  if (!isValidRouteKey(section) || !isValidRouteKey(type)) {
    return res.status(400).json({ error: "Некорректный section или type" });
  }

  if (!blockType || (!data && !url)) {
    return res.status(400).json({ error: "Неверные данные блока" });
  }

  const newBlock = {
    type: blockType,
    data,
    url,
    caption,
    dateAdded: new Date(),
  };

  try {
    const page = await Page.findOneAndUpdate(
      { section, type },
      {
        $set: { updatedAt: new Date() },
        $push: { content: newBlock },
      },
      { new: true }
    );

    if (!page) {
      return res.status(404).json({ error: "Страница не найдена" });
    }

    res.status(201).json({ message: "Контент добавлен", page });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Внутренняя ошибка сервера" });
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
    if (!isValidRouteKey(section) || !isValidRouteKey(type)) {
      return res.status(400).json({ error: "Некорректный section или type" });
    }
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

module.exports = router;
