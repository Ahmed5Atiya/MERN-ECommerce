const express = require("express");
const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
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
  },
  {
    timestamps: true,
    versionKey: false,
  }
);
const Product = mongoose.model("Product", ProductSchema);
module.exports = Product;
