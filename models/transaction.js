const { Sequelize } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
            id: {
                type: Sequelize.STRING,
                primaryKey: true,
                autoIncrement: false,
            },
            action: {type:Sequelize.STRING},
            amount: {type:Sequelize.STRING},
            created: {type:Sequelize.STRING}
    };

    const options = {
        timestamps: false,  
        define: {
            charset: 'utf8',
            collate: 'utf8_general_ci'
          },
    };

    return sequelize.define('transaction', attributes, options);
}