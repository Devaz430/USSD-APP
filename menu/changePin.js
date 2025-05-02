var exports = (module.exports = {});
const configs = require("../conf.d"),
  server = require("./../ussd"),
  lang = require("../conf.d/language.json"),
  db = require("../_util/user"),
  accountlogic = require("../controllers/account"),
  mpinlogic = require("../controllers/mpin"),
  serverConfig = configs.getServerConfig(),
  intel = configs.apiConfig(),
  ussd = server.init(serverConfig),
  appServer = ussd.app,
  jsonCache = ussd.jsonCache,
  log = ussd.log,
  http = ussd.http;

exports.changePin = async function (mobile, msg) {
  var menu = await jsonCache.get(mobile);
  let local = menu.local;

  switch (menu.menu) {
    case "current":
      console.log("current");
      let customerAccount = await accountlogic.linkAccount(
        mobile,
        menu.accounts[0]
      );
      menu.customerNo = customerAccount.data.customerNo;
      let verifyCustomer = await mpinlogic.verifyMPin(
        mobile,
        menu.customerNo,
        msg
      );
      if (verifyCustomer.responseCode === 0) {
        menu.menu = "setpin";
        menu.isReset = msg;
        menu.message = lang[local].newPin;
      } else {
        menu.message = lang[local].invalidPin + lang[local].currentPin;
      }
      break;
    case "setpin":
      console.log("setpin");

      var last = mobile.slice(-4);
      if (msg.length !== 4 && Number(msg) !== Number(last)) {
        menu.menu = "setpin";
        menu.message = lang[local].pinDigit + lang[local].newPin;
      } else if (msg === "0000" && msg.length === 4) {
        menu.menu = "setpin";
        menu.message = lang[local].weekPin + lang[local].newPin;
      } else if (msg.length === 4 && Number(msg) === Number(last)) {
        menu.menu = "setpin";
        menu.message = lang[local].pinUsingMobileNumber + lang[local].newPin;
      } else if (
        msg.length === 4 &&
        /^[0-9]+$/.test(msg) &&
        Number(msg) != Number(last)
      ) {
        menu.newPin = msg;
        menu.menu = "verify";
        menu.message = lang[local].verifyChangePin;
      } else {
        menu.menu = "setpin";
        menu.message = lang[local].pinDigit + lang[local].newPin;
      }

      break;
    case "verify":
      if (menu.newPin === null) {
        var last = mobile.slice(-4);
        if (msg.length !== 4 && Number(msg) !== Number(last)) {
          menu.menu = "verify";
          menu.message = lang[local].pinDigit + lang[local].verifyChangePin;
        } else if (msg.length === 4 && Number(msg) === Number(last)) {
          menu.menu = "verify";
          menu.message =
            lang[local].pinUsingMobileNumber + lang[local].verifyChangePin;
        } else if (
          msg.length === 4 &&
          /^[0-9]+$/.test(msg) &&
          Number(msg) != Number(last)
        ) {
          menu.newPin = msg;
          menu.menu = "verify";
          menu.message = lang[local].verifyChangePin;
        } else {
          menu.menu = "verify";
          menu.message = lang[local].pinDigit + lang[local].verifyChangePin;
        }
      } else if (menu.newPin != null) {
        if (Number(menu.newPin) === Number(msg)) {
          let mpinResponse = await mpinlogic.changeMPin(
            mobile,
            menu.isReset,
            msg,
            menu.customerNo
          );
          log.info(mpinResponse);
          if (mpinResponse.responseCode === 0) {
            menu.action = "end";
            menu.message = lang[local].changePinOk;
          } else {
            menu.action = "end";
            menu.message = lang[local].systemError;
          }
        } else {
          menu.menu = "verify";
          menu.message = lang[local].verifyFail + lang[local].verifyChangePin;
        }
      }
      break;
    default:
      menu.action = "end";
      menu.message = `Invalid input,please retry`;
      break;
  }
  return menu;
};
