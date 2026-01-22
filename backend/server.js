import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import pet from "../backend/routes/pet-backend.js";

dotenv.config();
const app = express();

const PORT = process.env.PORT || 10000;

app.use(cors({
  origin: "https://pet-adoption-web-t3i8.onrender.com",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use(express.json());
app.use("/pet", pet);

app.use((req, res) => {
  res.status(404).send({ message: "Not found" });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running at ${process.env.PORT}\nOkairi ${process.env.USER}`)
});