const { JsonWebTokenError } = require("jsonwebtoken");
const ApiError = require("../global/globalApiError");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const User = require("../Models/User");
const sendEmailCode = require("../utils/sendEmailCode");
const jwt = require("jsonwebtoken");
const generateToken = (payload) => {
  return jwt.sign({ userId: payload }, process.env.SECRET_KEY, {
    expiresIn: "1d",
  });
};

const Signup = async (req, res, next) => {
  // 1- check if user aready exist
  const { name, email, password, phone, age } = req.body;
  let user = await User.findOne({ email: req.body.email });
  console.log("this is the user ", user);
  if (user) {
    return next(new ApiError("User already exists", 400));
  }
  // 2- create the user and save it in database
  user = await User.create({
    name,
    email,
    password: await bcrypt.hash(password, 12),
    phone,
    age,
  });

  // 3- create the 6 random number and send to email and sace in the hash for this random number
  const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
  // here hash the resetCode using the crypto
  const hashVerifyCode = crypto
    .createHash("sha256")
    .update(verifyCode)
    .digest("hex");
  user.verifyEmailCode = hashVerifyCode;
  user.expiredEmailCode = Date.now() + 10 * 60 * 1000;

  // create the message to send with code for the user
  const message = `Hi  ${user.name} , \n we send  your reset code form E-commerce website reset cose is \n ${verifyCode} \n please enter your reset code in website`;
  await user.save();
  try {
    await sendEmailCode({
      email: user.email,
      subject: "this is the code verification",
      message: message,
    });
  } catch (e) {
    user.verifyEmailCode = undefined;
    user.expiredEmailCode = undefined;
  }

  // 4- generate the token and send to user the detalis
  const token = generateToken(user._id);
  // send the code for my email to make active is true
  res.status(201).json({
    message: "Code send to your email",
    data: {
      token,
    },
  });
};
const VerifyEmail = async (req, res, next) => {
  // 1- get the token and check if this token is valid
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(new ApiError("You Should signup frist ", 401));
  }
  // 2- check if the user with this token is exist
  const decodedId = jwt.verify(token, process.env.SECRET_KEY);
  const hashedVerifyCode = crypto
    .createHash("sha256")
    .update(req.body.code)
    .digest("hex");
  const user = await User.findById({
    _id: decodedId.userId,
    verifyEmailCode: hashedVerifyCode,
    expiredEmailCode: { $gt: Date.now() },
  });
  // 3- check if the code is expired or not
  if (!user) {
    return next(new ApiError("Your code is expired or invalid", 400));
  }
  user.isActive = true;
  user.verifyEmailCode = undefined;
  user.expiredEmailCode = undefined;
  await user.save({ validateBeforeSave: false });
  const userToken = generateToken(user._id);
  // 4- hash the 6 number and compers with the number saved in db
  res.status(200).json({
    status: "success",
    data: {
      user,
      token: userToken,
    },
  });
};
const Login = async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    return next(new ApiError("invalid email or password", 404));
  }
  const token = generateToken(user._id);
  res.status(201).json({
    message: "Successfuly login ",
    user,
    token,
  });
};

const forgetPassword = async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new ApiError("this email not exist", 404));
  }

  // 3- create the 6 random number and send to email and sace in the hash for this random number
  const emailCode = Math.floor(100000 + Math.random() * 900000).toString();
  // here hash the resetCode using the crypto
  const hashEmailCode = crypto
    .createHash("sha256")
    .update(emailCode)
    .digest("hex");
  user.forgetPasswordCode = hashEmailCode;
  user.forgetPasswordCodeExpired = Date.now() + 10 * 60 * 1000;
  const message = `Hi  ${user.name} , \n we send  your reset code form E-commerce website reset cose is \n ${emailCode} \n please enter your reset code in website`;
  await user.save();
  try {
    await sendEmailCode({
      email: user.email,
      subject: "this is the code verification",
      message: message,
    });
  } catch (e) {
    user.forgetPasswordCode = undefined;
    user.forgetPasswordCodeExpired = undefined;
  }
  console.log("this is the code ", emailCode);
  console.log("this is the code ", hashEmailCode);
  const token = generateToken(user._id);
  res.status(201).json({
    message: "Code Send To Email Successfuly",
    token: token,
  });
};

const forgetPasswordCode = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else {
    return next(new ApiError("Should enter your Email frist", 402));
  }
  let { code } = req.body;
  const decodeId = jwt.verify(token, process.env.SECRET_KEY);
  const hashEmailCode = crypto.createHash("sha256").update(code).digest("hex");
  const user = await User.findOne({
    id: decodeId._id,
    forgetPasswordCode: hashEmailCode,
    forgetPasswordCodeExpired: { $gt: Date.now() },
  });
  if (!user) {
    return next(new ApiError("user not valid or expired code time", 404));
  }
  user.forgetPasswordCode = undefined;
  user.forgetPasswordCodeExpired = undefined;
  await user.save({ validateBeforeSave: false });
  res.status(202).json({
    message: "Code submit Successfuly",
  });
};

const ResetPassword = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else {
    return next(new ApiError("Should enter your Email frist", 402));
  }

  const decodeId = jwt.verify(token, process.env.SECRET_KEY);
  const user = await User.findById({ _id: decodeId.userId });

  if (!user) {
    return next(new ApiError("user not valid or expired code time", 404));
  }
  if (!user.forgetPasswordCode) {
    return next(new ApiError("you should enter the code frist", 404));
  }
  if (!user.forgetPasswordCodeExpired) {
    return next(new ApiError("your code is expired", 404));
  }
  user.passwordChangeAt = Date.now();
  user.password = await bcrypt.hash(req.body.password, 12);
  await user.save({ validateBeforeSave: false });
  // here i will create the token for the user
  res.status(202).json({ message: "Password Change Successfuly" });
};
const Protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new ApiError("You are not authorization ", 401));
  }
  const decodedId = jwt.verify(token, process.env.SECRET_KEY);

  const user = await User.findOne({ _id: decodedId.userId });
  if (!user) {
    return next(new ApiError("the user no exist", 404));
  }
  // check if user change the password after the token is issued
  if (user.passwordChangeAt) {
    const passwordUpdateTime = user.passwordChangeAt.getTime() / 1000;
    if (passwordUpdateTime > decodedId.iat) {
      return next(new ApiError(401, "user recently changed the password"));
    }
  }
  req.user = user;
  next();
};

const allowTo =
  (...values) =>
  (req, res) => {
    const role = req.user.role;
    if (!values.includes(role)) {
      return next(new ApiError("You Are Not Allow to access this route"));
    }
    next();
  };
// Export as named exports
module.exports = {
  Signup,
  Login,
  VerifyEmail,
  Protect,
  forgetPassword,
  forgetPasswordCode,
  ResetPassword,
  allowTo,
};
