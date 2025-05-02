const e = require("express");

var exports = (module.exports = {});
const configs = require("../conf.d"),
  server = require("./../ussd"),
  model = require("../models/customer"),
  serverConfig = configs.getServerConfig(),
  accountlogic = require("../controllers/account"),
  lang = require("../conf.d/language.json"),
  intelect = require("../controllers/account"),
  mpinlogic = require("../controllers/mpin"),
  mpin = require("../controllers/mpin"),
  intel = configs.apiConfig(),
  ussd = server.init(serverConfig),
  appServer = ussd.app,
  jsonCache = ussd.jsonCache,
  log = ussd.log,
  http = ussd.http;

exports.login = async function (mobile, msg) {
  var menu = await jsonCache.get(mobile);

  let local = menu.local;

  let customerAccount = await accountlogic.linkAccount(
    mobile,
    menu.accounts[0]
  );
  console.log({ customerAccount });
  let customerNo = customerAccount.data.customerNo;
  let verifyCustomer = await mpinlogic.verifyMPin(mobile, customerNo, msg);
  log.info(verifyCustomer);
  console.log({ verifyCustomer });
  if (verifyCustomer.responseCode === 0) {
    menu.state = "service";
    menu.prestate = "dashboard";
    menu.message =
      mobile == "251969788809" ? lang[local].serviceMenu : lang[local].service;
  } else {
    menu.state = "login";
    menu.message = lang[local].invalidPin + lang[local].login;
  }
  return menu;
};
