const express = require("express");
const ApiError = require("./global/globalApiError");
const globalError = require("./middleware/globalError");
const app = express();
const dotenv = require("dotenv");
const ProductsRoute = require("./routes/productsRoute");
const CartRoute = require("./routes/cartRoute");
const authRoute = require("./routes/authRoute");
const couponeRoute = require("./routes/coupon");
const reviewRoute = require("./routes/reviewRoute");
// const orderRoute = require("./routes/orderRoute");

// const orderRoute = require("./routes/");
const wishListRoute = require("./routes/wishListRoute");
const connectDb = require("./global/connectDB");

dotenv.config();

app.use(express.json());
connectDb();
app.use("/api/auth", authRoute);
app.use("/api/wishList", wishListRoute);
app.use("/api/cart", CartRoute); // Fixed typo
app.use("/api/product", ProductsRoute); // Fixed typo
app.use("/api/coupone", couponeRoute); // Fixed typo
app.use("/api/review", reviewRoute); // Fixed typo
// app.use("/api/order", orderRoute); // Fixed typo
app.use("/api/review", reviewRoute); // Fixed typo
// Catch-all route for undefined routes (404 Not Found)
// app.all("*", (req, res, next) => {
//   return next(
//     new ApiError(`Cannot find ${req.originalUrl} on this server`, 404)
//   );
// });
app.use(globalError);
const server = app.listen(5000, () => {
  console.log("Server is running on port 5000");
});

process.on("unhandledRejection", (error) => {
  console.error(`UnHandledRejection ${error}`);
  server.close(() => {
    process.exit(1);
  });
});
