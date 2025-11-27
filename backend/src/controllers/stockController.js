const { Stock, Product, Warehouse } = require("../models");

const { Op } = require("sequelize");

const getAllStocks = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      sortBy = "id",
      order = "ASC",
      warehouse_id,
    } = req.query;
    const offset = (page - 1) * limit;

    const productWhere = {};
    const warehouseWhere = {};
    const stockWhere = {};

    if (search) {
      productWhere[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { sku: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (warehouse_id) {
      stockWhere.warehouse_id = warehouse_id;
    }

    const orderClause = [];
    if (sortBy === "product_name") {
      orderClause.push([Product, "name", order]);
    } else if (sortBy === "warehouse_name") {
      orderClause.push([Warehouse, "name", order]);
    } else {
      orderClause.push([sortBy, order]);
    }

    const { count, rows } = await Stock.findAndCountAll({
      where: stockWhere,
      include: [
        {
          model: Product,
          attributes: ["id", "name", "sku"],
          where: search ? productWhere : undefined,
        },
        {
          model: Warehouse,
          attributes: ["id", "name"],
        },
      ],
      attributes: ["id", "quantity", "createdAt"],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: orderClause,
    });

    res.status(200).json({
      status: "success",
      data: rows,
      meta: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

module.exports = {
  getAllStocks,
};
