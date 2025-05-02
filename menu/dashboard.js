const e = require("express");

var exports = (module.exports = {});
const configs = require("../conf.d"),
  server = require("./../ussd"),
  model = require("../models/customer"),
  accountlogic = require("../controllers/account"),
  serverConfig = configs.getServerConfig(),
  lang = require("../conf.d/language.json"),
  intel = configs.apiConfig(),
  ussd = server.init(serverConfig),
  appServer = ussd.app,
  jsonCache = ussd.jsonCache,
  log = ussd.log,
  http = ussd.http;

exports.dashboard = async function (mobile, msg) {
  let menu = await jsonCache.get(mobile);
  console.log({ menu });
  let local = menu.local;
  let accList = await accountlogic.accountList(mobile);
  console.log({ accList });
  log.info(accList);
  if (accList.errorCode === "0") {
    menu.accounts = accList.accounts;
    menu.permissions = accList.permissions;
  }
  let customerRecord = await model.customerInformation(mobile);
  console.log("customerRecord.status", { customerRecord });
  log.info(customerRecord);
  let registerCustomer = await model.getRegisterCustomer(mobile);
  log.info(customerRecord);
  if (!registerCustomer.status) {
    registerCustomer = {
      data: [
        {
          id: null,
          mobile: null,
          customerName: null,
          mpin: null,
          city: null,
          status: null,
        },
      ],
      status: null,
    };
  }
  log.info(`${mobile} is registration status is  ${customerRecord.status}`);
  console.log("!accList.errorCode", !accList.errorCode);
  if (!accList.errorCode) {
    menu.action = "end";
    menu.message = lang[local].systemError;
  } else if (
    msg === "continue" &&
    registerCustomer.data[0].status === "NOACCOUNT" &&
    !menu.accounts
  ) {
    menu.action = "end";
    menu.message =
      lang[local].hello +
      `${registerCustomer.data[0].customerName} \n` +
      lang[local].accountOpening;
  } else if (
    menu.accounts &&
    msg === "continue" &&
    customerRecord.status === 0
  ) {
    menu.state = "home";
    menu.message = lang[local].welcome + lang[local].home;
    console.log("menu.state", menu.state);
  } else if (
    menu.accounts &&
    msg === "continue" &&
    customerRecord.status != 0
  ) {
    menu.state = "dashboard";
    log.info(customerRecord.status);
    menu.message =
      lang[local].welcome +
      `${mobile} ` +
      lang[local].notregister +
      lang[local].registerAction;
    console.log("menu.state", menu.state);
  } else if (menu.accounts && msg === "1" && !customerRecord.status) {
    menu.state = "register";
    menu.menu = "account";
    menu.message = lang[local].myAccount;
  } else if (!menu.accounts && msg === "continue") {
    menu.state = "dashboard";
    menu.message =
      lang[local].thankYou +
      lang[local].notMember +
      ` ${mobile}` +
      lang[local].registerAction;
  } else if (!menu.accounts && msg === "1") {
    menu.state = "signup";
    menu.menu = "name";
    menu.message = lang[local].fullName;
  } else if (msg === "0") {
    menu.state = "dashboard";
    menu.action = "end";
    menu.message = lang[local].thankYou + lang[local].comeAgain;
  }
  // }else {
  // 	menu.action ='end';
  // 	menu.message =lang[local].welcome +  lang[local].welcomeUser
  // }
  return menu;
};
