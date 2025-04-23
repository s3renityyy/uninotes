const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const pageSchema = new Schema({
  section: String,
  type: String,
  sectionTitle: String,
  typeTitle: String,
  content: [
    {
      type: { type: String, required: true },
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
