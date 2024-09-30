const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const secret_key = "ABC";
//  Register a new user
// POST /api/users/register
const registerUser = async (req, res) => {
  const { name, email, password, isAdmin } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    } else {
      const securePassword = await bcrypt.hash(password, 10);
      const user = await User.create({
        name,
        email,
        password: securePassword,
        isAdmin,
      });
      const data = { user: user.id };
      const token = jwt.sign(data, secret_key);
      res.status(200).json({
        message: "Registration successful.Please Sign in now",
        token,
        user
      });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//  Login a user
// POST /api/users/login
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    } else {
      const comparePassword = await bcrypt.compare(password, user.password);

      if (!comparePassword) {
        res.status(400).json({ message: "invalid password" });
      } else {
        const data = { user: user.id };
        const token = jwt.sign(data, secret_key);
        res.status(200).json({ message: "login successfull", token, user });
      }
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//  Get user data by admin  (protected)
// @route GET /api/users/me
const getMe = async (req, res) => {
  let user = await User.find();
  let filter = user.filter((ele) => ele._id.toString() !== req.user);

  res.json(filter);
};

module.exports = { registerUser, loginUser, getMe };
