const Sequelize = require('sequelize');

const connection = new Sequelize('consultorio', 'root', '58545256jj',{
    host: 'localhost',
    dialect: 'mysql'
})

module.exports = connection;