import mongoose from "mongoose";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../config/env.js";

export const signUp = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    //Logic to create a User

    const { name, email, password } = req.body;

    // ✅ 1️⃣ Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const message = "User already exists";
      const error = new Error(message);
      error.statusCode = 409;
      throw error;
    }

    // ✅ 2️⃣ Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // ✅ 3️⃣ Create new user instance and save with session
    const newUsers = await User.create(
      [{ name, email, password: hashedPassword }],
      { session }
    );

    // ✅ 4️⃣ Generate JWT token
    const token = jwt.sign({ userId: newUsers[0]._id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    // ✅ 5️⃣ Commit transaction and close session
    await session.commitTransaction();
    session.endSession();

    // ✅ 6️⃣ Send response
    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        token,
        user: newUsers[0],
      },
    });
  } catch (error) {
    // ❌ Ensure transaction is aborted in case of an error
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

export const signIn = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found. Please sign up." });
    }

    const isMatched = await bcrypt.compare(password, user.password);
    if (!isMatched) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // ✅ Include `isAdmin` in the token
    const token = jwt.sign(
      { userId: user._id, isAdmin: user.isAdmin }, 
      JWT_SECRET, 
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(200).json({
      success: true,
      message: "User signed in successfully.",
      data: { token, user }
    });

  } catch (error) {
    next(error);
  }
};


export const signOut = async (req, res, next) => {};
