import { generateToken } from "../lib/utils.js";
import prisma from "../lib/prisma.js";
import bcrypt from "bcryptjs";

export const signup = async (req, res) => {
  const { username, email, password } = req.body;
  console.log("Received signup request with:", { username, email, password });

  try {
    if (!username || !email || !password) {
      console.log("Missing required fields");
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      console.log("Password too short");
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    console.log("Checking if user already exists with email:", email);
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (user) {
      console.log("Email already exists:", email);
      return res.status(400).json({ message: "Email already exists" });
    }

    console.log("Hashing password...");
    const salt = await bcrypt.genSalt(10);
    console.log("Generated salt:", salt);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log("Hashed password:", hashedPassword);

    console.log("Creating new user in database...");
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    console.log("New user created:", newUser);

    if (newUser) {
      console.log("Generating JWT token for user ID:", newUser.id);
      // generate jwt token here
      generateToken(newUser.id, res);

      res.status(201).json({
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
      });
    } else {
      console.log("User creation failed");
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.log("Error in signup controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: {
        email,
        }
      });

    if (!user) {
      return res.status(400).json({ message: "User Does not Exist!" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials!" });
    }

    generateToken(user.id, res);

    res.status(200).json({
      id: user.id,
      username: user.username,
      email: user.email,
      createdAt:user.createdAt,
    });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};