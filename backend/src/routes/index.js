const express = require("express");
const router = express.Router();

const productRoutes = require("./productRoutes");
const stockRoutes = require("./stockRoutes");
const purchaseRequestRoutes = require("./purchaseRequestRoutes");
const webhookRoutes = require("./webhookRoutes");

router.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Welcome to Foom Lab Global API",
  });
});

router.use("/products", productRoutes);
router.use("/stocks", stockRoutes);
router.use("/purchase/request", purchaseRequestRoutes);
router.use("/webhook", webhookRoutes);

module.exports = router;
