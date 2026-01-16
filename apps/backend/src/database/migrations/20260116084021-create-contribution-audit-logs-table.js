'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('contribution_audit_logs', {
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
      admin_user_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      previous_status: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      new_status: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      reason: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    // Add indexes for performance
    await queryInterface.addIndex('contribution_audit_logs', ['contribution_id'], {
      name: 'idx_contribution_audit_logs_contribution_id',
    });

    await queryInterface.addIndex('contribution_audit_logs', ['admin_user_id'], {
      name: 'idx_contribution_audit_logs_admin_user_id',
    });

    await queryInterface.addIndex('contribution_audit_logs', ['created_at'], {
      name: 'idx_contribution_audit_logs_created_at',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('contribution_audit_logs');
  },
};
