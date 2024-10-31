require("dotenv").config();
const sequelize = require("./config/db");
const express = require("express");
const userRoutes = require("./routes/userRoutes");
const healthRoutes = require("./routes/health");
const s3Routes = require("./routes/s3Routes");
const fileUpload = require("express-fileupload");

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());

app.use(express.json());
app.use("/healthz", healthRoutes);
app.use("/v1/user", s3Routes);
app.use(userRoutes);

module.exports = app;
