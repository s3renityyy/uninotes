const express = require("express");
const router = express.Router();
const Page = require("../models/Page.cjs");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });
const { ObjectId } = require("mongoose").Types;
const isAdminMiddleware = require("../middleware/adminAuth.cjs");
const toUtf8 = require("../helpers/convert.cjs");

const isValidRouteKey = (str) => /^[a-zA-Z0-9_-]+$/.test(str);

router.get("/updates", async (req, res) => {
  try {
    const updates = await Page.find(
      {},
      "section type sectionTitle typeTitle updatedAt"
    ).sort({
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
      content: page.content
        .sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded))
        .map((item) => ({
          id: item._id,
          dateAdded: item.dateAdded,
          text: item.text || "",
          files: item.files || [],
        })),
    });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post(
  "/:section/:type",
  isAdminMiddleware,
  upload.array("files", 30),
  async (req, res) => {
    const { section, type } = req.params;
    const { text } = req.body;
    const files = req.files;

    if (!isValidRouteKey(section) || !isValidRouteKey(type)) {
      return res.status(400).json({ error: "Некорректный section или type" });
    }

    try {
      const filesData = files.map((file) => ({
        type: file.mimetype.startsWith("image/") ? "image" : "file",
        url: `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
        caption: toUtf8(file.originalname),
      }));

      const newBlock = {
        text: text || "",
        files: filesData,
        dateAdded: new Date(),
      };

      await Page.findOneAndUpdate(
        { section, type },
        {
          $set: { updatedAt: new Date() },
          $push: { content: newBlock },
        },
        { new: true, upsert: true }
      );

      res.status(201).json({ message: "Контент добавлен" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Внутренняя ошибка сервера" });
    }
  }
);

router.get("/links", async (req, res) => {
  try {
    const pages = await Page.find(
      {},
      "section type sectionTitle typeTitle"
    ).sort({
      updatedAt: -1,
    });

    const sections = {};
    pages.forEach(({ section, type, sectionTitle, typeTitle }) => {
      if (!sections[section]) {
        sections[section] = { key: section, label: sectionTitle, children: [] };
      }
      sections[section].children.push({ key: type, label: typeTitle });
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
    const { text, files } = req.body;

    if (!isValidRouteKey(section) || !isValidRouteKey(type)) {
      return res.status(400).json({ error: "Некорректный section или type" });
    }

    try {
      await Page.updateOne(
        { section, type, "content._id": contentId },
        {
          $set: {
            "content.$.text": text,
            "content.$.files": files,
          },
        }
      );

      res.json({ message: "Контент обновлён" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

module.exports = router;
