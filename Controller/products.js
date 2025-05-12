const Product = require("../Models/Product");
const ApiError = require("../global/globalApiError");
const multer = require("multer");
const fs = require("fs");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");

const cloudinary = require("../lib/cloudinary");
const User = require("../Models/User");
dotenv.config();

const upload = multer({ dest: "uploads/" });
//@dec
// 1- privet only admin and protected
// 2- next -> applay the pagination page
// get -> api/product
const getAllProduct = async (req, res, next) => {
  const product = await Product.find();
  if (!product) {
    return next(new ApiError("no Product Founded Yet", 404));
  }
  res.status(202).json({ product });
};

//@dec
// allow for any one and not protected
// 2- next -> applay the pagination page
// get -> api/product/featured
const getFeaturedProduct = async (req, res, next) => {
  // .lean() that is return plain js object instead of mongodb which is good for performance
  const product = await Product.find({ isFeatured: true }).lean();
  if (!product) {
    return next(new ApiError("no  Featured Product Founded Yet", 404));
  }
  res.status(202).json({ product });
};

//@dec
// allow for only admin and protected
// post -> api/product
const createProduct = async (req, res, next) => {
  // 1-get all the information form req.body
  let { name, description, price, image, quantity, category, isFeatured } =
    req.body;
  const result = await cloudinary.uploader.upload(req.file.path, {
    folder: "products",
    allowed_formats: ["jpg", "png", "jpeg"],
    transformation: [{ width: 500, height: 500, crop: "limit" }],
  });
  fs.unlinkSync(req.file.path); // Delete temporary file
  const imageUrl = result.secure_url;
  const product = await Product.create({
    name,
    description,
    price: parseFloat(price),
    quantity: parseInt(quantity),
    category,
    image: imageUrl,
    isFeatured: isFeatured === "true" || false,
  });

  // let cloudinaryResponse = null;
  // if (image) {
  //   cloudinaryResponse = await cloudinary.uploader.upload(image, {
  //     folder: "products",
  //   });
  // }
  res.status(201).json({
    message: "Product Created Successfuly",
    product: product,
  });
};
const deleteProduct = async (req, res, next) => {
  const product = await Product.findById({ _id: req.params.id });
  if (!product) {
    return next(new ApiError("this product not found", 404));
  }

  if (product.image) {
    const publicId = product.image.split("/").pop().split(".")[0];
    await cloudinary.uploader.destroy(`products/${publicId}`);
  }

  await Product.findByIdAndDelete(req.params.id);

  res.status(202).json({
    message: "Proudct deleted Successfully",
  });
};
const getRecommentedProduct = async (req, res, next) => {
  // this function for get the 3 random product
  const product = await Product.aggregate([
    { $sample: { size: 3 } },
    {
      $project: {
        _id: 1,
        name: 1,
        description: 1,
        image: 1,
        price: 1,
      },
    },
  ]);

  res.status(202).json({ product });
};
const getProductByCategory = async (req, res, next) => {
  // this function for get the 3 random product
  console.log("this is the category", req.params);
  const { categoryId } = req.params;
  const products = await Product.find({ category: categoryId });
  if (!products) {
    return next(new ApiError("ther is not products in this category yet", 404));
  }
  res.status(202).json({ products });
};
const toggleFeaturedProduct = async (req, res, next) => {
  // Find the product by ID
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ApiError("This product not found", 404));
  }
  const newProduct = await Product.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        isFeatured: !product.isFeatured,
      },
    },
    { new: true } // Return the updated document)
  );
  if (!product) {
    return next(new ApiError("this product not found", 404));
  }

  res
    .status(202)
    .json({ message: "Protect are updated Featured Successfully", newProduct });
};

const Protect = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next(new ApiError("You are not authorized", 401));
    }

    const decodedId = jwt.verify(token, process.env.SECRET_KEY);
    if (!decodedId.userId) {
      return next(new ApiError("Invalid token", 401));
    }

    const user = await User.findOne({ _id: decodedId.userId });
    if (!user) {
      return next(new ApiError("The user does not exist", 404));
    }

    if (user.passwordChangeAt) {
      const passwordUpdateTime = user.passwordChangeAt.getTime() / 1000;
      if (passwordUpdateTime > decodedId.iat) {
        return next(new ApiError("User recently changed the password", 401));
      }
    }

    req.user = user;
    next();
  } catch (error) {
    next(new ApiError(`Authorization failed: ${error.message}`, 401));
  }
};

const allowTo =
  (...values) =>
  (req, res, next) => {
    const role = req.user.role;
    if (!values.includes(role)) {
      return next(
        new ApiError("You are not allowed to access this route", 403)
      );
    }
    next();
  };
module.exports = {
  getAllProduct,
  allowTo,
  Protect,
  getFeaturedProduct,
  createProduct,
  deleteProduct,
  getRecommentedProduct,
  getProductByCategory,
  toggleFeaturedProduct,
  upload,
};
