const {
  PurchaseRequest,
  PurchaseRequestItem,
  Stock,
  Product,
  sequelize,
} = require("../models");

const receiveStock = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { reference, details, status_request } = req.body;

    if (!reference) {
      await transaction.rollback();
      return res.status(400).json({
        status: "error",
        message: "Invalid payload format",
      });
    }

    const purchaseRequest = await PurchaseRequest.findOne({
      where: { reference },
      include: [{ model: PurchaseRequestItem }],
      transaction: transaction,
    });

    if (!purchaseRequest) {
      await transaction.rollback();
      return res.status(404).json({
        status: "error",
        message: "Purchase Request not found",
      });
    }

    if (
      purchaseRequest.status === "COMPLETED" ||
      purchaseRequest.status === "REJECTED"
    ) {
      await transaction.rollback();
      return res.status(200).json({
        status: "success",
        message: `Purchase Request already ${purchaseRequest.status.toLowerCase()}`,
      });
    }

    if (purchaseRequest.status !== "PENDING") {
      await transaction.rollback();
      return res.status(400).json({
        status: "error",
        message: "Purchase Request is not in PENDING status",
      });
    }

    if (status_request === "REQUEST_REJECTED") {
      await purchaseRequest.update(
        { status: "REJECTED" },
        { transaction: transaction }
      );

      await transaction.commit();

      return res.status(200).json({
        status: "success",
        message: "Purchase Request rejected by vendor",
      });
    }

    if (!details || details.length === 0) {
      await transaction.rollback();
      return res.status(400).json({
        status: "error",
        message: "Invalid payload format - details required",
      });
    }

    for (const item of details) {
      const product = await Product.findOne({
        where: { sku: item.sku_barcode },
        transaction: transaction,
      });

      if (!product) {
        throw new Error(`Product with SKU ${item.sku_barcode} not found`);
      }

      const [stock, created] = await Stock.findOrCreate({
        where: {
          warehouse_id: purchaseRequest.warehouse_id,
          product_id: product.id,
        },
        defaults: {
          quantity: 0,
        },
        transaction: transaction,
      });

      await stock.increment("quantity", {
        by: item.qty,
        transaction: transaction,
      });
    }

    await purchaseRequest.update(
      { status: "COMPLETED" },
      { transaction: transaction }
    );

    await transaction.commit();

    res.status(200).json({
      status: "success",
      message: "Stock received and updated successfully",
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

module.exports = {
  receiveStock,
};
