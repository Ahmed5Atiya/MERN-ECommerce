const mongoose = require("mongoose");
let connectDb = async () => {
  try {
    await mongoose.connect(`${process.env.DB_URL}`);
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection failed:", error.message);
    if (error.reason) {
      console.error("Error reason:", error.reason);
    }
    process.exit(1);
  }
};

module.exports = connectDb;
