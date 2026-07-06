import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateTokenAndSetCookie } from "../lib/utils/generateToken.js";

export const signup = async (req, res) => {
  try {
    const { username, fullname, email, password } = req.body;

    console.log("USERNAME:", username);
    console.log("EMAIL:", email);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({ error: "Nieprawidłowy format adresu email." });
    }
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "Użytkownik juz istnieje." });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ error: "Email juz istnieje." });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Hasło powinno zawiera conajmniej 6 znakow." });
    }
    //hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      fullname,
      email,
      password: hashedPassword,
    });
    await newUser.save();
    generateTokenAndSetCookie(newUser._id, res);

    res.status(201).json({
      _id: newUser._id,
      username: newUser.username,
      fullname: newUser.fullname,
      email: newUser.email,
      followers: newUser.followers,
      following: newUser.following,
      profileImg: newUser.profileImg,
      coverImg: newUser.coverImg,
    });
  } catch (error) {
    console.log("Error in signup:", error.message);
    res.status(500).json({ error: "Błąd serwera" });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user?.password || "",
    );
    if (!user || !isPasswordCorrect) {
      return res.status(400).json({ error: "Błędny login lub hasło." });
    }
    generateTokenAndSetCookie(user._id, res);

    res.status(200).json({
      _id: user._id,
      username: user.username,
      fullname: user.fullname,
      email: user.email,
      followers: user.followers,
      following: user.following,
      profileImg: user.profileImg,
      coverImg: user.coverImg,
    });
  } catch (error) {
    console.log("Error in login:", error.message);
    res.status(500).json({ error: "Błąd serwera" });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Wylogowano pomyslnie." });
  } catch (error) {
    console.log("Error in logout:", error.message);
    res.status(500).json({ error: "Błąd serwera" });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.status(200).json(user);
  } catch (error) {
    console.log("Error in getMe:", error.message);
    res.status(500).json({ error: "Błąd serwera" });
  }
};
