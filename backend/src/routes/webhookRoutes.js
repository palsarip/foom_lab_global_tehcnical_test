const express = require("express");
const router = express.Router();
const webhookController = require("../controllers/webhookController");

router.post("/receive-stock", webhookController.receiveStock);

module.exports = router;
