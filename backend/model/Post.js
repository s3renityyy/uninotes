import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["text", "image", "file"],
    required: true,
  },
  content: String,
  fileUrl: String,
  category: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Post", postSchema);
