const mongoose = require("mongoose");
const Page = require("./models/Page.cjs");

const mongoURI =
  "mongodb+srv://Uninotes:dowahjdiuwahdiuh821y3e8qhwsidha@uninotes.f0rahbp.mongodb.net/";

mongoose
  .connect(mongoURI)
  .then(() => {
    console.log("Connected to MongoDB for seeding");
    seedPages();
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

const seedPages = async () => {
  try {
    const pages = [
      {
        section: "edpm",
        type: "lab",
        title: "EDPM Lab",
        content: [{ type: "text", data: "Тестовый контент для edpm/lab" }],
        updatedAt: new Date(),
      },
      {
        section: "edpm",
        type: "notes",
        title: "EDPM Notes",
        content: [{ type: "text", data: "Тестовый контент для edpm/notes" }],
        updatedAt: new Date(),
      },
    ];

    await Page.insertMany(pages);
    console.log("Pages seeded successfully.");
  } catch (error) {
    console.error("Error seeding pages:", error);
  } finally {
    mongoose.connection.close();
  }
};
