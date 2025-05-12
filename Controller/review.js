const Product = require("../Models/Product");
const ApiError = require("../global/globalApiError");
const Review = require("../Models/review");

// add review
// post api/review
// protected -> only logged user

const addReview = async (req, res, next) => {
  const { productId } = req.params;
  const { description, rating } = req.body;

  // check if the product exist
  const product = await Product.findById(productId);
  if (!product) {
    return next(new ApiError("there is no product for this id", 404));
  }
  // check if the user already reviewd this product
  const review = await Review.findOne({
    user: req.user._id,
    product: productId,
  });
  if (review) {
    return next(new ApiError("you already reviewd this product", 400));
  }
  // create the review
  const newReview = await Review.create({
    user: req.user._id,
    product: productId,
    description,
    rating,
  });
  // add the review to the product
  product.totalRating += rating;
  product.totalReviews += 1;
  product.rating = product.totalRating / product.totalReviews;
  await product.save();
  res.status(201).json({
    message: "review added successfully",
    data: newReview,
  });
};

// get all reviews
// get api/review/:productId
// protected -> only logged user
const getAllReviews = async (req, res, next) => {
  const { productId } = req.params;
  // check if the product exist
  const product = await Product.findById({ _id: productId });
  if (!product) {
    return next(new ApiError("there is no product for this id", 404));
  }
  // get all reviews for this product
  const reviews = await Review.find({ product: productId })
    .populate("user", "name email")
    .sort("-createdAt");
  if (!reviews) {
    return next(new ApiError("there is no reviews for this product", 404));
  }
  res.status(200).json({
    message: "reviews retrieved successfully",
    totalItems: reviews.length,
    data: reviews,
  });
};

// delete review
// delete api/review/:productId/:reviewId
// protected -> only logged user
const deleteReview = async (req, res, next) => {
  const { productId, reviewId } = req.params;
  // check if the product exist
  const product = await Product.findById(productId).populate("reviews");
  if (!product) {
    return next(new ApiError("there is no product for this id", 404));
  }
  // check if the review exist
  const review = await Review.findById(reviewId).populate("user", "name email");
  if (!review) {
    return next(new ApiError("there is no review for this id", 404));
  }
  // check if the user is the owner of the review
  if (review.user._id.toString() !== req.user._id.toString()) {
    return next(new ApiError("you are not the owner of this review", 403));
  }
  // delete the review
  await Review.findByIdAndDelete(reviewId);
  // update the product rating
  product.totalRating -= review.rating;
  product.totalReviews -= 1;
  product.rating = product.totalRating / product.totalReviews;
  await product.save();
  res.status(200).json({
    message: "review deleted successfully",
  });
};

// update review
// put api/review/:productId/:reviewId
// protected -> only logged user
const updateReview = async (req, res, next) => {
  const { productId, reviewId } = req.params;
  const { description, rating } = req.body;
  // check if the product exist
  const product = await Product.findById(productId);
  if (!product) {
    return next(new ApiError("there is no product for this id", 404));
  }
  // check if the review exist
  const review = await Review.findById(reviewId);
  if (!review) {
    return next(new ApiError("there is no review for this id", 404));
  }
  // check if the user is the owner of the review
  if (review.user.toString() !== req.user._id.toString()) {
    return next(new ApiError("you are not the owner of this review", 403));
  }
  // update the review
  review.description = description;
  review.rating = rating;
  await review.save();
  res.status(200).json({
    message: "review updated successfully",
    data: review,
  });
};

module.exports = {
  addReview,
  getAllReviews,
  deleteReview,
  updateReview,
};
