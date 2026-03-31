import { Router } from "express";
import User from "../models/User";

const userRouter = Router();

userRouter.post("/saveUser", async (req, res) => {
  try {
    const { name, age, email, goal, prakriti, guna } = req.body as {
      name: string;
      age: number;
      email: string;
      goal: string;
      prakriti: string;
      guna: string;
    };

    const user = new User({ name, age, email, goal, prakriti, guna });
    await user.save();

    res.status(201).json({ message: "User saved successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error saving user", error: String(err) });
  }
});

export default userRouter;
