const express = require("express");
const router = express.Router();
const { Protect, allowTo } = require("../Controller/products");
const {
  getAllWishListForLoggedUser,
  addToWishList,
  deleteProductFromWishList,
} = require("../Controller/wishList");

router.get("/", Protect, allowTo("user"), getAllWishListForLoggedUser);
router.post("/", Protect, allowTo("user"), addToWishList);
router.get("/:productId", Protect, allowTo("user"), deleteProductFromWishList);

module.exports = router;
