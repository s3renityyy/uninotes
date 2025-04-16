const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const pageSchema = new Schema(
  {
    section: { type: String, required: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    content: { type: Array, default: [] },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

pageSchema.index({ section: 1, type: 1 }, { unique: true });

module.exports = mongoose.model("Page", pageSchema);
