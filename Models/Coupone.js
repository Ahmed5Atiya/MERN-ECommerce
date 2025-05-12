const mongoose = require("mongoose");

const couponeSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    discount: {
      type: Number,
      required: true,
    },

    limitCount: {
      type: Number,
      default: 50,
    },
    expireDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Coupone = mongoose.model("Coupone", couponeSchema);
module.exports = Coupone;
