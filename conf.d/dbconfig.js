"use strict";

var fs        = require("fs");
var path      = require("path");
var Sequelize = require("sequelize");
var env       = process.env.NODE_ENV || "development";
var config    = require(path.join(__dirname, '..', 'config', 'config.json'))[env];
var sequelize = new Sequelize(config.database, config.username, config.password, config);
const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

//Models/tables
db.login = require('../models/login.js')(sequelize, Sequelize);
db.cdr = require('../models/cdr.js')(sequelize, Sequelize);

module.exports = db;
