const express = require("express");
const router = express.Router();
const purchaseRequestController = require("../controllers/purchaseRequestController");

router.get("/", purchaseRequestController.getAll);
router.get("/:id", purchaseRequestController.getById);

router.post("/", purchaseRequestController.create);

router.put("/:id", purchaseRequestController.update);

router.delete("/:id", purchaseRequestController.remove);

module.exports = router;
