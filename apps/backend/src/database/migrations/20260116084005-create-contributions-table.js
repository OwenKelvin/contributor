'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('contributions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      },
      project_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'projects',
          key: 'id',
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: 0.01,
        },
      },
      payment_status: {
        type: Sequelize.ENUM('pending', 'paid', 'failed', 'refunded'),
        allowNull: false,
        defaultValue: 'pending',
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      payment_reference: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      failure_reason: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      paid_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    // Add indexes for performance
    await queryInterface.addIndex('contributions', ['user_id'], {
      name: 'idx_contributions_user_id',
    });

    await queryInterface.addIndex('contributions', ['project_id'], {
      name: 'idx_contributions_project_id',
    });

    await queryInterface.addIndex('contributions', ['payment_status'], {
      name: 'idx_contributions_payment_status',
    });

    await queryInterface.addIndex('contributions', ['created_at'], {
      name: 'idx_contributions_created_at',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('contributions');
  },
};
