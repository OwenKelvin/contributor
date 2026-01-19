'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('activities', {
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
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      action: {
        type: Sequelize.ENUM(
          'USER_LOGIN',
          'USER_LOGOUT',
          'USER_CREATED',
          'USER_UPDATED',
          'USER_DELETED',
          'PROJECT_CREATED',
          'PROJECT_UPDATED',
          'PROJECT_DELETED',
          'PROJECT_APPROVED',
          'PROJECT_REJECTED',
          'PROJECT_ARCHIVED',
          'CONTRIBUTION_CREATED',
          'CONTRIBUTION_UPDATED',
          'CONTRIBUTION_DELETED',
          'ROLE_CREATED',
          'ROLE_UPDATED',
          'ROLE_DELETED',
          'ROLE_ASSIGNED',
          'ROLE_REVOKED',
          'PERMISSION_CREATED',
          'PERMISSION_UPDATED',
          'PERMISSION_DELETED',
          'CATEGORY_CREATED',
          'CATEGORY_UPDATED',
          'CATEGORY_DELETED'
        ),
        allowNull: false,
      },
      target_id: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      target_type: {
        type: Sequelize.ENUM(
          'User',
          'Project',
          'Contribution',
          'Role',
          'Permission',
          'Category'
        ),
        allowNull: true,
      },
      details: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {},
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

    // Add indexes for better query performance
    await queryInterface.addIndex('activities', ['user_id']);
    await queryInterface.addIndex('activities', ['action']);
    await queryInterface.addIndex('activities', ['target_type']);
    await queryInterface.addIndex('activities', ['target_id']);
    await queryInterface.addIndex('activities', ['created_at']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('activities');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_activities_action";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_activities_target_type";');
  },
};
