require('dotenv').config();

const { Sequelize } = require('sequelize');
const pg = require('pg');

const sequelize = new Sequelize(process.env.POSTGRES_DATABASE, process.env.POSTGRES_USER, process.env.POSTGRES_PASSWORD, {
  host: process.env.POSTGRES_HOST,
  port: 5432,
  dialect: 'postgres',
  dialectModule: pg,
  logging: false 
});

(async () => {
  try {
    await sequelize.authenticate();
    console.log('>> db ok');
  } catch (e) {
    console.error('>> db err: ' + e);
  }
})();

module.exports = sequelize;
