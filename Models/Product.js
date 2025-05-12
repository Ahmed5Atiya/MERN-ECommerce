const express = require("express");
const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "name is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "description is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "price is required"],
      min: [0, "price must be at least 0"],
    },
    quantity: {
      type: Number,
      required: [true, "quantity is required"],
      min: [0, "quantity must be at least 0"],
    },
    sold: Number,
    // category: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Category",
    //   required: [true, "category is required"],
    // },
    category: {
      type: String,
      required: [true, "category is required"],
    },
    image: {
      type: String,
      default:
        "https://res.cloudinary.com/dqj0v1x8g/image/upload/v1698231952/Default-User-Image.png",
      required: [true, "image is required"],
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);
const Product = mongoose.model("Product", ProductSchema);
module.exports = Product;
