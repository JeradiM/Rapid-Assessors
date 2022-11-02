const express = require("express");
const {
  registerUser,
  loginUser,
  logoutUser,
  getUser,
  loginStatus,
  updateUser,
  updatePassword,
  forgotPassword,
  resetPassword,
} = require("../controllers/userController");
const protect = require("../middleWare/authMiddleWare");
const router = express.Router();

// const registerUser = () => {}; // dummy function so that there is no bug

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/logout", logoutUser);
router.get("/getuser", protect, getUser);
router.get("/loggedin", loginStatus);
router.patch("/updateuser", protect, updateUser);
router.patch("/changepassword", protect, updatePassword);
router.post("/forgotpassword", forgotPassword);
router.put("/resetpassword/:resetToken",resetPassword);

module.exports = router;