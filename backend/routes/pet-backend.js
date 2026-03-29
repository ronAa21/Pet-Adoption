import express from "express";
import { pool } from "../db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import axios from "axios";

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

    const [pref] = await pool.query(
      "SELECT user_id FROM user_preferences WHERE user_id = ?", 
      [owner.id]
    )

    const isNewUser = pref.length === 0;
    console.log(`User ${owner.id} login - isNewUser: ${isNewUser}, preferences found: ${pref.length}`);

    res.json({ 
      token: token,
      isNewUser: isNewUser
    });
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

// for getting the user's answers on quiz - NEW
route.post("/test", check, async(req, res) => {

  const ownerId = req.user.ownerId;
  const { energy, independence, kids, space, shedding } = req.body;

  const ML_SERVER_URL = process.env.ML_SERVER_URL || 'http://localhost:5000';

    try {

      // 1. Save/Update preferences in MySQL
        const sql = `
            INSERT INTO user_preferences 
            (user_id, energy_pref, independence_pref, kids_pref, space_pref, shedding_pref) 
            VALUES (?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
            energy_pref = ?, 
            independence_pref = ?,
            kids_pref = ?,
            space_pref = ?,
            shedding_pref = ?
        `;

        await pool.query(sql, [
          ownerId, energy, independence, kids, space, shedding,
          energy, independence, kids, space, shedding
        ]); 

        const mlResponse = await axios.post(`${ML_SERVER_URL}/recommend`, {
            energy,
            independence,
            kids,
            space,
            shedding
        });

        // 3. Return success (with or without ML matches)
        res.status(200).json({
            message: "Preferences saved successfully!",
            // matches: mlResponse.data.matches // Uncomment when ML server is ready
        });

    } catch (error) {
        console.error("Error in Quiz Route:", error);
        res.status(500).json({ message: "Server error", error: error.message }); 
    }
})

// displays the best match pet for you
route.get('/recommendations', check, async (req, res) => {
    const userId = req.user.ownerId;

    try {
        console.log("Getting recommendations for user:", userId);
        
        // 1. Get the user's specific preferences from MySQL
        const [prefs] = await pool.query(
            "SELECT energy_pref, independence_pref, kids_pref, space_pref, shedding_pref FROM user_preferences WHERE user_id = ?",
            [userId]
        );

        console.log("User preferences found:", prefs.length);

        // If no preferences, return all available pets (user hasn't taken quiz)
        if (prefs.length === 0) {
            console.log("No preferences found, returning all available pets");
            const [pets] = await pool.query(
                'SELECT pets.* FROM pets LEFT JOIN swipes ON pets.id = swipes.pet_id AND swipes.user_id = ? WHERE swipes.pet_id IS NULL AND pets.is_adopted = 0 ORDER BY pets.id LIMIT 20',
                [userId]
            );
            return res.json({ matches: pets, message: "Take the quiz for personalized matches!" });
        }

        const user = prefs[0];
        console.log("User preferences:", user);

        // 2. Get all available pets (not swiped by this user)
        const [pets] = await pool.query(
            'SELECT pets.* FROM pets LEFT JOIN swipes ON pets.id = swipes.pet_id AND swipes.user_id = ? WHERE swipes.pet_id IS NULL AND pets.is_adopted = 0 ORDER BY pets.id',
            [userId]
        );

        console.log("Found", pets.length, "available pets");

        // 3. Try ML recommendations if server is available
        try {
            const mlServerUrl = process.env.ML_SERVER_URL || 'https://pet-adoption-ml.onrender.com/recommend';
            console.log("Trying ML server at:", mlServerUrl);
            
            const pythonRes = await axios.post(mlServerUrl, {
                energy: user.energy_pref,
                independence: user.independence_pref,
                kids: user.kids_pref,
                space: user.space_pref,
                shedding: user.shedding_pref
            }, { timeout: 5000 });
            
            console.log("ML recommendations received");
            return res.json(pythonRes.data);
        } catch (mlError) {
            console.error("ML Server Error:", mlError.message);
            console.log("Using fallback: returning all available pets");
        }
        
        // Fallback: Return all available pets
        return res.json({ matches: pets });

    } catch (error) {
        console.error("Recommendations Error:", error);
        console.error("Error details:", {
            message: error.message,
            code: error.code,
            sqlMessage: error.sqlMessage,
            stack: error.stack
        });
        res.status(500).json({ 
            message: "Failed to get recommendations", 
            error: error.message
        });
    }
});

export default route;