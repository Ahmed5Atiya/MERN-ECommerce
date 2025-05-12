const ApiError = require("../global/globalApiError");
const Product = require("../Models/Product");
const User = require("../Models/User");

// add to wishList
// post api/wishlist
// protected -> only logged user

const addToWishList = async (req, res, next) => {
  const product = await Product.findById(req.body.productId);
  if (!product) {
    return next(new ApiError("there is no product for this id", 404));
  }

  // get the logged user and add the product for wishList
  const user = await User.findByIdAndUpdate(
    { _id: req.user._id },
    { $addToSet: { wishList: req.params.productId } }, // $addToSet -> for push product to array
    { new: true }
  );
  if (!user) {
    return next(new ApiError("there is no user for this id", 404));
  }
  res.status(201).json({
    message: "product add to wishList Successfully",
    data: user.wishList,
  });
};
// remove form wishList
// put api/wishlist/:productId
// protected -> only logged user
const deleteProductFromWishList = async (req, res, next) => {
  const product = await Product.findById(req.params.productId);
  if (!product) {
    return next(new ApiError("there is no product for this id", 404));
  }

  // get the logged user and add the product for wishList
  const user = await User.findByIdAndUpdate(
    { _id: req.user._id },
    { $pull: { wishList: req.params.productId } }, // $pull -> for remove from array
    { new: true }
  );
  if (!user) {
    return next(new ApiError("there is no user for this id", 404));
  }
  res.status(201).json({
    message: "product remove From wishList Successfully",
    data: user.wishList,
  });
};
// get all wishList
// get api/wishlist
// protected -> only logged user
const getAllWishListForLoggedUser = async (req, res, next) => {
  const user = await User.findById(req.user._id).populate("wishList");
  if (!user) {
    return next(new ApiError("there is no user for this id", 404));
  }
  res
    .status(202)
    .json({ message: "get wishList Successfuly", data: user.wishList });
};

module.exports = {
  addToWishList,
  deleteProductFromWishList,
  getAllWishListForLoggedUser,
};
