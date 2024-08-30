'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('shareposts','recipient_user_id',{
      type:Sequelize.UUID,
      allowNull:true,
      references:{
        model: 'users',
        key: 'id'
      },
      field:'recipient_user_id'
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('shareposts', 'recipient_user_id');
  }
};
