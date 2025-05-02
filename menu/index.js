'use strict'

const routes = [
  require('./account'),
  require('./ahadu'),
  require('./balance'),
  require('./dashboard'),
  require('./owntransfer'),
  require('./register'),
  require('./service'),
  require('./telebirr'),
  require('./transfer'),
];

module.exports = function router(axios,intel,log,jsonCache) {
  return routes.forEach((route) => {
    route(axios,intel,log,jsonCache);
  });
  
};
