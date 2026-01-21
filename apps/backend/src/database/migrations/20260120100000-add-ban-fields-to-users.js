'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'is_banned', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    await queryInterface.addColumn('users', 'banned_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn('users', 'banned_by_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'users', // Name of the target table
        key: 'id', // Key in the target table that we're referencing
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
    await queryInterface.addColumn('users', 'ban_reason', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'is_banned');
    await queryInterface.removeColumn('users', 'banned_at');
    await queryInterface.removeColumn('users', 'banned_by_id');
    await queryInterface.removeColumn('users', 'ban_reason');
  },
};
