import UserModel from "../models/User.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

export const Register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password || !req.file) {
      return res.status(400).json({
        success: false,
        message: `${ 
          !name ? "Name" : !email ? "Email" : !password ? "Password" : "Profile"
        } is required`,
      });
    }

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const imagePath = `${baseUrl}/images/${req.file.filename}`;
    const hashedPassword = await bcryptjs.hash(password, 10);

    const newUser = new UserModel({
      name,
      email,
      password: hashedPassword,
      profile: imagePath,
    });

    const savedUser = await newUser.save();
    const token = jwt.sign({ id: savedUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV ==="production" ? "none" : "lax",
      maxAge : 7*24*60*60*1000
    });

    res.status(200).json({
      success: true,
      message: "User registered successfully",
      user: savedUser,
      token,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const Login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User does not exist",
      });
    }

    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    const userObj = user.toObject()
    delete userObj.password

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite : process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge:7*24*60*60*1000
    });



    res.status(200).json({
      success: true,
      message: "User logged in successfully",
      user:userObj,
      token
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const GetUser = async (req, res) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return res.status(200).json({ success: true, user: null});
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await UserModel.findById(decoded.id).select("-password");

    res.status(200).json({ success: true, user: user || null });

  } catch (error) {
    console.error(error.message)
    res.status(200).json({ success: true, user:null});
  }
};

export const Logout = (req, res) => {
  res.clearCookie("token",{
    httpOnly:true,
    secure:false,
    sameSite:"lax"
  });
  res.status(200).json({ success: true, message: "Logged out successfully" });
};

// authControllers.js
export const AllUsers = async (req, res) => {
  try {
    const users = await UserModel.find().select("-password");
    res.status(200).json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

