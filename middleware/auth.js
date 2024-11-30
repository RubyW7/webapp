// authMiddleware.js
const User = require("../models/user");
const bcrypt = require("bcrypt");

const authenticate = async (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Basic ")) {
    return res
      .status(401)
      .json({ message: "Authorization header missing or invalid" });
  }

  const token = authHeader.split(" ")[1];
  const credentials = Buffer.from(token, "base64").toString("utf8");
  const [email, password] = credentials.split(":");

  try {
    const user = await User.findOne({ where: { email } });

    if (!user || !user.verified) {
      return res.status(404).json({ message: "User not found" });
    }

    if (
      user &&
      user.verified &&
      (await bcrypt.compare(password, user.password))
    ) {
      req.user = user;
      return next();
    }

    return res.status(401).json({ message: "Invalid credentials" });
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = authenticate;
