const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const logger = require("../utils/logger");
const statsDClient = require("../utils/metrics");

exports.getUser = async (req, res) => {
  logger.info("GET: ENTERING getUser controller method");
  statsDClient.increment("endpoints.request.http.get.getUser");
  try {
    if (Object.keys(req.query).length > 0) {
      logger.warn("GET: Invalid query parameters in getUser");
      statsDClient.increment("endpoints.response.http.get.fail.getUser");
      return res
        .status(400)
        .send({ message: "Query parameters are not allowed" });
    }

    const user = req.user;
    res.header("Accept", "application/json");
    statsDClient.increment("endpoints.response.http.get.success.getUser");
    return res.status(200).json({
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      account_created: user.account_created,
      account_updated: user.account_updated,
    });
  } catch (error) {
    logger.error(`GET: getUser error - ${error}`);
    statsDClient.increment("endpoints.response.http.get.failure.getUser");
    console.error("Error fetching user information:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.createUser = async (req, res) => {
  logger.info("POST: ENTERING createUser controller method");
  statsDClient.increment("endpoints.request.http.post.createUser");
  if (Object.keys(req.query).length > 0) {
    logger.warn("POST: createUser called with query parameters");
    return res
      .status(400)
      .json({ message: "Query parameters are not allowed" });
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn("POST: Validation errors in createUser");
    statsDClient.increment(
      "endpoints.response.http.post.fail.validationError.createUser",
    );
    return res.status(400).json({ errors: errors.array() });
  }

  const { first_name, last_name, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      logger.warn("POST: User already exists - createUser");
      statsDClient.increment(
        "endpoints.response.http.post.fail.userExists.createUser",
      );
      return res.status(400).json({ message: "User already exists" });
    }

    const newUser = await User.create({
      first_name,
      last_name,
      email,
      password,
    });
    res.header("Accept", "application/json");
    statsDClient.increment("endpoints.response.http.post.success.createUser");
    return res.status(201).json({
      id: newUser.id,
      first_name: newUser.first_name,
      last_name: newUser.last_name,
      email: newUser.email,
      account_created: newUser.account_created,
      account_updated: newUser.account_updated,
    });
  } catch (error) {
    logger.error("POST: Error creating user");
    console.error("Error creating user:", error);
    statsDClient.increment("endpoints.response.http.post.failure.createUser");
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.updateUser = async (req, res) => {
  logger.info("PUT: ENTERING updateUser controller method");
  statsDClient.increment("endpoints.request.http.put.updateUser");
  if (Object.keys(req.query).length > 0 || Object.keys(req.body).length === 0) {
    logger.warn("PUT: Invalid request in updateUser");
    statsDClient.increment(
      "endpoints.response.http.put.fail.requestValidation.updateUser",
    );
    return res.status(400).send({ message: "Invalid request parameters" });
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn("PUT: Validation errors in updateUser");
    statsDClient.increment(
      "endpoints.response.http.put.fail.validationError.updateUser",
    );
    return res.status(400).send({ errors: errors.array() });
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
    statsDClient.increment("endpoints.response.http.put.success.updateUser");
    return res.status(204).send();
  } catch (error) {
    logger.error("PUT: Error updating user information");
    console.error("Error updating user information:", error);
    statsDClient.increment("endpoints.response.http.put.failure.updateUser");
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
