'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('transactions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      contribution_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'contributions',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      transaction_type: {
        type: Sequelize.ENUM('payment', 'refund'),
        allowNull: false,
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('pending', 'success', 'failed'),
        allowNull: false,
        defaultValue: 'pending',
      },
      gateway_transaction_id: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      gateway_response: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      error_code: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      error_message: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    // Add indexes for performance
    await queryInterface.addIndex('transactions', ['contribution_id'], {
      name: 'idx_transactions_contribution_id',
    });

    await queryInterface.addIndex('transactions', ['status'], {
      name: 'idx_transactions_status',
    });

    await queryInterface.addIndex('transactions', ['created_at'], {
      name: 'idx_transactions_created_at',
    });

    await queryInterface.addIndex('transactions', ['gateway_transaction_id'], {
      name: 'idx_transactions_gateway_transaction_id',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('transactions');
  },
};
