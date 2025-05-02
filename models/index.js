"use strict";

var fs        = require("fs");
var path      = require("path");
var Sequelize = require("sequelize");
var config    = require(path.join(__dirname, '..', '/conf.d', 'conf.json'))['db'];
var sequelize = new Sequelize(config.database, config.username, config.password,{
    host: config.hostname,
    dialect: 'mysql',
    logging: false,
    freezeTableName: true
  } );

const db = {
  protocol: null
};
db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.Op = Sequelize.Op;

db.sequelize.sync().then(function(){
  console.log('Database looks fine!')
  
  }).catch(function(err){
  console.log(err,"Something went wrong with the Database Update!")
  });

db.value =sequelize
const Op = Sequelize.Op;
db.User = require('./user')(sequelize, Sequelize);
db.Session = require('./session')(sequelize, Sequelize);
db.Transaction = require('./transaction')(sequelize, Sequelize);
db.Session.belongsTo(db.User, {  onDelete: 'RESTRICT', onUpdate: 'RESTRICT',allowNull: true });
db.Transaction.belongsTo(db.User, {  onDelete: 'RESTRICT', onUpdate: 'RESTRICT',allowNull: true });
module.exports = db;
