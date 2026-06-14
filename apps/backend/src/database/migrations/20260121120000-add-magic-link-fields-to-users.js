'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('users');

    if (!table.magic_link_token) {
      await queryInterface.addColumn('users', 'magic_link_token', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }

    if (table.magic_link_expires === undefined) {
      await queryInterface.addColumn('users', 'magic_link_expires', {
        type: Sequelize.DATE,
        allowNull: true,
      });
    }

    if (table.magic_link_token_used === undefined) {
      await queryInterface.addColumn('users', 'magic_link_token_used', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      });
    }

    if (table.accepted_terms_at === undefined) {
      await queryInterface.addColumn('users', 'accepted_terms_at', {
        type: Sequelize.DATE,
        allowNull: true,
      });
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'magic_link_token');
    await queryInterface.removeColumn('users', 'magic_link_token_used');
  },
};
