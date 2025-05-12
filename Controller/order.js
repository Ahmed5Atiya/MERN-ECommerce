const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const dotenv = require("dotenv");

const ApiError = require("../global/globalApiError");
const Cart = require("../Models/Cart");
const Order = require("../Models/order");
const Product = require("../Models/Product");

// create cash order
// post  api/orders/cartID
// protected -> only user
const CreateCashOrder = async (req, res, next) => {
  const taxPrice = 0;
  const shippingPrice = 0;
  // 1- get the cart depend on cartID
  const cart = await Cart.findById(req.params.cartId);
  if (!cart) {
    return next(new ApiError("there is no cart for the user to payment", 404));
  }
  // 2- get the totalPrive from the cart and equal to totalorderPrice
  const cartPrice = cart.totalPriceAfterDiscound
    ? cart.totalPriceAfterDiscound
    : cart.totalPrice;
  const totalOrderPrice = cartPrice + taxPrice + shippingPrice;
  // 3- create the order with the default payment Cash
  const order = await Order.create({
    user: req.user._id,
    cartItems: cart.cartItems,
    shippingAddress: req.body.shippingAddress,
    totalOrderPrice: totalOrderPrice,
  });
  // 4- dicrement the quantity and sold in the product model
  if (order) {
    const bulkOption = cart.cartItems.map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { quantity: -item.quantity, sold: +item.sold } },
      },
    }));
    await Product.bulkWrite(bulkOption, {});
    // clear the cart depend to cartId
    await Cart.findByIdAndDelete(req.params.cartId);
    // cart.cartItems = [];
    // await cart.save();
  }
  res.status(201).json({ message: "order Created Successfully", data: order });
};
// create cash order
// get  api/orders
// protected ->  user and admin user -> only Logged user
const getAllOrders = async (req, res, next) => {
  let Filter = {};
  if (req.user.role === "user") {
    Filter = { user: req.user._id };
  }

  const orders = await Order.find(Filter);
  if (!orders) {
    return next(new ApiError("there is no orders yet", 404));
  }

  res
    .status(202)
    .json({ message: "All orders get successfully", data: orders });
};
// create cash order
// get  api/orders/:id
// protected ->  user and admin user -> only Logged user
const getOrder = async (req, res, next) => {
  let Filter = {};
  if (req.user.role === "user") {
    Filter = { user: req.user._id };
  }
  const order = await Order.findOne({ _id: req.params.id }, Filter);
  if (!order) {
    return next(new ApiError("there is order not found", 404));
  }

  res.status(202).json({ message: "get Order successfully", data: order });
};
// create cash order
// put  api/orders/:id/deliver
// protected ->   admin
const drivedOrder = async (req, res, next) => {
  const order = await Order.findById({ _id: req.params.id });
  if (!order) {
    return next(new ApiError("there is order not found", 404));
  }
  order.isDrived = true;
  order.isDrivedAt = Date.now();
  await order.save();
  res.status(202).json({ message: "Drived Order successfully", data: orders });
};
// create cash order
// put  api/orders/:id/paid
// protected ->   admin
const paidOrder = async (req, res, next) => {
  const order = await Order.findById({ _id: req.params.id });
  if (!order) {
    return next(new ApiError("there is order not found", 404));
  }
  order.isPaid = true;
  order.isPaidAt = Date.now();
  await order.save();
  res.status(202).json({ message: "Paid Order successfully", data: orders });
};
// create stripe session and send the url to the client
// put  api/orders/checkout-session/:cartId
// protected ->  logged user
const createStripeSession = async (req, res, next) => {
  // 1- get the cart depend on cartID
  const cart = await Cart.findById(req.params.cartId);
  if (!cart) {
    return next(new ApiError("there is no cart for the user to payment", 404));
  }
  // 2- get the totalPrive from the cart and equal to totalorderPrice
  const cartPrice = cart.totalPriceAfterDiscound
    ? cart.totalPriceAfterDiscound
    : cart.totalPrice;
  const totalOrderPrice = cartPrice + taxPrice + shippingPrice;
  // // 3- create the order with the default payment Cash
  const order = await Order.findById(req.params.cartId);
  if (!order) {
    return next(new ApiError("there is order not found", 404));
  }
  const session = await stripe.checkout.sessions.create({
    // send the user id to the stripe
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          name: req.user.name,
          product_data: {
            name: order._id,
          },
          unit_amount: totalOrderPrice * 100,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    customer_email: req.user.email,
    client_reference_id: req.params.cartId,
    metadata: req.body.shippingAddress,
    success_url: `${req.protocol}://${req.get("host")}/api/orders`,
    cancel_url: `${req.protocol}://${req.get("host")}/api/carts`,
  });
  res.status(200).json({ url: session.url });
};
module.exports = {
  CreateCashOrder,
  getOrder,
  getAllOrders,
  drivedOrder,
  paidOrder,
  createStripeSession,
};
