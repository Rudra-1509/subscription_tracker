import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env.js";
import User from "../models/user.model.js";

export const userAuthorize = async (req, res, next) => {
  try {
    let token;

    // ✅ 1️⃣ Extract Token
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Unauthorised" }); 
    }

    // ✅ 2️⃣ Decode & Verify Token
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: "Unauthorised" }); 
    }

    req.user = user;
    next(); // ✅ Move to the next middleware

  } catch (error) {
    return res.status(401).json({ message: "Unauthorised", error: error.message }); 
  }
};


export const adminAuthorize = async (req, res, next) => {
  try {
    let token;

    // ✅ 1️⃣ Extract Token
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // ✅ 2️⃣ Decode & Verify Token
    const decoded = jwt.verify(token, JWT_SECRET);
    const admin = await User.findById(decoded.userId);

    if (!admin) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // ✅ 3️⃣ Check if User is an Admin
    if (!admin || !decoded.isAdmin) {
      return res.status(403).json({ message: "Access Denied. Admins only." });
    }

    req.admin = admin;
    next(); // ✅ Move to the next middleware

  } catch (error) {
    return res.status(401).json({ message: "Unauthorized", error: error.message });
  }
};
