"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class PurchaseRequestItem extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      PurchaseRequestItem.belongsTo(models.PurchaseRequest, {
        foreignKey: "purchase_request_id",
      });
      PurchaseRequestItem.belongsTo(models.Product, {
        foreignKey: "product_id",
      });
    }
  }
  PurchaseRequestItem.init(
    {
      purchase_request_id: DataTypes.INTEGER,
      product_id: DataTypes.INTEGER,
      quantity: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "PurchaseRequestItem",
    }
  );
  return PurchaseRequestItem;
};
