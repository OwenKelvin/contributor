'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('users');
    if (!tableDescription.phone_number) {
      await queryInterface.addColumn('users', 'phone_number', {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
      });
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'phone_number');
  },
};
