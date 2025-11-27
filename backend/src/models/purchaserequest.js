"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class PurchaseRequest extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      PurchaseRequest.belongsTo(models.Warehouse, {
        foreignKey: "warehouse_id",
      });
      PurchaseRequest.hasMany(models.PurchaseRequestItem, {
        foreignKey: "purchase_request_id",
      });
    }
  }
  PurchaseRequest.init(
    {
      reference: DataTypes.STRING,
      warehouse_id: DataTypes.INTEGER,
      status: {
        type: DataTypes.STRING,
        defaultValue: "DRAFT",
      },
    },
    {
      sequelize,
      modelName: "PurchaseRequest",
    }
  );
  return PurchaseRequest;
};
