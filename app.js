require("dotenv").config();
const sequelize = require("./config/db");
const express = require("express");
const userRoutes = require("./routes/userRoutes");
const healthRoutes = require("./routes/health");

const app = express();

app.use(express.json());

app.use("/healthz", healthRoutes);
app.use(userRoutes);

sequelize
  .sync({ alter: true })
  .then(() => {
    console.log("Database synchronized");
    const PORT = 8080;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("Error synchronizing the database:", err);
  });
;;)))