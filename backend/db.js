import mysql from "mysql2/promise";

export const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  port: "3307",
  password: "Aaronpagente212005",
  database: "pet_society",
  connectionLimit: 5
});