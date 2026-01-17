'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // First create categories table if it doesn't exist
    await queryInterface.createTable('categories', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      description: {
        type: Sequelize.TEXT,
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

    // Then create projects table
    await queryInterface.createTable('projects', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      detailed_description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      goal_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      current_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      start_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      end_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('DRAFT', 'ACTIVE', 'PENDING', 'COMPLETED', 'ARCHIVED'),
        allowNull: false,
        defaultValue: 'draft',
      },
      featured_image: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      category_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'categories',
          key: 'id',
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
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
    await queryInterface.addIndex('projects', ['category_id'], {
      name: 'idx_projects_category_id',
    });

    await queryInterface.addIndex('projects', ['status'], {
      name: 'idx_projects_status',
    });

    await queryInterface.addIndex('projects', ['start_date'], {
      name: 'idx_projects_start_date',
    });

    await queryInterface.addIndex('projects', ['end_date'], {
      name: 'idx_projects_end_date',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('projects');
    await queryInterface.dropTable('categories');
  },
};
