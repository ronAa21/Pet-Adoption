import express from "express";
import { pool } from "../db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

const route = express.Router();
dotenv.config();

function check(req, res, next) {
  const headers = req.headers.authorization;

  if(!headers) {
    return res.status(401).send("No token");
  }

  const token = headers.split(" ")[1];

  try {
    const owner = jwt.verify(token, process.env.JWT_SECRET);
    req.user = owner;
    console.log(owner);
    next();
  } catch (error) {
    res.status(401).send("Invalid request");
  }
};

// for sign up
route.post("/signup", async (req, res) => {
  try {
    const { email, password } = req.body;

    const hashed = await bcrypt.hash(password, 10);

    const [rows] = await pool.query(
      'insert into owners (email, password_hash) values (?, ?)',[email, hashed]
    );

    console.log("Sign up success");

    res.json({
      message: "Signed up",
      user: email
    });

  } catch (error) {
    console.error(error);
    res.status(400).send({ message: "Bad input" });
  }
});

// for login
route.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const [rows] = await pool.query(
      'select id, password_hash from owners where email = ?',[email]
    );

    if(rows.length === 0) {
      return res.status(404).send({ message: "Not found" });
    };

    const owner = rows[0];

    const match = await bcrypt.compare(password, owner.password_hash);

    if(!match) {
      return res.status(401).send({ message: "Wrong credentials" });
    };

    const token = jwt.sign(
      { ownerId: owner.id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token: token});
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Server failed", error: error });
  }
});

// dashboard
route.get("/swipe", check, async (req, res) => {
  try {
    const ownerId = req.user.ownerId;

    // specific user dashboard
    const [rows] = await pool.query(
      'select * from swipes where user_id = ?',[ownerId]
    )

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Server failed", error: error })
  }
});

// fetch pets
route.get("/adopt", check, async (req, res) => {
  try {

    const ownerId = req.user.ownerId;

    const [rows] = await pool.query(
      'SELECT pets.* FROM pets LEFT JOIN swipes ON pets.id = swipes.pet_id AND swipes.user_id = ? WHERE swipes.pet_id IS NULL AND pets.is_adopted = 0', [ownerId]
    );

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Server failed", error: error })
  }
});

// for reject/Want
route.post("/adopted/:id", check, async (req, res) => {
  try {
    const petId = req.params.id;
    const ownerId = req.user.ownerId;
    const { decision } = req.body;

    const [rows] = await pool.query(
      'insert into swipes (user_id, pet_id, decision) values (?, ?, ?)', [ownerId, petId, decision]
    );

    if(decision === "like") {
      await pool.query(
        'update pets set is_adopted = 1 where id = ?', [petId]
      )
    }

    console.log("decision recorded");

    res.json({
      message: "success"
    });
  } catch (error) {
    console.error(error);

    // 1. Handle Duplicates (If user swipes twice)
    if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ message: "You already swiped on this pet!" });
    }

    res.status(500).send({ message: "Server Failed", error: error })
  }
});

// fetch owner info
route.get("/owner/info", check, async (req, res) => {
  try {
    const ownerId = req.user.ownerId;

    const [rows] = await pool.query(
      'select * from owners where id = ?',[ownerId]
    );

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Server failed", error: error });
  }
});

// fetch the user's heart pets
route.get("/owner/heart", check, async (req, res) => {
  try {
    const ownerId = req.user.ownerId;

    const [rows] = await pool.query(
      `SELECT pets.* FROM swipes 
       JOIN pets ON swipes.pet_id = pets.id 
       WHERE swipes.user_id = ? AND swipes.decision = 'like'`,
      [ownerId]
    );

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Server failed", error: error });
  }
});

route.get("/history", check, async (req, res) => {
  try {
    const ownerId = req.user.ownerId;

    const [rows] = await pool.query(
      `SELECT pets.*, swipes.decision FROM swipes JOIN pets ON swipes.pet_id = pets.id WHERE swipes.user_id = ? AND swipes.decision IN ('like', 'pass')`,[ownerId]
    )

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Server Failed", error: error });
  }
})

export default route;