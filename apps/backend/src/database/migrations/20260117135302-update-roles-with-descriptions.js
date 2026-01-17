'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Update existing roles with descriptions
    await queryInterface.sequelize.query(`
      UPDATE roles 
      SET description = CASE 
        WHEN name = 'admin' THEN 'Full system access with all administrative privileges'
        WHEN name = 'client' THEN 'Regular user access for clients and contributors'
        ELSE 'Standard user role'
      END
      WHERE description IS NULL;
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // Remove descriptions from roles
    await queryInterface.sequelize.query(`
      UPDATE roles SET description = NULL;
    `);
  }
};
