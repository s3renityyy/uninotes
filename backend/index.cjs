require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const apiRoutes = require("./routes/api.cjs");
const authRoutes = require("./routes/auth.cjs");
const cookieParser = require("cookie-parser");

const app = express();
const PORT = process.env.PORT || 9000;
const MONGODB_URI = process.env.MONGODB_URI;

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || true }));
app.use(express.json());
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: "Слишком много запросов, попробуйте позже." },
});
app.use(limiter);
app.use(cookieParser());
app.use(cors());
app.use("/api", authRoutes);

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error(err));

app.use("/api", apiRoutes);
const staticPath = path.join(__dirname, "..", "frontend", "dist");
app.use(express.static(staticPath));
app.use((req, res) => {
  res.sendFile(path.join(staticPath, "index.html"));
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
