import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    if (!token) {
      return res.status(401).json({ error: "Brak autoryzacji. Brak tokenu" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res
        .status(401)
        .json({ error: "Brak autoryzacji. Niewłaściwy token" });
    }
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res
        .status(401)
        .json({ error: "Brak autoryzacji. Brak użytkownika" });
    }
    req.user = user;
    next();
  } catch (error) {
    console.log("Error in protectRoute:", error.message);
    res.status(500).json({ error: "Błąd serwera" });
  }
};
