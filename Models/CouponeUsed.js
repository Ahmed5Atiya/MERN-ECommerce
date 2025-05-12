const mongoose = require("mongoose");

const couponeUsageSchema = mongoose.Schema(
  {
    coupone: {
      type: mongoose.Schema.ObjectId,
      ref: "Coupone",
      required: true,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    usedAt: {
      type: Date,
      default: Date.now(),
    },
  },
  { timestamps: true }
);

const CouponeUsage = mongoose.model("CouponeUsage", couponeUsageSchema);
module.exports = CouponeUsage;
