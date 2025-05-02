var exports = (module.exports = {});
const configs = require("../conf.d"),
  server = require("./../ussd"),
  lang = require("../conf.d/language.json"),
  intelect = require("../controllers/account"),
  model = require("../models/customer"),
  intelectBalance = require("../controllers/balance"),
  accountlogic = require("../controllers/account"),
  minilogic = require("../controllers/miniStatment"),
  moment = require("moment"),
  serverConfig = configs.getServerConfig(),
  intel = configs.apiConfig(),
  ussd = server.init(serverConfig),
  appServer = ussd.app,
  jsonCache = ussd.jsonCache,
  log = ussd.log,
  http = ussd.http;

exports.services = async function (mobile, msg) {
  let menu = await jsonCache.get(mobile);
  let local = menu.local;
  if (msg === "*") {
    menu.state = "service";
    menu.prestate = "dashboard";
    menu.message = lang[local].service;
  } else if (Number(msg) === 1) {
    if (Number(menu.accounts.length) === 1) {
      menu.fromAccount = menu.accounts[0];
      let accountDetail = await accountlogic.accountDetails(
        mobile,
        menu.fromAccount
      );
      log.info(accountDetail);
      if (accountDetail.data) {
        menu.state = "saving";
        menu.menu = "saving";
        menu.index = 1;
        menu.message =
          ` \n${accountDetail.data.AccountHolderName}\n` +
          `${lang[local].balance}  ${accountDetail.data.AvailableBalance} ${lang[local].etb} \n` +
          lang[local].back;
      } else {
        menu.action = "end";
        menu.message = lang[local].systemError;
      }
    } else {
      var message = lang[local].continue;
      let accountList = [];
      for (let index = 0; index < menu.accounts.length; index++) {
        let AccountId = menu.accounts[index];
        var lastSeven = AccountId.slice(-8);
        var number = index + 1;
        message += `${number}. ${AccountId} \n`;
      }
      log.info(accountList);
      message += lang[local].back;
      menu.state = "accountListForSaving";
      menu.prestate = "service";
      menu.message = message;
    }
  } else if (Number(msg) === 2) {
    menu.state = "transfer";
    menu.prestate = "service";
    if (menu.permissions.length === 0) {
      menu.action = "end";
      menu.message = lang[local].notAllowed;
    } else if (menu.permissions.length === 1) {
      menu.index = 1;
      menu.message = lang[local].twoTransferService + lang[local].back;
    } else {
      menu.message = lang[local].threeTransferService + lang[local].back;
    }
  } else if (Number(msg) === 3) {
    // menu.message =`${lang[local].airtimeMenu} \n`
    // menu.menu = 'list'
    // menu.state ='airvendor';
    menu.state = "eairtime";
    if (menu.permissions.length === 1) {
      menu.fromAccount = menu.permissions[0];
      let balance = await accountlogic.accountDetails(mobile, menu.fromAccount);
      if (balance.data) {
        menu.balance = balance.data.AvailableBalance;
        menu.message =
          lang[local].eairtime +
          `${lang[local].fromAccount} ${menu.fromAccount}\n ${lang[local].stopupMobile} ${lang[local].back}`;
      } else {
        menu.action = "end";
        menu.message = lang[local].systemEror;
      }
      menu.menu = "mobile";
      menu.step = "own";
    } else if (menu.permissions.length > 1) {
      var message = lang[local].continue;
      menu.step = "own";
      menu.menu = "list";
      for (let index = 0; index < menu.permissions.length; index++) {
        let AccountId = menu.permissions[index];
        var number = index + 1;
        message += `${number}. ${AccountId} \n`;
      }
      message += lang[local].back;
      menu.message = message;
    }
  } else if (Number(msg) === 43) {
    menu.state = "payment";
    menu.prestate = "service";
    menu.menu = "payment";
    menu.message =
      lang[local].continue + `1. ${lang[local].Membership}` + lang[local].back;
  } else if (msg === "4") {
    if (Number(menu.accounts.length) === 1) {
      menu.fromAccount = menu.accounts[0];
      let miniSInquery = await minilogic.miniStatmentInquery(
        mobile,
        menu.fromAccount
      );

      if (miniSInquery.errorCode === 0) {
        menu.state = "mini";
        menu.menu = "mini";
        menu.index = 1;
        let message = lang[local].miniStatment;
        for (let index = 0; index < miniSInquery.Records.length; index++) {
          var number = index + 1;
          log.info(miniSInquery.Records[index]);
          var action = miniSInquery.Records[index].TransactionDebitAmount;
          if (miniSInquery.Records[index].TransactionCreditAmount != 0) {
            var amount = miniSInquery.Records[index].TransactionCreditAmount;
            action = lang[local].credit;
          } else {
            action = lang[local].debit;
            var amount = miniSInquery.Records[index].TransactionDebitAmount;
          }
          let date = miniSInquery.Records[index].TransactionDate;
          message += `${number}.  ${date.substr(0, 5)} ${amount} ${action} \n`;
        }
        message += lang[local].back;
        menu.message = message;
        log.info(message);
      } else {
        menu.action = "end";
        menu.message = lang[local].systemError;
      }
    } else {
      var message = lang[local].continue;
      let accountList = [];
      for (let index = 0; index < menu.accounts.length; index++) {
        let AccountId = menu.accounts[index];
        var number = index + 1;
        message += `${number}. ${AccountId} \n`;
      }
      log.info(accountList);
      message += lang[local].back;
      menu.state = "accountListForMiniStatement";
      menu.prestate = "service";
      menu.message = message;
    }
  } else if (Number(msg) === 5) {
    menu.message = `${lang[local].currentPin} \n` + lang[local].back;
    menu.menu = "current";
    menu.state = "changePin";
    console.log("changePIN");
  } else if (Number(msg) === 6) {
    menu.message = `${lang[local].pnrNumber} \n`;
    menu.menu = "checkPNR";
    menu.state = "airTicket";
  } else if (Number(msg) === 7) {
    //School fee payment option

    // Check permissions or accounts available for school fee payment
    if (menu.accounts.length === 0) {
      menu.action = "end";
      menu.message = lang[local].notAllowed;
    } else if (menu.accounts.length === 1) {
      menu.index = 1;
      menu.state = "schoolPayment";
      menu.prestate = "service";
      menu.menu = "listSchools";
      // menu.message = `${lang[local].payNow} \n${lang[local].back}`;
      menu.message = `${index}. ${menu.accounts} \n${lang[local].back}`;
    } else {
      var message = lang[local].continue;
      menu.accounts.forEach((AccountId, index) => {
        let number = index + 1;
        message += `${number}. ${AccountId} \n`;
      });
      message += lang[local].back;
      menu.state = "schoolPayment";
      menu.prestate = "service";
      menu.menu = "listSchools";
      menu.message = message;
    }
  } else if (Number(msg) === 8) {
    //School fee payment option

    // Check permissions or accounts available for school fee payment
    if (menu.accounts.length === 0) {
      menu.action = "end";
      menu.message = lang[local].notAllowed;
    } else if (menu.accounts.length === 1) {
      menu.index = 1;
      menu.state = "uniCashPayment";
      menu.prestate = "service";
      menu.menu = "startUnicash";
      // menu.message = `${lang[local].payNow} \n${lang[local].back}`;
      menu.message = `${index}. ${menu.accounts} \n${lang[local].back}`;
    } else {
      var message = lang[local].continue;
      menu.accounts.forEach((AccountId, index) => {
        let number = index + 1;
        message += `${number}. ${AccountId} \n`;
      });
      message += lang[local].back;
      menu.state = "uniCashPayment";
      menu.prestate = "service";
      menu.menu = "startUnicash";
      menu.message = message;
    }
  } else {
    menu.state = "service";
    menu.message = lang[local].retry + lang[local].service;
  }
  return menu;
};
