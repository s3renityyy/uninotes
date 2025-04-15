import express from "express";
import multer from "multer";
import {
  createPost,
  getPostsByCategory,
  getRecentPosts,
  updatePost,
  deletePost,
} from "../controller/postController.js";
import checkAdminKey from "../middleware/checkAdminKey.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/", checkAdminKey, upload.single("file"), createPost);
router.get("/category/:category", getPostsByCategory);
router.get("/recent", getRecentPosts);
router.put("/:id", checkAdminKey, updatePost);
router.delete("/:id", checkAdminKey, deletePost);

export default router;
