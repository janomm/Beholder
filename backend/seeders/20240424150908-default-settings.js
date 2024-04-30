'use strict';
require('dotenv').config();
const bcrypt = require('bcryptjs');
const crypto = require('../src/utils/crypto');




/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const settingsId = await queryInterface.rawSelect('settings', { where: {}, limit: 1 }, ['id']);
    if (!settingsId) {
      return queryInterface.bulkInsert('settings', [{
        email: 'contato@julliano.com.br',
        password: bcrypt.hashSync('123456'),
        apiUrl: 'https://testnet.binance.vision/api/',
        streamUrl: 'https://testnet.binance.vision/api/',
        accessKey: 'JxdmPdZjdlp8vpqOwr7Bltauzh5BlBBuwyMhjRp4CLVYeXYR1ApWi5Bddu10Rixi',
        secretKey: crypto.encrypt('8lzycRu2lME2Pl2QiQmcArStUZXO2MYhuOpQPimacfduh34Aj4Rx3Ecav87GrPHE'),
        createdAt: new Date(),
        updatedAt: new Date()
      }])
    }
  },
  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('settings', null, {});
  }
};
