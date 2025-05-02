const { Sequelize } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
            id: {
                type: Sequelize.STRING,
                primaryKey: true,
                autoIncrement: false,
            },
            customerName: {type:Sequelize.STRING},
            pin: {type:Sequelize.INTEGER,defaultValue: 0},
            amount: {type:Sequelize.STRING},
            accountNumber: {type:Sequelize.STRING},
            lastdate: {type:Sequelize.DATE},
            isRegistered:  { type: Sequelize.BOOLEAN,defaultValue: false},
            reset:  { type: Sequelize.BOOLEAN,defaultValue: false},
            isReset:  { type: Sequelize.BOOLEAN,defaultValue: false},
    };

    const options = {
        timestamps: false,  
        define: {
            charset: 'utf8',
            collate: 'utf8_general_ci'
          },
    };

    return sequelize.define('user', attributes, options);
}