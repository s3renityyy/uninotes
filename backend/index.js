import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import postRoutes from "./routes/postRoutes.js";
import Connection from "./database/db.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.use("/api/posts", postRoutes);

Connection();

app.listen(process.env.PORT || 3000, () => {
  console.log("Server is running");
});
