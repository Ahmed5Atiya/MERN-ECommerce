const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "name is required"],
      trim: true,
      minLength: [3, "name must be at least 3 characters"],
      maxLength: [50, "name must be at most 50 characters"],
    },
    email: {
      type: String,
      required: [true, "email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "password is required"],
      minLength: [6, "password must be at least 6 characters"],
      maxLength: [1024, "password must be at most 1024 characters"],
    },
    phone: {
      type: String,
      unique: true,
      trim: true,
    },
    age: {
      type: Number,
      min: [0, "age must be at least 0"],
      max: [120, "age must be at most 120"],
    },
    image: {
      type: String,
      default:
        "https://res.cloudinary.com/dqj0v1x8g/image/upload/v1698231952/Default-User-Image.png",
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    verifyEmailCode: {
      type: String,
    },
    expiredEmailCode: {
      type: Date,
    },
    forgetPasswordCode: {
      type: String,
    },
    passwordChangeAt: {
      type: Date,
    },
    forgetPasswordCodeExpired: {
      type: Date,
    },
    wishList: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Product",
      },
    ],
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
  },
  {
    timestamps: true,
  }
);

// userSchema.pre("save", async function (next) {
//   this.password = await bcrypt.hash(this.password, 12);
//   next();
// });
const User = mongoose.model("User", userSchema);
module.exports = User;
