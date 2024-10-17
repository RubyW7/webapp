require("dotenv").config();
const sequelize = require("./config/db");
const express = require("express");
const userRoutes = require("./routes/userRoutes");
const healthRoutes = require("./routes/health");

const app = express();

app.use(express.json());
app.use("/healthz", healthRoutes);
app.use(userRoutes);

module.exports = app;
