const { check } = require("express-validator");
const validationResultMiddleware = require("../middleware/validationMiddleware");
const User = require("../Models/User");

// exports.SignupValidation = [
//   check("name")
//     .notEmpty()
//     .withMessage("name is required")
//     .isLength({ min: 3 })
//     .withMessage("the min length for the name is 3")
//     .isLength({ max: 30 })
//     .withMessage("the max length for the name is 30"),
//   check("email")
//     .notEmpty()
//     .withMessage("email should be provided")
//     .isEmail()
//     .withMessage("Invalid email")
//     .custom((email) => {
//       console.log(email);
//       User.findOne({ email: email }).then((user) => {
//         if (user) {
//           return Promise.reject(
//             new Error("the email address are already is used")
//           );
//         }
//       });
//     }),
//   check("password")
//     .notEmpty()
//     .withMessage("password should me provided")
//     .isLength({ min: 8 })
//     .withMessage("the min length for the password is 8")
//     .isLength({ max: 30 })
//     .withMessage("the max length for the password is 30")
//     .custom((password) => {
//       console.log(req.body.confirmPassword);
//       if (password !== req.body.confirmPassword) {
//         return Promise.reject(
//           new Error("the password and confirmPassword not match")
//         );
//       }
//       return true;
//     }),
//   check("confirmPassword")
//     .notEmpty()
//     .withMessage("password should me provided"),
//   // .isLength({ min: 8 })
//   // .withMessage("the min length for the password is 8")
//   // .isLength({ max: 30 })
//   // .withMessage("the max length for the password is 30"),
//   check("phone")
//     .notEmpty()
//     .withMessage("password should me provided")
//     .isMobilePhone("ar-EG")
//     .withMessage("invalid mopile phone for this rejon"),

//   check("age").isNumeric().withMessage("the age should be number "),
//   validationResultMiddleware,
// ];
exports.SignupValidation = [
  check("name")
    .notEmpty()
    .withMessage("name is required")
    .isLength({ min: 3 })
    .withMessage("the minimum length for the name is 3")
    .isLength({ max: 30 })
    .withMessage("the maximum length for the name is 30"),
  check("email")
    .notEmpty()
    .withMessage("email should be provided")
    .isEmail()
    .withMessage("Invalid email")
    .custom(async (email) => {
      const user = await User.findOne({ email });
      if (user) {
        throw new Error("the email address is already used");
      }
      return true;
    }),
  check("password")
    .notEmpty()
    .withMessage("password should be provided")
    .isLength({ min: 8 })
    .withMessage("the minimum length for the password is 8")
    .isLength({ max: 30 })
    .withMessage("the maximum length for the password is 30")
    .custom((password, { req }) => {
      if (password !== req.body.confirmPassword) {
        throw new Error("the password and confirmPassword do not match");
      }
      return true;
    }),
  check("confirmPassword")
    .notEmpty()
    .withMessage("confirmPassword should be provided")
    .isLength({ min: 8 })
    .withMessage("the minimum length for the confirmPassword is 8")
    .isLength({ max: 30 })
    .withMessage("the maximum length for the confirmPassword is 30"),
  check("phone")
    .notEmpty()
    .withMessage("phone should be provided")
    .isMobilePhone("ar-EG")
    .withMessage("invalid mobile phone for this region"),
  check("age").isNumeric().withMessage("the age should be a number"),
  validationResultMiddleware,
];
exports.LoginValidation = [
  check("email")
    .notEmpty()
    .withMessage("email should be provided")
    .isEmail()
    .withMessage("Invalid email"),
  check("password")
    .notEmpty()
    .withMessage("password should me provided")
    .isLength({ min: 8 })
    .withMessage("the min length for the password is 8")
    .isLength({ max: 30 })
    .withMessage("the max length for the password is 30"),
  validationResultMiddleware,
];
