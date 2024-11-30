const express = require("express");
const { body } = require("express-validator");
const authenticate = require("../middleware/auth");
const userController = require("../controllers/userController");

const router = express.Router();

//get user information with auth
router.get(
  "/v1/user/self",
  authenticate,
  userController.getUser,
);

// create new user
router.post(
  "/v1/user",
  body("email").isEmail().withMessage("Invalid email format"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  userController.createUser,
);

router.get("/v1/user/verifyUserEmail", userController.verifyUser);

// update user information with auth
router.put(
  "/v1/user/self",
  authenticate,
  body("email").optional().isEmail().withMessage("Invalid email format"),
  body("password")
    .optional()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  userController.updateUser,
);

router.head("/v1/user/*", (req, res) => {
  return res.status(405).send();
});

router.head("/v1/user", (req, res) => {
  return res.status(405).send();
});

router.all("/v1/user/*", (req, res) => {
  return res.status(405).send();
});

router.all("/v1/user", (req, res) => {
  return res.status(405).send();
});

module.exports = router;
