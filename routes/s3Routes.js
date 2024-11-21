const express = require("express");
const authenticate = require("../middleware/auth");
const ensureVerified = require("../middleware/ensureVerified");

const {
  deleteProfilePic,
  uploadProfilePic,
  getProfilePic,
} = require("../controllers/ImageController");

const routes = express.Router();

routes.get("/ping", (req, res) => {
  console.info("OK!");
  res.status(200).json({ message: "OK!" });
});
routes.post("/self/pic", authenticate, ensureVerified, uploadProfilePic);
routes.get("/self/pic", authenticate, ensureVerified, getProfilePic);
routes.delete("/self/pic", authenticate, ensureVerified, deleteProfilePic);

module.exports = routes;
