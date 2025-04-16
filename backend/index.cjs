require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const apiRoutes = require("./routes/api.cjs");

const app = express();
const PORT = process.env.PORT || 9000;
const MONGODP_URI = process.env.MONGODP_URI;

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || true }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
app.use(express.json());

mongoose
  .connect(MONGODP_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error(err));

app.use("/api", apiRoutes);
app.use(express.static(path.join(__dirname, "frontend", "dist")));
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "dist", "index.html"));
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
