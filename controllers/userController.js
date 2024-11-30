const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const logger = require("../utils/logger");
const statsDClient = require("../utils/metrics");
const AWS = require("aws-sdk");
const uuid = require("uuid");
const { DATE } = require("sequelize");

var dynamoDb = new AWS.DynamoDB({
  apiVersion: "2012-08-10",
  region: process.env.AWS_REGION || "us-east-1",
});

var sns = new AWS.SNS({});

exports.getUser = async (req, res) => {
  const start = process.hrtime.bigint();
  logger.info("GET: ENTERING getUser controller method");
  statsDClient.increment("endpoints.request.getUser.hit");
  try {
    if (Object.keys(req.query).length > 0) {
      logger.warn("GET: Invalid query parameters in getUser");
      statsDClient.increment("endpoints.findUser.fail.getUser");
      return res
        .status(400)
        .send({ message: "Query parameters are not allowed" });
    }

    const user = req.user;
    res.header("Accept", "application/json");
    statsDClient.increment("endpoints.getUser.success");
    const duration = process.hrtime.bigint() - start;
    statsDClient.timing(
      "endpoints.timing.getUser",
      Number(duration / 1000000n),
    );
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
    statsDClient.increment("endpoints.findUser.failure.getUser");
    console.error("Error fetching user information:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.createUser = async (req, res) => {
  const start = process.hrtime.bigint();
  logger.info("POST: ENTERING createUser controller method");
  statsDClient.increment("endpoints.createUser.hit");
  if (Object.keys(req.query).length > 0) {
    logger.warn("POST: createUser called with query parameters");
    return res
      .status(400)
      .json({ message: "Query parameters are not allowed" });
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn("POST: Validation errors in createUser");
    statsDClient.increment("endpoints.createUser.fail.validationError");
    return res.status(400).json({ errors: errors.array() });
  }

  const { first_name, last_name, email, password } = req.body;
  try {
    logger.info("Adding user to dynamo db");
    let userToken = uuid.v4();
    // add user token to dynamo db

    // find epoch time of 300 seconds from now
    let epochTime = new Date().getTime();

    let params = {
      TableName: "csye6225",
      Item: {
        username: {
          S: email,
        },
        usertoken: {
          S: userToken,
        },
        tokenttl: {
          N: epochTime.toString(),
        },
      },
    };
    await dynamoDb.putItem(params).promise();
    // publish messgae to SNS
    const message = {
      first_name: first_name,
      last_name: last_name,
      email: email,
      userToken: userToken,
      action: "verifyEmail",
    };

    logger.info("Sending message to Amazon SNS");
    const snsparams = {
      Message: JSON.stringify(message),
      TopicArn: process.env.SNS_TOPIC_ARN,
    };

    sns.publish(snsparams, function (err, data) {
      if (err) {
        console.log("Error", err.stack);
      } else {
        console.log("Success", data.MessageId);
      }
    });

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      logger.warn("POST: User already exists - createUser");
      statsDClient.increment("endpoints.createUserfail.userExists");
      return res.status(400).json({ message: "User already exists" });
    }

    const newUser = await User.create({
      first_name,
      last_name,
      email,
      password,
    });

    res.header("Accept", "application/json");
    const duration = process.hrtime.bigint() - start;
    statsDClient.timing(
      "endpoints.timing.createUser",
      Number(duration / 1000000n),
    );
    statsDClient.increment("endpoints.createUser.success");
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
    statsDClient.increment("endpoints.createUser.failure.errorCreateUser");
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.updateUser = async (req, res) => {
  logger.info("PUT: ENTERING updateUser controller method");
  statsDClient.increment("endpoints.updateUser.hit");
  if (Object.keys(req.query).length > 0 || Object.keys(req.body).length === 0) {
    logger.warn("PUT: Invalid request in updateUser");
    statsDClient.increment("endpoints.updateUser.fail.requestValidation");
    return res.status(400).send({ message: "Invalid request parameters" });
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn("PUT: Validation errors in updateUser");
    statsDClient.increment("endpoints.updateUser.fail.validationError");
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
    statsDClient.increment("endpoints.updateUser.success");
    return res.status(204).send();
  } catch (error) {
    logger.error("PUT: Error updating user information");
    console.error("Error updating user information:", error);
    statsDClient.increment("endpoints.updateUser.failure.update");
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.verifyUser = async (req, res) => {
  logger.info("Verifying user email");
  logger.info("Read Query Parameter email");
  let email = req.query.email;
  logger.info("Read Query Parameter token");
  let token = req.query.token;

  const user = await User.findOne({ where: { email } });
  if (user && user.verified) {
    res.status(202).send({
      message: "Already verified",
    });
  } else {
    var params = {
      TableName: "csye6225",
      Key: {
        username: {
          S: email,
        },
        usertoken: {
          S: token,
        },
      },
    };

    dynamoDb.getItem(params, async function (err, data) {
      if (err) {
        res.status(400).send({
          message: "unable to verify",
        });
      } else {
        console.log("Success dynamo getItem", data.Item);
        try {
          const ttl = data.Item ? data.Item.tokenttl.N : null;
          if (!ttl) {
            console.log("No tto found or item is missing");
            res.status(404).send({ message: "Token ttl not found" });
          }
          const now = new Date();
          const currentTime = now.getTime();
          const timeDiff = (currentTime - ttl) / 60000;

          if (timeDiff >= 5) {
            return res.status(400).send({
              message: "Token expired!",
            });
          }

          if (data.Item.username.S !== email) {
            return res.status(400).send({
              message: "Token and email did not match",
            });
          }

          const result = await User.update(
            { verified: true },
            { where: { id: user.id } },
          );

          if (result == 1) {
            return res.status(200).send({ message: "Successfully verified " });
          } else {
            return res.status(400).send({ message: "Unable t overify" });
          }
        } catch (err) {
          console.log("-------------");
          console.log(err);
          return res.status(500).send({ message: "Error updating the user" });
        }
      }
    });
  }
};
