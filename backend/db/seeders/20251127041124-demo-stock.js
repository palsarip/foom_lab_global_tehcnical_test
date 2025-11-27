"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "Stocks",
      [
        // Central Warehouse Jakarta
        {
          warehouse_id: 1,
          product_id: 1,
          quantity: 150,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          warehouse_id: 1,
          product_id: 2,
          quantity: 200,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          warehouse_id: 1,
          product_id: 3,
          quantity: 180,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          warehouse_id: 1,
          product_id: 4,
          quantity: 120,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          warehouse_id: 1,
          product_id: 5,
          quantity: 90,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          warehouse_id: 1,
          product_id: 6,
          quantity: 160,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          warehouse_id: 1,
          product_id: 7,
          quantity: 110,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          warehouse_id: 1,
          product_id: 8,
          quantity: 140,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          warehouse_id: 1,
          product_id: 9,
          quantity: 95,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          warehouse_id: 1,
          product_id: 10,
          quantity: 175,
          createdAt: new Date(),
          updatedAt: new Date(),
        },

        // Branch Warehouse Surabaya
        {
          warehouse_id: 2,
          product_id: 1,
          quantity: 80,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          warehouse_id: 2,
          product_id: 2,
          quantity: 100,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          warehouse_id: 2,
          product_id: 3,
          quantity: 75,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          warehouse_id: 2,
          product_id: 4,
          quantity: 60,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          warehouse_id: 2,
          product_id: 5,
          quantity: 50,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          warehouse_id: 2,
          product_id: 6,
          quantity: 85,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          warehouse_id: 2,
          product_id: 7,
          quantity: 70,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          warehouse_id: 2,
          product_id: 8,
          quantity: 90,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          warehouse_id: 2,
          product_id: 9,
          quantity: 55,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          warehouse_id: 2,
          product_id: 10,
          quantity: 95,
          createdAt: new Date(),
          updatedAt: new Date(),
        },

        // Branch Warehouse Bandung
        {
          warehouse_id: 3,
          product_id: 1,
          quantity: 60,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          warehouse_id: 3,
          product_id: 2,
          quantity: 70,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          warehouse_id: 3,
          product_id: 3,
          quantity: 55,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          warehouse_id: 3,
          product_id: 4,
          quantity: 45,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          warehouse_id: 3,
          product_id: 5,
          quantity: 40,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          warehouse_id: 3,
          product_id: 6,
          quantity: 65,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          warehouse_id: 3,
          product_id: 7,
          quantity: 50,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          warehouse_id: 3,
          product_id: 8,
          quantity: 60,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          warehouse_id: 3,
          product_id: 9,
          quantity: 35,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          warehouse_id: 3,
          product_id: 10,
          quantity: 75,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Stocks", null, {});
  },
};
