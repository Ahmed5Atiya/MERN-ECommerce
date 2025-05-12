const mongoose = require("mongoose");

const orderSchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.ObjectId, ref: "User" },
    cartItems: [
      {
        product: {
          type: mongoose.Schema.ObjectId,
          ref: "Product",
        },
        quantity: {
          type: Number,
        },
        price: Number,
      },
    ],
    paymentType: {
      type: String,
      enum: ["cash", "card"],
      default: "cash",
    },
    isDrived: {
      type: Boolean,
      default: false,
    },
    isDrivedAt: Date,
    taxPrice: {
      type: Number,
      default: 0,
    },
    shippingPrice: {
      type: Number,
      default: 0,
    },
    shippingAddress: {
      detalis: String,
      phone: String,
      city: String,
      postalCode: String,
    },
    totalOrderPrice: {
      type: Number,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    isPaidAt: Date,
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
