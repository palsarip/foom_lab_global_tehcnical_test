const {
  PurchaseRequest,
  PurchaseRequestItem,
  Product,
  Warehouse,
  sequelize,
} = require("../models");
const axios = require("axios");

const create = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    let { reference, warehouse_id, items } = req.body;

    if (!reference) {
      const latestPR = await PurchaseRequest.findOne({
        order: [["id", "DESC"]],
        attributes: ["reference"],
        transaction: transaction,
      });

      if (latestPR && latestPR.reference) {
        const match = latestPR.reference.match(/PR(\d+)/);
        if (match) {
          const lastNumber = parseInt(match[1], 10);
          const nextNumber = lastNumber + 1;
          reference = `PR${String(nextNumber).padStart(5, "0")}`;
        } else {
          reference = "PR00001";
        }
      } else {
        reference = "PR00001";
      }
    }

    const purchaseRequest = await PurchaseRequest.create(
      {
        reference,
        warehouse_id,
      },
      { transaction: transaction }
    );

    if (items && items.length > 0) {
      const purchaseRequestItems = items.map((item) => ({
        purchase_request_id: purchaseRequest.id,
        product_id: item.product_id,
        quantity: item.quantity,
      }));

      await PurchaseRequestItem.bulkCreate(purchaseRequestItems, {
        transaction: transaction,
      });
    }

    await transaction.commit();

    res.status(201).json({
      status: "success",
      data: purchaseRequest,
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Create PR Error:", error);
    if (error.errors) {
      console.error("Validation Errors:", error.errors);
    }
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

const update = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { reference, warehouse_id, items, status } = req.body;

    const purchaseRequest = await PurchaseRequest.findByPk(id);

    if (!purchaseRequest) {
      await transaction.rollback();
      return res.status(404).json({
        status: "error",
        message: "Purchase Request not found",
      });
    }

    if (purchaseRequest.status !== "DRAFT") {
      await transaction.rollback();
      return res.status(400).json({
        status: "error",
        message: `Cannot update Purchase Request with status ${purchaseRequest.status}. Only DRAFT can be updated.`,
      });
    }

    if (status === "PENDING") {
      const prWithDetails = await PurchaseRequest.findByPk(id, {
        include: [
          {
            model: PurchaseRequestItem,
            include: [{ model: Product }],
          },
        ],
        transaction: transaction,
      });

      const payload = {
        vendor: process.env.VENDOR_NAME || "PT FOOM LAB GLOBAL",
        reference: prWithDetails.reference,
        qty_total: prWithDetails.PurchaseRequestItems.reduce(
          (sum, item) => sum + item.quantity,
          0
        ),
        details: prWithDetails.PurchaseRequestItems.map((item) => ({
          product_name: item.Product.name,
          sku_barcode: item.Product.sku,
          qty: item.quantity,
        })),
      };

      try {
        const hubApiUrl = process.env.HUB_API_URL;
        const hubSecretKey = process.env.HUB_SECRET_KEY;

        if (!hubApiUrl || !hubSecretKey) {
          throw new Error(
            "Missing HUB_API_URL or HUB_SECRET_KEY in environment variables"
          );
        }

        const response = await axios.post(
          `${hubApiUrl}/api/request/purchase`,
          payload,
          {
            headers: {
              "Content-Type": "application/json",
              "secret-key": hubSecretKey,
            },
          }
        );
      } catch (apiError) {
        throw new Error(`Failed to trigger Hub API: ${apiError.message}`);
      }
    }

    await purchaseRequest.update(
      {
        reference,
        warehouse_id,
        status: status || purchaseRequest.status,
      },
      { transaction: transaction }
    );

    if (items) {
      await PurchaseRequestItem.destroy({
        where: { purchase_request_id: id },
        transaction: transaction,
      });

      if (items.length > 0) {
        const purchaseRequestItems = items.map((item) => ({
          purchase_request_id: id,
          product_id: item.product_id,
          quantity: item.quantity,
        }));

        await PurchaseRequestItem.bulkCreate(purchaseRequestItems, {
          transaction: transaction,
        });
      }
    }

    await transaction.commit();

    res.status(200).json({
      status: "success",
      message: "Purchase Request updated successfully",
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

const remove = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;

    const purchaseRequest = await PurchaseRequest.findByPk(id);

    if (!purchaseRequest) {
      await transaction.rollback();
      return res.status(404).json({
        status: "error",
        message: "Purchase Request not found",
      });
    }

    if (purchaseRequest.status !== "DRAFT") {
      await transaction.rollback();
      return res.status(400).json({
        status: "error",
        message: "Cannot delete Purchase Request. Only DRAFT can be deleted.",
      });
    }

    await PurchaseRequestItem.destroy({
      where: { purchase_request_id: id },
      transaction: transaction,
    });

    await purchaseRequest.destroy({ transaction: transaction });

    await transaction.commit();

    res.status(200).json({
      status: "success",
      message: "Purchase Request deleted successfully",
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

const getAll = async (req, res) => {
  try {
    const purchaseRequests = await PurchaseRequest.findAll({
      include: [
        {
          model: Warehouse,
          attributes: ["name"],
        },
        {
          model: PurchaseRequestItem,
          attributes: ["quantity"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const formattedData = purchaseRequests.map((pr) => {
      const prJSON = pr.toJSON();
      const totalQty = prJSON.PurchaseRequestItems
        ? prJSON.PurchaseRequestItems.reduce(
            (sum, item) => sum + item.quantity,
            0
          )
        : 0;

      return {
        ...prJSON,
        vendor: process.env.VENDOR_NAME || "PT FOOM LAB GLOBAL",
        qty_total: totalQty,
      };
    });

    res.status(200).json({
      status: "success",
      data: formattedData,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const purchaseRequest = await PurchaseRequest.findByPk(id, {
      include: [
        {
          model: Warehouse,
          attributes: ["id", "name"],
        },
        {
          model: PurchaseRequestItem,
          include: [
            {
              model: Product,
              attributes: ["id", "name", "sku"],
            },
          ],
        },
      ],
    });

    if (!purchaseRequest) {
      return res.status(404).json({
        status: "error",
        message: "Purchase Request not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: purchaseRequest,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

module.exports = {
  create,
  getAll,
  getById,
  update,
  remove,
};
