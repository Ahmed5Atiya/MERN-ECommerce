const express = require("express");
const {
  removeAllProductInCart,
  deleteProductFromCart,
  getLoggedUserCart,
  updateProductFromCart,
  applyCoupone,
  addProductToCart,
} = require("../Controller/cart");
const { Protect, allowTo } = require("../Controller/products");

const route = express.Router();

route.post("/:productId", Protect, allowTo("user"), addProductToCart);
route.get("/", Protect, allowTo("user"), getLoggedUserCart);
route.delete("/", Protect, allowTo("user"), removeAllProductInCart);
route.put("/applyCoupone", Protect, allowTo("user"), applyCoupone);
route.delete("/:itemId", Protect, allowTo("user"), deleteProductFromCart);
route.put("/:itemId", Protect, allowTo("user"), updateProductFromCart);

module.exports = route;
