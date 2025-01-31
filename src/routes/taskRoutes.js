const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const pool = require("../config/db");

const router = express.Router();

// 🔹 Get All Tasks (Protected)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const tasks = await pool.query("SELECT * FROM tasks WHERE user_id = $1", [req.user.userId]);
    res.json(tasks.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Create a New Task (Protected)
router.post("/", authMiddleware, async (req, res) => {
  const { title, description, status } = req.body;
  try {
    const newTask = await pool.query(
      "INSERT INTO tasks (title, description, status, user_id) VALUES ($1, $2, $3, $4) RETURNING *",
      [title, description, status, req.user.userId]
    );
    res.status(201).json(newTask.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
