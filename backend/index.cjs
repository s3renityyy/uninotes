require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const apiRoutes = require("./routes/api.cjs");
const adminRoutes = require("./routes/admin.cjs");
const cookieParser = require("cookie-parser");
const csrf = require("csurf");

const app = express();
app.set("trust proxy", 1);
const PORT = process.env.PORT || 9000;
const MONGODB_URI = process.env.MONGODB_URI;

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "https://www.google.com",
          "https://www.gstatic.com",
        ],
        frameSrc: ["'self'", "https://www.google.com"],
        connectSrc: [
          "'self'",
          "https://www.google.com",
          "https://www.gstatic.com",
        ],
        imgSrc: [
          "'self'",
          "https://www.google.com",
          "https://www.gstatic.com",
          "data:",
        ],
        styleSrc: ["'self'", "'unsafe-inline'"],
      },
    },
  })
);

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json());
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { message: "Слишком много запросов, попробуйте позже." },
});
app.use(limiter);
app.use(cookieParser());

const csrfProtection = csrf({ cookie: true });
app.use((req, res, next) => {
  if (req.path === "/api/admin/login" || req.path === "/api/admin/logout") {
    return next();
  }
  return csrfProtection(req, res, next);
});

app.get("/api/csrf-token", (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error(err));

app.use("/api", adminRoutes);
app.use("/api", apiRoutes);
const staticPath = path.join(__dirname, "..", "frontend", "dist");
app.use(express.static(staticPath));
app.use((req, res) => {
  res.sendFile(path.join(staticPath, "index.html"));
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
