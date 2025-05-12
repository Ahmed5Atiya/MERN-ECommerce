const express = require("express");
const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    description: {
      type: String,
      required: [true, "description is required"],
      trim: true,
    },
    rating: {
      type: Number,
      required: [true, "rating is required"],
      min: [1, "rating must be at least 1"],
      max: [5, "rating must be at most 5"],
    },
    product: {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
      required: [true, "product is required"],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Review = mongoose.model("Review", reviewSchema);
// const Product = mongoose.model("Product", ProductSchema);
module.exports = Review;
