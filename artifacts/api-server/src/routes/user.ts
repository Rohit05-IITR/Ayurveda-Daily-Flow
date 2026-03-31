import { Router } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User";

const userRouter = Router();

/* ── REGISTER ── */
userRouter.post("/register", async (req, res) => {
  try {
    const { name, age, email, goal, password } = req.body as {
      name: string;
      age: number;
      email: string;
      goal: string;
      password: string;
    };

    if (!name || !age || !email || !goal || !password) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    const existing = await User.findOne({ email });
    if (existing) {
      res.status(409).json({ message: "User already exists" });
      return;
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ name, age, email, goal, password: hashed });
    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ message: "Registration failed", error: String(err) });
  }
});

/* ── LOGIN ── */
userRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body as {
      email: string;
      password: string;
    };

    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      res.status(401).json({ message: "Invalid password" });
      return;
    }

    res.status(200).json({
      message: "Login successful",
      user: {
        name:     user.name,
        email:    user.email,
        age:      user.age,
        goal:     user.goal,
        prakriti: user.prakriti,
        guna:     user.guna,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: String(err) });
  }
});

/* ── SAVE USER (update prakriti + guna after assessments) ── */
userRouter.post("/saveUser", async (req, res) => {
  try {
    const { email, prakriti, guna } = req.body as {
      email: string;
      prakriti: string;
      guna: string;
    };

    await User.findOneAndUpdate(
      { email },
      { prakriti, guna },
      { upsert: false },
    );

    res.status(200).json({ message: "User saved successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error saving user", error: String(err) });
  }
});

export default userRouter;
