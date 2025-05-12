const express = require("express");
const router = express.Router();
const {
  Signup,
  Login,
  VerifyEmail,
  forgetPassword,
  forgetPasswordCode,
  ResetPassword,
} = require("../Controller/auth");
const {
  SignupValidation,
  LoginValidation,
} = require("../validation/authValidation");
router.post("/signup", SignupValidation, Signup);
router.post("/verifyEmail", VerifyEmail);
router.post("/login", LoginValidation, Login);
router.post("/forgetPassword", forgetPassword);
router.post("/forgetPasswordCode", forgetPasswordCode);
router.put("/resetPassword", ResetPassword);

module.exports = router;
