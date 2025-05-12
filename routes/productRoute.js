const express = require("express");
const {
  getFeaturedProduct,
  createProduct,
  deleteProduct,
  getRecommendedProduct,
  getAllProduct,
  getProductByCategory,
  toggleFeaturedProduct,
  upload,
  getRecommentedProduct,
  Protect,
  allowTo,
} = require("../Controller/products"); // Fixed path: lowercase "controllers" and "product"
// const { Protect, allowTo } = require("../Controller/auth"); // Fixed path for consistency
const router = express.Router();

router.get("/", Protect, allowTo("admin"), getAllProduct);
router.get("/feature", getFeaturedProduct);
router.get("/recommended", getRecommentedProduct); // Line 15: Should now work
router.get("/category/:categoryId", getProductByCategory);
router.post(
  "/",
  Protect,
  allowTo("admin"),
  upload.single("image"),
  createProduct
);
router.delete("/:id", Protect, allowTo("admin"), deleteProduct);
router.put("/:id", Protect, allowTo("admin"), toggleFeaturedProduct);

// module.exports = router;

module.exports = {
  router, // Fixed export statement
};
