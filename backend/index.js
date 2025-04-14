import express from "express";
import Connection from "./database/db.js";
import router from "./routes/api.js";
import cors from "cors";

const app = express();

const PORT = 9000;

app.use(cors());
app.use("/", router);

app.listen(PORT, () => console.log("server is running on port", PORT));
Connection();
