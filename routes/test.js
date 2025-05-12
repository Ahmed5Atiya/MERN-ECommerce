const Product = require("../Models/Product");
const ApiError = require("../global/globalApiError");
const multer = require("multer");
const fs = require("fs");
const cloudinary = require("cloudinary").v2;
const dotenv = require("dotenv");
dotenv.config();
cloudinary.config = {
  cloud_name: process.env.CLOUDNARY_CLOUD_NAME,
  api_key: process.env.CLOUDNARY_API_KEY,
  api_secret: process.env.CLOUDNARY_SECRET_KEY,
};
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

const upload = multer({ dest: "uploads/" });
//@dec
// 1- privet only admin and protected
// 2- next -> applay the pagination page
// get -> api/product
const getAllProduct = async (req, res, next) => {
  const product = await Product.find({});
  if (!product) {
    return next(new ApiError("no Product Founded Yet", 404));
  }
  res.status(202), json({ product });
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
  res.status(202), json({ product });
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
  const product = new Product({
    name,
    description,
    price: parseFloat(price),
    quantity: parseInt(quantity),
    category,
    image: imageUrl,
    isFeatured: isFeatured === "true" || false,
  });
  let cloudinaryResponse = null;
  if (image) {
    cloudinaryResponse = await cloudinary.uploader.upload(image, {
      folder: "products",
    });
  }

  //   const product = await Product.create({
  //     name,
  //     description,
  //     price,
  //     isFeatured,
  //     quantity,
  //     category,
  //     image: cloudinaryResponse?.secure_url ? cloudinaryResponse?.secure_url : "",
  //   });
  // console.log("cloud_name:", process.env.CLOUDNARY_CLOUD_NAME),
  //   console.log("api_key:", process.env.CLOUDNARY_API_KEY),
  //   console.log("api_secret:", process.env.CLOUDNARY_SECRET_KEY),
  // api_key: process.env.CLOUDNARY_API_KEY,
  // api_secret: process.env.CLOUDNARY_SECRET_KEY,
  res.status(201).json({
    message: "Product Created Successfuly",
    // product: product,
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
  const { category } = req.params;
  const products = await Product.find({ category: category });
  if (!products) {
    return next(new ApiError("ther is not products in this category yet", 404));
  }
  res.status(202).json({ products });
};
const toggleFeaturedProduct = async (req, res, next) => {
  const product = await Product.findByIdAndUpdate(
    { _id: req.params.id },
    {
      $set: {
        isFeatured: !isFeatured,
      },
    }
  );
  if (!product) {
    return next(new ApiError("this product not found", 404));
  }

  res
    .status(202)
    .json({ message: "Protect are updated Featured Successfully", product });
};
module.exports = {
  getAllProduct,
  getFeaturedProduct,
  createProduct,
  deleteProduct,
  getRecommentedProduct,
  getProductByCategory,
  toggleFeaturedProduct,
  upload,
};
