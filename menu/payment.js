var exports = (module.exports = {});
const configs = require("../conf.d"),
  server = require("./../ussd"),
  db = require("../_util/user"),
  lang = require("../conf.d/language.json"),
  model = require("../models/customer"),
  accountlogic = require("../controllers/account"),
  serverConfig = configs.getServerConfig(),
  paramter = configs.getParamters(),
  intel = configs.apiConfig(),
  ussd = server.init(serverConfig),
  appServer = ussd.app,
  jsonCache = ussd.jsonCache,
  log = ussd.log,
  http = ussd.http;

exports.payment = async function (mobile, msg) {
  var menu = await jsonCache.get(mobile);
  let local = menu.local;
  console.log({ payment: menu });
  if (msg === "*") {
    switch (menu.menu) {
      case "payment":
        menu.state = "service";
        menu.message = lang[local].service;
        break;
      case "list":
        menu.menu = "payment";
        menu.message = lang[local].continue + `1. ${lang[local].Membership}`;
        break;

      case "passanger":
        if (menu.permissions.length > 1) {
          var message = lang[local].sourceAccount;
          for (let index = 0; index < menu.permissions.length; index++) {
            let AccountId = menu.permissions[index];
            var number = index + 1;
            message += `${number}. ${AccountId} \n`;
          }
          message += lang[local].back;
          menu.menu = "list";
          menu.message = message;
        } else {
          menu.menu = "payment";
          menu.message = lang[local].continue + `1. ${lang[local].Membership}`;
        }
        break;
      case "location":
        menu.menu = "passanger";
        menu.message =
          lang[local].Membership +
          lang[local].enterNoOfPassengers +
          lang[local].back;
        break;
      case "confrim":
        menu.menu = "location";
        menu.message =
          lang[local].Membership + lang[local].pickUpAddress + lang[local].back;
        break;
    }
  } else if (msg === "9") {
    menu.state = "service";
    menu.message = lang[local].service;
  } else {
    switch (menu.menu) {
      case "payment":
        if (msg === "1") {
          if (menu.permissions.length === 0) {
            menu.action = "end";
            menu.message = lang[local].notAllowed;
          } else if (Number(menu.permissions.length) === 1) {
            menu.index = 1;
            menu.menu = "passanger";
            menu.fromAccount = menu.permissions[0];
            menu.message =
              lang[local].Membership +
              lang[local].enterNoOfPassengers +
              lang[local].back;
          } else {
            var message = lang[local].continue;
            let accountList = [];
            for (let index = 0; index < menu.permissions.length; index++) {
              let AccountId = menu.permissions[index];
              var lastSeven = AccountId.slice(-8);
              var number = index + 1;
              message += `${number}. ${AccountId} \n`;
            }
            log.info(accountList);
            message += "*. back";
            menu.menu = "list";
            menu.message = message;
          }
        } else {
          menu.message =
            lang[local].retry +
            `1. ${lang[local].Membership} ${lang[local].back}`;
        }
        break;
      case "list":
        if (msg > 0 && msg <= menu.permissions.length) {
          menu.fromAccount = menu.permissions[msg - 1];
          menu.menu = "passanger";
          menu.message =
            lang[local].Membership +
            lang[local].enterNoOfPassengers +
            lang[local].back;
        } else {
          var message = lang[local].retry + lang[local].continue;
          let accountList = [];
          for (let index = 0; index < menu.permissions.length; index++) {
            let AccountId = menu.permissions[index];
            var number = index + 1;
            message += `${number}. ${AccountId} \n`;
          }
          log.info(accountList);
          message += lang[local].back;
          menu.menu = "list";
          menu.message = message;
        }
        break;
      case "passanger":
        if (Number.isInteger(Number(msg)) && msg != "0") {
          let balance = await accountlogic.accountDetails(
            mobile,
            menu.fromAccount
          );
          if (balance.data) {
            menu.balance = balance.data.AvailableBalance;
          } else {
            menu.action = "end";
            menu.message = lang[local].systemError;
          }
          menu.amount = Number(msg) * Number(paramter.ticketPrice);
          menu.isReset = msg;
          if (Number(menu.amount) > Number(menu.balance)) {
            menu.isReset = msg;
            menu.message =
              lang[local].Insufficient +
              lang[local].Membership +
              lang[local].enterNoOfPassengers +
              lang[local].back;
          } else if (Number(menu.amount) < Number(menu.balance)) {
            menu.menu = "location";
            menu.message =
              lang[local].Membership +
              lang[local].pickUpAddress +
              lang[local].back;
          }
        } else {
          menu.message =
            lang[local].retry +
            lang[local].Membership +
            lang[local].enterNoOfPassengers +
            lang[local].back;
        }
        break;
      case "location":
        if (/^[A-Za-z_ ]*$/.test(msg)) {
          menu.menu = "confrim";
          menu.remark = msg;
          menu.message =
            `${lang[local].request} ${menu.amount}  ${lang[local].etb} \n` +
            `${lang[local].to} : ${lang[local].Membership}` +
            `${lang[local].noOfPassenger} : ${menu.isReset} \n` +
            `${lang[local].pickUpPoint} : ${menu.remark} \n ` +
            lang[local].confirm;
        } else {
          menu.message =
            lang[local].retry +
            lang[local].Membership +
            lang[local].pickUpAddress +
            lang[local].back;
        }
        break;
      case "confrim":
        if (msg === "1") {
          menu.remark = ` ${menu.isReset} ${lang[local].traveler}`;
          let utilityType = "MKUTD";
          transferResponse = await accountlogic.UtilityPay(
            mobile,
            menu.amount,
            menu.fromAccount,
            menu.remark,
            utilityType
          );

          menu.menu = "done";

          if (transferResponse.status === "0") {
            log.info(transferResponse);
            menu.action = "end";
            menu.message = lang[local].transferDone;
          } else {
            menu.action = "end";
            menu.message = lang[local].transferFailed;
          }
        } else if (msg === "0") {
          menu.action = "end";
          menu.message = lang[local].cancel;
        } else {
          menu.message =
            `${lang[local].request} ${menu.amount}  ${lang[local].etb} \n` +
            `${lang[local].to} : ${lang[local].Membership}` +
            `${lang[local].noOfPassenger} : ${menu.isReset} \n` +
            `${lang[local].pickUpPoint} : ${menu.remark} \n ` +
            lang[local].confirm;
        }
        break;
    }
  }
  return menu;
};
