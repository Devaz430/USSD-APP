var exports = (module.exports = {});
const configs = require("../conf.d"),
  server = require("./../ussd"),
  serverConfig = configs.getServerConfig(),
  intel = configs.apiConfig(),
  ussd = server.init(serverConfig),
  lang = require("../conf.d/language.json"),
  model = require("../models/customer"),
  mpinlogic = require("../controllers/mpin"),
  accountlogic = require("../controllers/account"),
  moment = require("moment"),
  appServer = ussd.app,
  jsonCache = ussd.jsonCache,
  log = ussd.log,
  http = ussd.http;

exports.register = async function (mobile, msg) {
  var menu = await jsonCache.get(mobile);
  let local = menu.local;
  switch (menu.menu) {
    case "account":
      if (msg.length === 13) {
        console.log("from register stage", msg);
        let customerAccount = await accountlogic.linkAccount(mobile, msg);
        if (customerAccount.status === "0") {
          menu.id = customerAccount.data.customerNo;
          let accountDetail = await accountlogic.accountDetails(mobile, msg);
          menu.fromAccount = msg;
          menu.menu = "dob";
          menu.customerName = accountDetail.data.AccountHolderName;
          menu.message =
            lang[local].hello + ` ${menu.customerName} \n` + lang[local].dob;
        } else {
          menu.action = "end";
          menu.message = lang[local].systemError;
        }
      } else {
        menu.menu = "account";
        menu.message = lang[local].invalidAccount + lang[local].myAccount;
      }
      break;
    case "dob":
      if (msg.length === 10) {
        let dob = await accountlogic.dob(menu.fromAccount);
        console.log(dob);
        if (dob.errorCode === "1") {
          menu.customerDob = moment(msg, "DD/MM/YYYY").format("YYYY-MM-DD");
          let customerDob = moment(dob.limit.BIRTH_DATE).format("YYYY-MM-DD");

          if (customerDob === menu.customerDob) {
            menu.dob = msg;
            menu.menu = "setpin";
            menu.message = lang[local].setPin;
          } else {
            menu.message = lang[local].wrongDob;
          }
        } else {
          menu.message = lang[local].wrongDob;
        }
      } else {
        menu.message = lang[local].wrongDob;
      }
      break;
    case "setpin":
      if (menu.newPin === null) {
        var last = mobile.slice(-4);
        if (msg.length !== 4 && Number(msg) !== Number(last)) {
          menu.menu = "setpin";
          menu.message = lang[local].pinMustBeFourDigit + lang[local].setPin;
        } else if (msg === "0000" && msg.length === 4) {
          menu.menu = "setpin";
          menu.message = lang[local].unSupportedPin + lang[local].setPin;
        } else if (
          (msg.length === 4 && Number(msg) === Number(last)) ||
          msg === "0000" ||
          msg === "1234"
        ) {
          menu.menu = "setpin";
          menu.message = lang[local].weekPin + lang[local].setPin;
        } else if (
          msg.length === 4 &&
          /^[0-9]+$/.test(msg) &&
          Number(msg) != Number(last)
        ) {
          menu.newPin = msg;
          menu.menu = "verify";
          menu.message = lang[local].verify;
        } else {
          menu.menu = "setpin";
          menu.message = lang[local].onlyFourDigit + lang[local].setPin;
        }
      }
      break;
    case "verify":
      if (menu.newPin === null) {
        var last = mobile.slice(-4);
        if (msg.length !== 4 && Number(msg) !== Number(last)) {
          menu.menu = "verify";
          menu.message = lang[local].pinDigit + lang[local].newPin;
        } else if (msg.length === 4 && Number(msg) === Number(last)) {
          menu.menu = "verify";
          menu.message = lang[local].lastfour + lang[local].newPin;
        } else if (
          msg.length === 4 &&
          /^[0-9]+$/.test(msg) &&
          Number(msg) != Number(last)
        ) {
          menu.newPin = msg;
          menu.menu = "verify";
          menu.message = lang[local].verify;
        } else {
          menu.menu = "verify";
          menu.message = lang[local].pinDigit + +lang[local].newPin;
        }
      } else if (Number(menu.newPin) === Number(msg)) {
        menu.menu = "verify";
        menu.confirm = msg;
        let addUser = await mpinlogic.addUser(
          mobile,
          menu.customerName,
          menu.id
        );
        log.info(addUser);
        let mpinResponse = await mpinlogic.setMPin(mobile, msg, menu.id);
        if (mpinResponse.responseCode === 0) {
          let linkAccount = await model.linkAccount(
            mobile,
            menu.customerName,
            menu.id,
            menu.fromAccount
          );
          log.info(linkAccount);
          menu.action = "end";
          menu.message =
            lang[local].hello +
            ` ${menu.customerName},\n` +
            lang[local].registrationOk;
        } else {
          menu.action = "end";
          menu.message = lang[local].systemError;
        }
      } else {
        menu.menu = "verify";
        menu.message = lang[local].verifyFail + lang[local].verify;
      }
      break;
  }
  return menu;
};
