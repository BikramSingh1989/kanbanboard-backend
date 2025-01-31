require("dotenv").config();
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 5000;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

app.use(express.json());
app.use(cors());

// User Registration
app.post("/register", async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const result = await pool.query(
            "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username",
            [username, hashedPassword]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// User Login
app.post("/login", async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
        if (!user.rows.length) return res.status(400).json({ error: "User not found" });

        const isMatch = await bcrypt.compare(password, user.rows[0].password);
        if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

        const token = jwt.sign({ userId: user.rows[0].id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.json({ token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Middleware for authentication
const authMiddleware = (req, res, next) => {
    const token = req.header("Authorization");
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (err) {
        res.status(401).json({ error: "Invalid token" });
    }
};

// CRUD for Kanban Tasks
app.get("/tasks", authMiddleware, async (req, res) => {
    const tasks = await pool.query("SELECT * FROM tasks WHERE user_id = $1", [req.userId]);
    res.json(tasks.rows);
});

app.post("/tasks", authMiddleware, async (req, res) => {
    const { title, description, status } = req.body;
    const result = await pool.query(
        "INSERT INTO tasks (title, description, status, user_id) VALUES ($1, $2, $3, $4) RETURNING *",
        [title, description, status, req.userId]
    );
    res.json(result.rows[0]);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
