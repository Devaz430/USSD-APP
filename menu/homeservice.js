const e = require("express");

var exports = (module.exports = {});
const configs = require("../conf.d"),
  server = require("./../ussd"),
  serverConfig = configs.getServerConfig(),
  lang = require("../conf.d/language.json"),
  intel = configs.apiConfig(),
  ussd = server.init(serverConfig),
  appServer = ussd.app,
  jsonCache = ussd.jsonCache,
  log = ussd.log,
  http = ussd.http;

exports.homeservice = async function (mobile, msg) {
  var menu = await jsonCache.get(mobile);
  console.log({ menu });
  let local = menu.local;

  if (msg === "1") {
    menu.state = "login";
    menu.message = lang[local].login;
  } else if (msg === "2") {
    menu.state = "reset";
    menu.menu = "account";
    menu.message = lang[local].myAccount;
  } else {
    menu.message = lang[local].retry + lang[local].welcome + lang[local].home;
  }
  return menu;
};
