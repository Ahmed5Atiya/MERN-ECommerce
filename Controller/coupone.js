const ApiError = require("../global/globalApiError");
const Coupone = require("../models/Coupone");
const CouponUsage = require("../Models/CouponeUsed");
const cartSchema = require("../models/Cart");

// @desc    Apply coupon to cart
// @route   POST /api/v1/cart/coupon
// @access  Private only user

const applayCoupone = async (req, res, next) => {
  // Find the coupon
  const coupon = await Coupone.findOne({
    name: req.body.coupone,
    expire: { $gt: Date.now() },
    isActive: true,
    limitCount: { $gt: 0 },
  });
  if (!coupon) {
    return next(ApiError.create("Invalid coupon name or expired", 404, "fail"));
  }

  // Find the user's cart
  const cart = await cartSchema.findOne({ user: req.user._id });
  if (!cart) {
    return next(ApiError.create("No cart found for you", 404, "fail"));
  }

  // Check if the user has already used this coupon
  const existingUsage = await CouponUsage.findOne({
    user: req.user._id,
    coupon: coupon._id,
  });
  if (existingUsage) {
    return next(
      ApiError.create("You have already used this coupon", 400, "fail")
    );
  }

  // Record coupon usage
  try {
    await CouponUsage.create({
      user: req.user._id,
      coupon: coupon._id,
    });
    // Decrease the limit count of the coupon
    coupon.limitCount -= 1;
    await coupon.save();
  } catch (err) {
    if (err.code === 11000) {
      return next(
        ApiError.create("You have already used this coupon", 400, "fail")
      );
    }
    throw err; // Handle other errors
  }

  // Apply the discount
  const totalPrice = cart.totalPrice;
  const totalPriceAfterCoupon = (
    totalPrice -
    (totalPrice * coupon.discound) / 100
  ).toFixed(2);
  cart.totalPriceAfterDiscound = totalPriceAfterCoupon;
  await cart.save();

  res.status(200).json({
    message: "Coupon applied successfully",
    totalItems: cart.cartItems.length,
    data: cart,
  });
};

// @desc    Remove coupon from cart
// @route   DELETE /api/v1/cart/coupon
// @access  Private only user
const removeCoupone = async (req, res, next) => {
  // Find the user's cart
  const cart = await cartSchema.findOne({ user: req.user._id });
  if (!cart) {
    return next(ApiError.create("No cart found for you", 404, "fail"));
  }

  // Remove the coupon from the cart
  cart.appliedCoupon = undefined;
  await cart.save();

  res.status(200).json({
    message: "Coupon removed successfully",
    totalItems: cart.cartItems.length,
    data: cart,
  });
};

// @desc    Get all coupons
// @route   GET /api/v1/coupons
// @access  Private only admin
const getAllCoupons = async (req, res, next) => {
  const coupons = await Coupone.find();
  if (!coupons) {
    return next(ApiError.create("No coupons found", 404, "fail"));
  }

  res.status(200).json({
    message: "Coupons retrieved successfully",
    totalItems: coupons.length,
    data: coupons,
  });
};

// @desc    Create a new coupon
// @route   POST /api/v1/coupons
// @access  Private only admin
const createCoupon = async (req, res, next) => {
  const { name, discound, expire, limitCount } = req.body;

  // Check if the coupon already exists
  const existingCoupon = await Coupone.findOne({ name });
  if (existingCoupon) {
    return next(ApiError.create("Coupon already exists", 400, "fail"));
  }

  // Create the new coupon
  const newCoupon = await Coupone.create({
    name,
    discound,
    expire,
    limitCount,
  });

  res.status(201).json({
    message: "Coupon created successfully",
    data: newCoupon,
  });
};

// @desc    Delete a coupon
// @route   DELETE /api/v1/coupons/:id
// @access  Private only admin
const deleteCoupon = async (req, res, next) => {
  const couponId = req.params.id;
  // Check if the coupon exists
  const coupon = await Coupone.findByIdAndDelete(couponId);
  if (!coupon) {
    return next(ApiError.create("Coupon not found", 404, "fail"));
  }
  res.status(200).json({
    message: "Coupon deleted successfully",
  });
  // Delete the coupon
};
// @desc    Update a coupon
// @route   PATCH /api/v1/coupons/:id
// @access  Private only admin
const updateCoupon = async (req, res, next) => {
  const couponId = req.params.id;
  const { name, discound, expire, limitCount } = req.body;
  // Check if the coupon exists
  const coupon = await Coupone.findByIdAndUpdate(
    couponId,
    { name, discound, expire, limitCount },
    { new: true }
  );
  if (!coupon) {
    return next(ApiError.create("Coupon not found", 404, "fail"));
  }

  res.status(200).json({
    message: "Coupon updated successfully",
    data: coupon,
  });
};

module.exports = {
  applayCoupone,
  removeCoupone,
  getAllCoupons,
  createCoupon,
  deleteCoupon,
  updateCoupon,
};
