const Sequelize = require('sequelize');
const connection = require('./database');

const Paciente = connection.define('Paciente',{
    nome:{
        type: Sequelize.STRING,
        allowNull: false
    },
    tipo:{
        type:Sequelize.STRING,
        allowNull: false
    },
    sintoma:{
        type: Sequelize.STRING,
        allowNull: false
    }
});

Paciente.sync({force: false}).then(()=>{});

module.exports = Paciente;