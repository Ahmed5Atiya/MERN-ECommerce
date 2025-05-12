const express = require("express");
const router = express.Router();

const {
  SignupValidation,
  LoginValidation,
} = require("../validation/authValidation");
const {
  getAllProduct,
  getFeaturedProduct,
  createProduct,
  deleteProduct,
  toggleFeaturedProduct,
  getRecommentedProduct,
  getProductByCategory,
  upload,
  Protect,
  allowTo,
} = require("../Controller/products");
// const { Protect, allowTo } = require("../Controller/auth");
router.get("/", getAllProduct);
router.get("/feature", getFeaturedProduct);
router.get("/recommended", getRecommentedProduct);
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

module.exports = router;
