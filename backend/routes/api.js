import express from "express";
import uploadTryhackmeController from "../controller/UploadTryhackmeController.js";
import storage from "../middleware/UploadTryhackmeController.js";

const router = express.Router();

router.post("/tryhackme", storage.single("file"), uploadTryhackmeController);

export default router;
