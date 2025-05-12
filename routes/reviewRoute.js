const express = require("express");
const {
  addReview,
  getAllReviews,
  deleteReview,
  updateReview,
} = require("../Controller/review");
const { Protect, allowTo } = require("../Controller/products");
const router = express.Router();
// Create a new review
router.post("/:productId", Protect, allowTo("user"), addReview);
// Get all reviews
router.get("/:productId", Protect, getAllReviews);
// Update a review by ID
router.put("/:productId/:reviewId", Protect, allowTo("user"), updateReview);
// Delete a review by ID
router.delete("/:productId/:reviewId", Protect, allowTo("user"), deleteReview);
// Export the router
module.exports = router;
