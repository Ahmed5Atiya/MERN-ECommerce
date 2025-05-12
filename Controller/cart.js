const ApiError = require("../global/globalApiError");
const Cart = require("../models/Cart");
const Product = require("../Models/Product");
const calcTotalPrice = (cart) => {
  let sum = 0;
  cart.cartItems.map((item) => {
    sum += item.price * item.quantity;
  });
  //   cart.cartItems.map((item) => (
  //     sum += item.price * item.quantity;
  //   ));
  cart.totalPrice = sum;
  cart.totalPriceAfterDiscound = undefined;
  return sum;
};
const addProductToCart = async (req, res, next) => {
  // 1- i will get the product id from the req.body and get the data for it
  const { productId } = req.params;
  const product = await Product.findById(productId);
  if (!product) {
    return next(new ApiError("the is no product for this id", 404));
  }
  // 2- i will get the cart for the user is logged using req.user form Protected
  const cart = await Cart.findOne({ user: req.user._id });
  // console.log("this is the cart", cart);
  // 3- if there is no cart i will create cart and add this product
  if (!cart) {
    await Cart.create({
      user: req.user._id,
      cartItems: [{ product: productId, price: product.price }],
    });
  } else {
    // 4-  there is cart i will check if this product is exist in cart or not
    const productIndex = cart.cartItems.findIndex((item) => {
      // Only compare if item.product exists
      return item.product && item.product.toString() === productId.toString();
    });
    console.log("this is the product index", productIndex);
    // 5- if the product is exist in the cart i will increase the quantity +=1 ;
    if (productIndex > -1) {
      const cartItem = cart.cartItems[productIndex];
      cartItem.quantity += 1;
      cart.cartItems[productIndex] = cartItem;
    } else {
      // 5- if the product isn`t exist in the cart i will push this product in the cart ;
      cart.cartItems.push({ product: productId, price: product.price });
    }
  }

  // 6- calc the tital Price  for the cart Products
  calcTotalPrice(cart);
  // 7- save all the change happen in the  cart
  await cart.save();

  // 8- send the res for the user
  res.status(200).json({
    status: "success",
    messgae: "Product item added successfuly to Cart",
    data: cart,
  });
};

const getLoggedUserCart = async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return next(new ApiError("there is no product in cart yet", 404));
  }
  res.status(202).json({
    numberProduct: cart.cartItems.length,
    data: cart,
  });
};

const removeAllProductInCart = async (req, res, next) => {
  console.log("this is the user id", req.user._id);
  const cart = await Cart.findOneAndDelete({ user: req.user._id });
  if (!cart) {
    return next(new ApiError("there is no product in cart yet", 404));
  }

  res.status(202).json({
    message: "All Product In Cart Delete Successfuly",
    totalItems: cart.cartItems.length,
  });
};
const deleteProductFromCart = async (req, res, next) => {
  const cart = await Cart.findOneAndUpdate(
    { user: req.user._id },
    {
      $pull: { cartItems: { _id: req.params.itemId } },
    },
    { new: true }
  );
  console.log("this is the cart", cart);
  if (!cart) {
    return next(new ApiError("this product id not found to delete it", 404));
  }
  calcTotalPrice(cart);
  await cart.save();
  res.status(200).json({
    message: "cart item successfully deleted",
    totalItems: cart.cartItems.length,
    data: cart,
  });
};
const updateProductFromCart = async (req, res, next) => {
  const { itemId } = req.params;
  // 1- i will get the cart for the logged user frist
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return next(new ApiError("this product id not found to delete it", 404));
  }
  // 2- get the product item want to update it
  // const productIndex = cart.cartItems.findIndex((item) => {
  //   console.log("this is the item", item);
  //   return item.product && item.product.toString() === itemId.toString();
  // });
  const productIndex = cart.cartItems.findIndex((item) => {
    // Only compare if item.product exists
    return item._id && item._id.toString() === itemId.toString();
  });
  console.log("this is the product index", productIndex);
  if (productIndex > -1) {
    // 3- change the cartItem.quantity  to be the quantity in req.body
    const cartItem = cart.cartItems[productIndex];
    cartItem.quantity = req.body.quantity;
    cart.cartItems[productIndex] = cartItem;
  } else {
    return next(new ApiError("this product id not founded", 404));
  }
  // 4- re calc the total price in the cart  and save it
  calcTotalPrice(cart);
  await cart.save();
  // 5- send the success respone for the user
  res.status(200).json({
    message: "cart item successfully deleted",
    totalItems: cart.cartItems.length,
    data: cart,
  });
};

const applyCoupone = async (req, res, next) => {
  // 1 - i will get the coupone user enter if exist and not expire or not
  // 2 - i will get the cart for logged user are applyed coupone
  // 3 -  get the total price after calce the persent the coupone and save in variable ex -> A
  // 4-  i will make the total priceAfterDescound in cart equal to
  // 5- finial send the res for the user with new information
};
module.exports = {
  addProductToCart,
  getLoggedUserCart,
  removeAllProductInCart,
  deleteProductFromCart,
  updateProductFromCart,
  applyCoupone,
};
