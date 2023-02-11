import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import asyncHandler from "express-async-handler";
import { User } from "../models/UserModel.js";
import dotenv from "dotenv";
dotenv.config();

export const registerUser = asyncHandler(async (req, res) => {
  const registrationData = req.body;
  const { email } = registrationData;

  const encPassword = await bcrypt.hash(req.body.password, 10);
  const encryptedData = { ...registrationData, password: encPassword };

  if (
    !registrationData.name ||
    !registrationData.email ||
    !registrationData.password
  ) {
    res.status(400);
    throw new Error("Please enter all the fields");
  }
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const user = await User.create({ ...encryptedData });
  console.log(user);

  if (user) {
    const { _id } = user;
    const token = jwt.sign({ _id }, process.env.KEY);
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      pic: user.pic,
      token: token,
    });
  } else {
    res.status(400);
    throw new Error("Unable to process the request");
  }
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error("Please enter all the fields");
  }
  const user = await User.findOne({ email });

  const isPwdValid = user && (await bcrypt.compare(password, user.password));
  if (user && isPwdValid) {
    const { id } = user;
    const token = jwt.sign({ id }, process.env.KEY);
    res.status(200).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      pic: user.pic,
      token: token,
    });
  } else {
    res.status(400);
    throw new Error("Login Failed, incorrect password");
  }
});

export const allUsers = asyncHandler(async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};
  const users = await User.find(keyword)
    .find({ _id: { $ne: req.user._id } })
    .select("-password");
  res.send(users);
});
