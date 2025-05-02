const configs = require(`./config.${process.env.NODE_ENV || "dev"}`);

module.exports.getDatabaseConfig = function () {
    return configs.database;
}

module.exports.getServerConfig = function () {
    return configs.server;
}

module.exports.getParamters = function () {
    return configs.getParamters;
}

module.exports.institution = function () {
    return configs.institution;
}

module.exports.apiConfig = function () {
    return configs.api;
}

