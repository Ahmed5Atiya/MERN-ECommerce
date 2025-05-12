const express = require("express");
const router = express.Router();
const {
  applayCoupone,
  removeCoupone,
  getAllCoupons,
  createCoupon,
  deleteCoupon,
  updateCoupon,
} = require("../Controller/coupone");
const { Protect, allowTo } = require("../Controller/products");
router.post("/", Protect, allowTo("admin"), createCoupon);
router.get("/", Protect, allowTo("admin"), getAllCoupons);
router.put("/:id", Protect, allowTo("admin"), updateCoupon);
router.delete("/:id", Protect, allowTo("admin"), deleteCoupon);
router.delete("/:id", Protect, allowTo("user"), removeCoupone);
router.post("/applyCoupone", Protect, allowTo("user"), applayCoupone);
module.exports = router;
