// controllers/authController.js
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { CommandStartedEvent } from "mongodb";

export const signup = async (req, res) => {
  const { fullName, firstName, lastName, username, email, password, referralCode, phone } = req.body;
  try {

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already exists" });

    // Check if username already exists
    if (username) {
      const existingUsername = await User.findOne({ username });
      if (existingUsername) return res.status(400).json({ message: "Username already exists" });
    }

        // -----------------------------
    // 🔥 Generate unique tempId here
    // -----------------------------
    let tempId;
    let exists = true;

    while (exists) {
      tempId = Math.floor(100000 + Math.random() * 900000); // 6-digit number
      exists = await User.exists({ tempId });
    }
    // -----------------------------

    // const hashed = await bcrypt.hash(password, 10);

    const role = "user";
    const status = "active";
    const balance = 0;

    console.log(fullName, firstName, lastName, username, email, password, referralCode, role, status, phone)

    const user = await User.create({ fullName, firstName, lastName, username, email, password, phone, referrelBy: referralCode, role, status, balance, tempId});
    console.log("signup user : ", user);

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.json({ user: { id: user._id, fullName, firstName, lastName, username, email }, token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    console.log("Login Runned")

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    console.log("user : ",user)

    // for now doesnt bycript
    // const isMatch = await bcrypt.compare(password, user.password);
    
    const isMatch = password === user.password;

    console.log(isMatch)
    
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    if (user.status == "inactive") return res.status(400).json({message: "Account not activated"});
    console.log(user.status)

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    // console.log({ user: { id: user._id, fullName: user.fullName, email }, token })
    res.json({
        user: { 
            id: user._id,
            fullName: user.fullName,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            email: user.email,
            phone: user.phone,
            role: user.role,
            status: user.status,
            remaining: user.remaining,
            balance: user.balance,
            earning: user.earning,
            plan: user.plan,
            tempId: user.tempId
            }, 
        token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};