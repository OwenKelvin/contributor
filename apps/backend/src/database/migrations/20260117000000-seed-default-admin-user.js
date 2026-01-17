'use strict';
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const adminUserId = uuidv4();
    const hashedPassword = await bcrypt.hash('Admin@123', 10);

    // Get the admin role ID
    const [adminRole] = await queryInterface.sequelize.query(
      `SELECT id FROM roles WHERE name = 'admin' LIMIT 1;`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (!adminRole) {
      throw new Error('Admin role not found. Please run role migrations first.');
    }

    // Insert default admin user
    await queryInterface.bulkInsert('users', [
      {
        id: adminUserId,
        email: 'admin@admin.com',
        password: hashedPassword,
        first_name: 'Admin',
        last_name: 'User',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // Assign admin role to the user
    await queryInterface.bulkInsert('user_roles', [
      {
        user_id: adminUserId,
        role_id: adminRole.id,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    // Remove the admin user and their role assignment
    await queryInterface.bulkDelete('users', {
      email: 'admin@admin.com',
    });
  },
};
