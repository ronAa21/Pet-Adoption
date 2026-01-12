import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import pet from "../backend/routes/pet-backend.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use("/pet", pet);

app.use((req, res) => {
  res.status(404).send({ message: "Not found" });
});

app.listen(process.env.PORT, () => {
  console.log(`Server running at ${process.env.PORT}\nOkairi ${process.env.USER}`)
});