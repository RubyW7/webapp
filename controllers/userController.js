const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const User = require("../models/user");

exports.getUser = async (req, res) => {
  try {
    if (Object.keys(req.query).length > 0) {
      return res.status(400).send();
    }

    const user = req.user;

    res.header("Accept", "application/json");

    return res.status(200).json({
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      account_created: user.account_created,
      account_updated: user.account_updated,
    });
  } catch (error) {
    console.error("Error fetching user information:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.createUser = async (req, res) => {
  if (Object.keys(req.query).length > 0) {
    return res
      .status(400)
      .json({ message: "Bad Request: Query parameters are not allowed" });
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { first_name, last_name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const newUser = await User.create({
      first_name,
      last_name,
      email,
      password,
    });

    res.header("Accept", "application/json");

    return res.status(201).json({
      id: newUser.id,
      first_name: newUser.first_name,
      last_name: newUser.last_name,
      email: newUser.email,
      account_created: newUser.account_created,
      account_updated: newUser.account_updated,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.updateUser = async (req, res) => {
  if (Object.keys(req.query).length > 0 || Object.keys(req.body).length === 0) {
    return res.status(400).send();
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).send();
  }

  const { first_name, last_name, email, password } = req.body;

  try {
    const user = req.user;

    const updatedUserData = {
      first_name: first_name || user.first_name,
      last_name: last_name || user.last_name,
      email: email || user.email,
      account_updated: new Date(),
    };

    if (password) {
      const salt = await bcrypt.genSalt(10);
      updatedUserData.password = await bcrypt.hash(password, salt);
    }

    await User.update(updatedUserData, { where: { id: user.id } });

    return res.status(204).send();
  } catch (error) {
    console.error("Error updating user information:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
