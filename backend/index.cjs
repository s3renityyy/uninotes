const express = require("express");
const mongoose = require("mongoose");
const apiRoutes = require("./routes/api.cjs");
const app = express();
const PORT = process.env.PORT;

app.use(express.json());

mongoose
  .connect(
    "mongodb+srv://Uninotes:dowahjdiuwahdiuh821y3e8qhwsidha@uninotes.f0rahbp.mongodb.net/"
  )
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error(err));

app.use("/api", apiRoutes);

app.listen(9000, () => {
  console.log(`Server running on port ${9000}`);
});
