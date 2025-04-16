const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const pageSchema = new Schema({
  section: String,
  type: String,
  title: String,
  content: [
    {
      type: { type: String },
      data: String,
      url: String,
      caption: String,
      dateAdded: { type: Date, default: Date.now },
    },
  ],
  updatedAt: { type: Date, default: Date.now },
});

pageSchema.index({ section: 1, type: 1 }, { unique: true });

module.exports = mongoose.model("Page", pageSchema);
