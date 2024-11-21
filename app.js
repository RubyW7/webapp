require("dotenv").config();
const sequelize = require("./config/db");
const express = require("express");
const userRoutes = require("./routes/userRoutes");
const healthRoutes = require("./routes/health");
const s3Routes = require("./routes/s3Routes");
const fileUpload = require("express-fileupload");
const logger = require("./utils/logger");
const User = require("./models/user");
const { dynamoDb, sns } = require("./utils/helper");

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());

app.use(express.json());
app.use("/healthz", healthRoutes);
app.use("/v1/user", s3Routes);
app.use(userRoutes);

logger.info("Configuring route for verifying user email");
app.use("/v1/verifyUserEmail", async (req, res) => {
  logger.info("Verifying user email");
  logger.info("Read Query Parameter email");
  let email = req.query.email;
  logger.info("Read Query Parameter token");
  let token = req.query.token;

  logger.info("Verifying email and token in dynamo db");
  const isValid = await dynamoDb.verifyUserToken(email, token);
  if (isValid) {
    logger.info("Email and token are valid");
    logger.info("Updating user details in database");
    const user = await User.findOne({ where: { email } });
    user.verified = true;
    user.verified_on = new Date();
    user.account_updated = new Date();
    try {
      await user.save();
    } catch (err) {
      logger.error(err);
      return res.status(500).json({
        message: "Internal server error",
      });
    }

    logger.info("Email verified successfully");
    res.status(200).json({
      message: "Email verified successfully",
    });
  } else {
    logger.info("Email or token is invalid");
    res.status(400).json({
      message: "Email or token is invalid",
    });
  }
});

module.exports = { app };
